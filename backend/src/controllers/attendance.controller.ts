import { Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  AuthRequest,
  ApiResponse,
  CreateAttendanceDTO,
  UpdateAttendanceDTO,
  AttendanceResponse,
  AttendanceQueryParams,
} from '../types';

const prisma = new PrismaClient();

/**
 * Create attendance record (clock-in)
 */
export const createAttendance = async (
  req: AuthRequest,
  res: Response<ApiResponse<AttendanceResponse>>
): Promise<void> => {
  try {
    const data: CreateAttendanceDTO = req.body;
    const user = req.user!;

    // Verify shift exists and belongs to user's company
    const shift = await prisma.shift.findUnique({
      where: { id: data.shiftId },
      include: { roster: true },
    });

    if (!shift) {
      res.status(404).json({
        success: false,
        error: 'Shift not found',
      });
      return;
    }

    // Check if attendance already exists for this shift
    const existingAttendance = await prisma.attendance.findUnique({
      where: { shiftId: data.shiftId },
    });

    if (existingAttendance) {
      res.status(400).json({
        success: false,
        error: 'Attendance record already exists for this shift',
      });
      return;
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        shiftId: data.shiftId,
        userId: data.userId,
        clockIn: data.clockIn,
        clockOut: data.clockOut,
        breakDuration: data.breakDuration ? new Prisma.Decimal(data.breakDuration) : new Prisma.Decimal(0),
        notes: data.notes,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      data: attendance as any,
    });
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create attendance record',
    });
  }
};

/**
 * Get all attendance records (with filtering)
 */
export const getAttendances = async (
  req: AuthRequest,
  res: Response<ApiResponse<AttendanceResponse[]>>
): Promise<void> => {
  try {
    const user = req.user!;
    const query = req.query as unknown as AttendanceQueryParams;

    const where: any = {};

    // Filter by company (admin/manager)
    if (user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'ACCOUNTANT') {
      if (query.userId) {
        where.userId = query.userId;
      }
    } else {
      // Employees can only see their own attendance
      where.userId = user.id;
    }

    if (query.shiftId) {
      where.shiftId = query.shiftId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      where.clockIn = {};
      if (query.startDate) {
        where.clockIn.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.clockIn.lte = new Date(query.endDate);
      }
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        shift: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            location: true,
            clientName: true,
          },
        },
      },
      orderBy: { clockIn: 'desc' },
    });

    res.json({
      success: true,
      data: attendances as any,
    });
  } catch (error) {
    console.error('Get attendances error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance records',
    });
  }
};

/**
 * Get single attendance record
 */
export const getAttendanceById = async (
  req: AuthRequest,
  res: Response<ApiResponse<AttendanceResponse>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        shift: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            location: true,
            clientName: true,
          },
        },
      },
    });

    if (!attendance) {
      res.status(404).json({
        success: false,
        error: 'Attendance record not found',
      });
      return;
    }

    // Authorization check
    if (user.role === 'EMPLOYEE' && attendance.userId !== user.id) {
      res.status(403).json({
        success: false,
        error: 'Unauthorized to view this attendance record',
      });
      return;
    }

    res.json({
      success: true,
      data: attendance as any,
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance record',
    });
  }
};

/**
 * Update attendance record (clock-out or edit)
 */
export const updateAttendance = async (
  req: AuthRequest,
  res: Response<ApiResponse<AttendanceResponse>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const data: UpdateAttendanceDTO = req.body;
    const user = req.user!;

    const attendance = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      res.status(404).json({
        success: false,
        error: 'Attendance record not found',
      });
      return;
    }

    // Authorization check
    if (user.role === 'EMPLOYEE' && attendance.userId !== user.id) {
      res.status(403).json({
        success: false,
        error: 'Unauthorized to update this attendance record',
      });
      return;
    }

    const updateData: any = {};

    if (data.clockOut !== undefined) {
      updateData.clockOut = data.clockOut;
      
      // Calculate total hours if both clockIn and clockOut are present
      if (attendance.clockIn && data.clockOut) {
        const clockIn = new Date(attendance.clockIn);
        const clockOut = new Date(data.clockOut);
        const diffMs = clockOut.getTime() - clockIn.getTime();
        const totalHours = diffMs / (1000 * 60 * 60); // Convert to hours
        const breakHours = data.breakDuration || Number(attendance.breakDuration);
        updateData.totalHours = new Prisma.Decimal(totalHours - breakHours);
      }
    }

    if (data.breakDuration !== undefined) {
      updateData.breakDuration = new Prisma.Decimal(data.breakDuration);
      
      // Recalculate total hours
      if (attendance.clockIn && attendance.clockOut) {
        const clockIn = new Date(attendance.clockIn);
        const clockOut = new Date(attendance.clockOut);
        const diffMs = clockOut.getTime() - clockIn.getTime();
        const totalHours = diffMs / (1000 * 60 * 60);
        updateData.totalHours = new Prisma.Decimal(totalHours - data.breakDuration);
      }
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    if (data.status !== undefined) {
      // Only managers/admins can change status
      if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
        res.status(403).json({
          success: false,
          error: 'Only managers and admins can change attendance status',
        });
        return;
      }
      updateData.status = data.status;
      if (data.status === 'APPROVED') {
        updateData.approvedBy = user.id;
        updateData.approvedAt = new Date();
      }
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        shift: true,
      },
    });

    res.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: updated as any,
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update attendance record',
    });
  }
};

/**
 * Delete attendance record
 */
export const deleteAttendance = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    // Only admins can delete attendance records
    if (user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: 'Only admins can delete attendance records',
      });
      return;
    }

    const attendance = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      res.status(404).json({
        success: false,
        error: 'Attendance record not found',
      });
      return;
    }

    await prisma.attendance.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Attendance record deleted successfully',
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete attendance record',
    });
  }
};

/**
 * Approve attendance record (Manager/Admin)
 */
export const approveAttendance = async (
  req: AuthRequest,
  res: Response<ApiResponse<AttendanceResponse>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      res.status(403).json({
        success: false,
        error: 'Only managers and admins can approve attendance',
      });
      return;
    }

    const attendance = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      res.status(404).json({
        success: false,
        error: 'Attendance record not found',
      });
      return;
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: user.id,
        approvedAt: new Date(),
      },
      include: {
        user: true,
        shift: true,
      },
    });

    res.json({
      success: true,
      message: 'Attendance approved successfully',
      data: updated as any,
    });
  } catch (error) {
    console.error('Approve attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve attendance',
    });
  }
};

