import { Response } from 'express';
import prisma from '../config/database';
import {
  successResponse,
  errorResponse,
  calculatePagination,
  isValidDateRange,
  doDateRangesOverlap,
} from '../utils/helpers';
import { AuthRequest, CreateShiftDTO, UpdateShiftDTO, ShiftQueryParams } from '../types';
import { UserRole, ShiftStatus } from '@prisma/client';

/**
 * Create shift
 */
export const createShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated', 'Authentication required'));
      return;
    }

    const { title, description, startTime, endTime, location, notes, rosterId, assignedUserId }: CreateShiftDTO =
      req.body;

    // Validate date range
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (!isValidDateRange(start, end)) {
      res.status(400).json(errorResponse('Invalid time range', 'Start time must be before end time'));
      return;
    }

    // Check if roster exists and user has access
    const roster = await prisma.roster.findUnique({
      where: { id: rosterId },
    });

    if (!roster) {
      res.status(404).json(errorResponse('Roster not found', 'Roster does not exist'));
      return;
    }

    if (roster.companyId !== req.user.companyId) {
      res.status(403).json(errorResponse('Access denied', 'You do not have access to this roster'));
      return;
    }

    // Check if assigned user exists and belongs to same company
    if (assignedUserId) {
      const user = await prisma.user.findUnique({
        where: { id: assignedUserId },
      });

      if (!user) {
        res.status(404).json(errorResponse('User not found', 'Assigned user does not exist'));
        return;
      }

      if (user.companyId !== roster.companyId) {
        res.status(400).json(errorResponse('Invalid user', 'User does not belong to the same company'));
        return;
      }

      // Check for conflicts with existing shifts
      const conflicts = await prisma.shift.findMany({
        where: {
          assignedUserId,
          status: { not: ShiftStatus.CANCELED },
          OR: [
            {
              AND: [{ startTime: { lte: start } }, { endTime: { gt: start } }],
            },
            {
              AND: [{ startTime: { lt: end } }, { endTime: { gte: end } }],
            },
            {
              AND: [{ startTime: { gte: start } }, { endTime: { lte: end } }],
            },
          ],
        },
      });

      if (conflicts.length > 0) {
        res.status(409).json(errorResponse('Shift conflict', 'User already has a shift during this time'));
        return;
      }
    }

    const shift = await prisma.shift.create({
      data: {
        title,
        description,
        startTime: start,
        endTime: end,
        location,
        notes,
        rosterId,
        assignedUserId,
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
        roster: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json(successResponse(shift, 'Shift created successfully'));
  } catch (error) {
    console.error('Create shift error:', error);
    res.status(500).json(errorResponse('Failed to create shift', 'An error occurred'));
  }
};

/**
 * Get all shifts
 */
export const getShifts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated', 'Authentication required'));
      return;
    }

    const {
      page = 1,
      limit = 50,
      rosterId,
      assignedUserId,
      startDate,
      endDate,
      status,
    }: ShiftQueryParams = req.query as any;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // For employees, only show their own shifts
    if (req.user.role === UserRole.EMPLOYEE) {
      where.assignedUserId = req.user.id;
    } else if (req.user.companyId) {
      // For admins/managers, show shifts from their company
      where.roster = {
        companyId: req.user.companyId,
      };
    }

    if (rosterId) {
      where.rosterId = rosterId;
    }

    if (assignedUserId && req.user.role !== UserRole.EMPLOYEE) {
      where.assignedUserId = assignedUserId;
    }

    if (startDate) {
      where.startTime = { gte: new Date(startDate) };
    }

    if (endDate) {
      where.endTime = { lte: new Date(endDate) };
    }

    if (status) {
      where.status = status;
    }

    const [shifts, total] = await Promise.all([
      prisma.shift.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignedUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              avatar: true,
            },
          },
          roster: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { startTime: 'asc' },
      }),
      prisma.shift.count({ where }),
    ]);

    const pagination = calculatePagination(page, limit, total);

    res.json(
      successResponse(
        {
          shifts,
          pagination,
        },
        'Shifts retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Get shifts error:', error);
    res.status(500).json(errorResponse('Failed to get shifts', 'An error occurred'));
  }
};

/**
 * Get shift by ID
 */
export const getShiftById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated', 'Authentication required'));
      return;
    }

    const { id } = req.params;

    const shift = await prisma.shift.findUnique({
      where: { id },
      include: {
        assignedUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            phone: true,
          },
        },
        roster: {
          select: {
            id: true,
            title: true,
            companyId: true,
          },
        },
      },
    });

    if (!shift) {
      res.status(404).json(errorResponse('Shift not found', 'Shift does not exist'));
      return;
    }

    // Check access
    if (
      shift.roster.companyId !== req.user.companyId &&
      shift.assignedUserId !== req.user.id
    ) {
      res.status(403).json(errorResponse('Access denied', 'You do not have access to this shift'));
      return;
    }

    res.json(successResponse(shift, 'Shift retrieved successfully'));
  } catch (error) {
    console.error('Get shift error:', error);
    res.status(500).json(errorResponse('Failed to get shift', 'An error occurred'));
  }
};

/**
 * Update shift
 */
export const updateShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated', 'Authentication required'));
      return;
    }

    const { id } = req.params;
    const updateData: UpdateShiftDTO = req.body;

    // Check if shift exists
    const existingShift = await prisma.shift.findUnique({
      where: { id },
      include: {
        roster: true,
      },
    });

    if (!existingShift) {
      res.status(404).json(errorResponse('Shift not found', 'Shift does not exist'));
      return;
    }

    // Check access
    if (existingShift.roster.companyId !== req.user.companyId) {
      res.status(403).json(errorResponse('Access denied', 'You do not have access to this shift'));
      return;
    }

    // Validate date range if both provided
    if (updateData.startTime && updateData.endTime) {
      const start = new Date(updateData.startTime);
      const end = new Date(updateData.endTime);

      if (!isValidDateRange(start, end)) {
        res.status(400).json(errorResponse('Invalid time range', 'Start time must be before end time'));
        return;
      }
    }

    // Check for conflicts if changing assigned user or times
    if (updateData.assignedUserId || updateData.startTime || updateData.endTime) {
      const userId = updateData.assignedUserId || existingShift.assignedUserId;
      const startTime = updateData.startTime ? new Date(updateData.startTime) : existingShift.startTime;
      const endTime = updateData.endTime ? new Date(updateData.endTime) : existingShift.endTime;

      if (userId) {
        const conflicts = await prisma.shift.findMany({
          where: {
            id: { not: id },
            assignedUserId: userId,
            status: { not: ShiftStatus.CANCELED },
            OR: [
              {
                AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
              },
              {
                AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
              },
              {
                AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
              },
            ],
          },
        });

        if (conflicts.length > 0) {
          res.status(409).json(errorResponse('Shift conflict', 'User already has a shift during this time'));
          return;
        }
      }
    }

    const shift = await prisma.shift.update({
      where: { id },
      data: updateData,
      include: {
        assignedUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
        roster: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json(successResponse(shift, 'Shift updated successfully'));
  } catch (error) {
    console.error('Update shift error:', error);
    res.status(500).json(errorResponse('Failed to update shift', 'An error occurred'));
  }
};

/**
 * Delete shift
 */
export const deleteShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated', 'Authentication required'));
      return;
    }

    const { id } = req.params;

    // Check if shift exists
    const shift = await prisma.shift.findUnique({
      where: { id },
      include: {
        roster: true,
      },
    });

    if (!shift) {
      res.status(404).json(errorResponse('Shift not found', 'Shift does not exist'));
      return;
    }

    // Check access
    if (req.user.role !== UserRole.SUPER_ADMIN && shift.roster.companyId !== req.user.companyId) {
      res.status(403).json(errorResponse('Access denied', 'You do not have access to this shift'));
      return;
    }

    await prisma.shift.delete({
      where: { id },
    });

    res.json(successResponse(null, 'Shift deleted successfully'));
  } catch (error) {
    console.error('Delete shift error:', error);
    res.status(500).json(errorResponse('Failed to delete shift', 'An error occurred'));
  }
};

/**
 * Assign user to shift
 */
export const assignShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated', 'Authentication required'));
      return;
    }

    const { id } = req.params;
    const { userId } = req.body;

    // Check if shift exists
    const shift = await prisma.shift.findUnique({
      where: { id },
      include: {
        roster: true,
      },
    });

    if (!shift) {
      res.status(404).json(errorResponse('Shift not found', 'Shift does not exist'));
      return;
    }

    // Check access
    if (req.user.role !== UserRole.SUPER_ADMIN && shift.roster.companyId !== req.user.companyId) {
      res.status(403).json(errorResponse('Access denied', 'You do not have access to this shift'));
      return;
    }

    // Check if user exists and belongs to same company
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json(errorResponse('User not found', 'User does not exist'));
      return;
    }

    if (user.companyId !== shift.roster.companyId) {
      res.status(400).json(errorResponse('Invalid user', 'User does not belong to the same company'));
      return;
    }

    // Check for conflicts
    const conflicts = await prisma.shift.findMany({
      where: {
        id: { not: id },
        assignedUserId: userId,
        status: { not: ShiftStatus.CANCELED },
        OR: [
          {
            AND: [{ startTime: { lte: shift.startTime } }, { endTime: { gt: shift.startTime } }],
          },
          {
            AND: [{ startTime: { lt: shift.endTime } }, { endTime: { gte: shift.endTime } }],
          },
          {
            AND: [{ startTime: { gte: shift.startTime } }, { endTime: { lte: shift.endTime } }],
          },
        ],
      },
    });

    if (conflicts.length > 0) {
      res.status(409).json(errorResponse('Shift conflict', 'User already has a shift during this time'));
      return;
    }

    const updatedShift = await prisma.shift.update({
      where: { id },
      data: { assignedUserId: userId },
      include: {
        assignedUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
        roster: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json(successResponse(updatedShift, 'Shift assigned successfully'));
  } catch (error) {
    console.error('Assign shift error:', error);
    res.status(500).json(errorResponse('Failed to assign shift', 'An error occurred'));
  }
};

