import { Response } from 'express';
import prisma from '../config/database';
import { successResponse, errorResponse } from '../utils/helpers';
import { AuthRequest } from '../types';

/**
 * Get dashboard analytics
 */
export const getDashboardAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.companyId) {
      res.status(401).json(errorResponse('Not authenticated', 'Company membership required'));
      return;
    }

    const companyId = req.user.companyId;

    // Get date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get analytics
    const [
      totalEmployees,
      activeEmployees,
      totalRosters,
      publishedRosters,
      totalShifts,
      upcomingShifts,
      shiftsThisWeek,
      shiftsThisMonth,
      unassignedShifts,
      pendingAttendance,
      pendingPayroll,
      totalPayroll,
    ] = await Promise.all([
      prisma.user.count({
        where: { companyId },
      }),
      prisma.user.count({
        where: {
          companyId,
          isActive: true,
        },
      }),
      prisma.roster.count({
        where: { companyId },
      }),
      prisma.roster.count({
        where: {
          companyId,
          isPublished: true,
        },
      }),
      prisma.shift.count({
        where: {
          roster: { companyId },
        },
      }),
      prisma.shift.count({
        where: {
          roster: { companyId },
          startTime: { gte: now },
        },
      }),
      prisma.shift.count({
        where: {
          roster: { companyId },
          startTime: { gte: sevenDaysAgo },
        },
      }),
      prisma.shift.count({
        where: {
          roster: { companyId },
          startTime: { gte: thirtyDaysAgo },
        },
      }),
      prisma.shift.count({
        where: {
          roster: { companyId },
          assignedUserId: null,
        },
      }),
      prisma.attendance.count({
        where: {
          user: { companyId },
          status: 'PENDING',
        },
      }),
      prisma.payroll.count({
        where: {
          companyId,
          status: 'PENDING_APPROVAL',
        },
      }),
      prisma.payroll.count({
        where: { companyId },
      }),
    ]);

    const analytics = {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: totalEmployees - activeEmployees,
      },
      rosters: {
        total: totalRosters,
        published: publishedRosters,
        draft: totalRosters - publishedRosters,
      },
      shifts: {
        total: totalShifts,
        upcoming: upcomingShifts,
        thisWeek: shiftsThisWeek,
        thisMonth: shiftsThisMonth,
        unassigned: unassignedShifts,
      },
      attendance: {
        pending: pendingAttendance,
      },
      payroll: {
        total: totalPayroll,
        pendingApproval: pendingPayroll,
      },
    };

    res.json(successResponse(analytics, 'Analytics retrieved successfully'));
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json(errorResponse('Failed to get analytics', 'An error occurred'));
  }
};

/**
 * Get company statistics
 */
export const getCompanyStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.companyId) {
      res.status(401).json(errorResponse('Not authenticated', 'Company membership required'));
      return;
    }

    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            users: true,
            rosters: true,
            payrolls: true,
          },
        },
      },
    });

    if (!company) {
      res.status(404).json(errorResponse('Company not found', 'Company does not exist'));
      return;
    }

    res.json(successResponse(company, 'Company statistics retrieved successfully'));
  } catch (error) {
    console.error('Get company stats error:', error);
    res.status(500).json(errorResponse('Failed to get company statistics', 'An error occurred'));
  }
};

/**
 * Get recent activity
 */
export const getRecentActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.companyId) {
      res.status(401).json(errorResponse('Not authenticated', 'Company membership required'));
      return;
    }

    const companyId = req.user.companyId;
    const limit = parseInt(req.query.limit as string) || 20;

    // Get recent rosters
    const recentRosters = await prisma.roster.findMany({
      where: { companyId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        isPublished: true,
        createdAt: true,
      },
    });

    // Get recent shifts
    const recentShifts = await prisma.shift.findMany({
      where: {
        roster: { companyId },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        status: true,
        createdAt: true,
        assignedUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      where: { companyId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const activity = {
      recentRosters,
      recentShifts,
      recentUsers,
    };

    res.json(successResponse(activity, 'Recent activity retrieved successfully'));
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json(errorResponse('Failed to get recent activity', 'An error occurred'));
  }
};

/**
 * Update company settings
 */
export const updateCompanySettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.companyId) {
      res.status(401).json(errorResponse('Not authenticated', 'Company membership required'));
      return;
    }

    const { name, email, phone, address, timezone, logo, overtimeMultiplier, weeklyHoursThreshold } = req.body;

    const updateData: any = {
      name,
      email,
      phone,
      address,
      timezone,
      logo,
    };

    // Add payroll settings if provided
    if (overtimeMultiplier !== undefined) {
      updateData.overtimeMultiplier = overtimeMultiplier;
    }
    if (weeklyHoursThreshold !== undefined) {
      updateData.weeklyHoursThreshold = weeklyHoursThreshold;
    }

    const company = await prisma.company.update({
      where: { id: req.user.companyId },
      data: updateData,
    });

    res.json(successResponse(company, 'Company settings updated successfully'));
  } catch (error) {
    console.error('Update company settings error:', error);
    res.status(500).json(errorResponse('Failed to update company settings', 'An error occurred'));
  }
};

