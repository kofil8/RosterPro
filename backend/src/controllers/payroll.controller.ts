import { Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  AuthRequest,
  ApiResponse,
  CreatePayrollDTO,
  UpdatePayrollDTO,
  PayrollResponse,
  PayrollQueryParams,
} from '../types';

const prisma = new PrismaClient();

/**
 * Create payroll record
 */
export const createPayroll = async (
  req: AuthRequest,
  res: Response<ApiResponse<PayrollResponse>>
): Promise<void> => {
  try {
    const data: CreatePayrollDTO = req.body;
    const user = req.user!;

    // Only admins and accountants can create payroll
    if (user.role !== 'ADMIN' && user.role !== 'ACCOUNTANT') {
      res.status(403).json({
        success: false,
        error: 'Only admins and accountants can create payroll records',
      });
      return;
    }

    // Verify user exists and get hourly rate
    const employee = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { company: true },
    });

    if (!employee) {
      res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
      return;
    }

    // Get company overtime settings
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      res.status(404).json({
        success: false,
        error: 'Company not found',
      });
      return;
    }

    const hourlyRate = new Prisma.Decimal(data.hourlyRate);
    const regularHours = new Prisma.Decimal(data.regularHours);
    const overtimeHours = new Prisma.Decimal(data.overtimeHours || 0);
    const bonuses = new Prisma.Decimal(data.bonuses || 0);
    const deductions = new Prisma.Decimal(data.deductions || 0);

    // Calculate pay
    const regularPay = regularHours.mul(hourlyRate);
    const overtimeRate = hourlyRate.mul(company.overtimeMultiplier);
    const overtimePay = overtimeHours.mul(overtimeRate);
    const netPay = regularPay.add(overtimePay).add(bonuses).sub(deductions);

    // Create payroll record
    const payroll = await prisma.payroll.create({
      data: {
        userId: data.userId,
        companyId: data.companyId,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        regularHours,
        overtimeHours,
        hourlyRate,
        regularPay,
        overtimePay,
        bonuses,
        deductions,
        netPay,
        notes: data.notes,
        status: 'DRAFT',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            hourlyRate: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Payroll record created successfully',
      data: payroll as any,
    });
  } catch (error) {
    console.error('Create payroll error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payroll record',
    });
  }
};

/**
 * Get all payroll records (with filtering)
 */
export const getPayrolls = async (
  req: AuthRequest,
  res: Response<ApiResponse<PayrollResponse[]>>
): Promise<void> => {
  try {
    const user = req.user!;
    const query = req.query as unknown as PayrollQueryParams;

    const where: any = {};

    // Filter by role
    if (user.role === 'ADMIN' || user.role === 'ACCOUNTANT') {
      // Can see all payrolls in their company
      if (user.companyId) {
        where.companyId = user.companyId;
      }
      if (query.userId) {
        where.userId = query.userId;
      }
    } else if (user.role === 'MANAGER') {
      // Managers can see payrolls in their company
      if (user.companyId) {
        where.companyId = user.companyId;
      }
      if (query.userId) {
        where.userId = query.userId;
      }
    } else {
      // Employees can only see their own payroll
      where.userId = user.id;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.periodStart || query.periodEnd) {
      where.periodStart = {};
      if (query.periodStart) {
        where.periodStart.gte = new Date(query.periodStart);
      }
      if (query.periodEnd) {
        where.periodStart.lte = new Date(query.periodEnd);
      }
    }

    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            hourlyRate: true,
            nationalInsuranceNumber: true,
          },
        },
      },
      orderBy: { periodStart: 'desc' },
    });

    res.json({
      success: true,
      data: payrolls as any,
    });
  } catch (error) {
    console.error('Get payrolls error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payroll records',
    });
  }
};

/**
 * Get single payroll record
 */
export const getPayrollById = async (
  req: AuthRequest,
  res: Response<ApiResponse<PayrollResponse>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const payroll = await prisma.payroll.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            hourlyRate: true,
            bankAccount: true,
            nationalInsuranceNumber: true,
          },
        },
        company: true,
      },
    });

    if (!payroll) {
      res.status(404).json({
        success: false,
        error: 'Payroll record not found',
      });
      return;
    }

    // Authorization check
    if (
      user.role === 'EMPLOYEE' &&
      payroll.userId !== user.id
    ) {
      res.status(403).json({
        success: false,
        error: 'Unauthorized to view this payroll record',
      });
      return;
    }

    res.json({
      success: true,
      data: payroll as any,
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payroll record',
    });
  }
};

/**
 * Update payroll record
 */
export const updatePayroll = async (
  req: AuthRequest,
  res: Response<ApiResponse<PayrollResponse>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const data: UpdatePayrollDTO = req.body;
    const user = req.user!;

    // Only admins and accountants can update payroll
    if (user.role !== 'ADMIN' && user.role !== 'ACCOUNTANT') {
      res.status(403).json({
        success: false,
        error: 'Only admins and accountants can update payroll records',
      });
      return;
    }

    const payroll = await prisma.payroll.findUnique({
      where: { id },
      include: { company: true, user: true },
    });

    if (!payroll) {
      res.status(404).json({
        success: false,
        error: 'Payroll record not found',
      });
      return;
    }

    const updateData: any = {};

    // Recalculate pay if hours/bonuses/deductions change
    let needsRecalculation = false;
    
    if (data.regularHours !== undefined) {
      updateData.regularHours = new Prisma.Decimal(data.regularHours);
      needsRecalculation = true;
    }
    
    if (data.overtimeHours !== undefined) {
      updateData.overtimeHours = new Prisma.Decimal(data.overtimeHours);
      needsRecalculation = true;
    }
    
    if (data.bonuses !== undefined) {
      updateData.bonuses = new Prisma.Decimal(data.bonuses);
      needsRecalculation = true;
    }
    
    if (data.deductions !== undefined) {
      updateData.deductions = new Prisma.Decimal(data.deductions);
      needsRecalculation = true;
    }

    if (needsRecalculation) {
      const regularHours = new Prisma.Decimal(data.regularHours ?? payroll.regularHours);
      const overtimeHours = new Prisma.Decimal(data.overtimeHours ?? payroll.overtimeHours);
      const bonuses = new Prisma.Decimal(data.bonuses ?? payroll.bonuses);
      const deductions = new Prisma.Decimal(data.deductions ?? payroll.deductions);
      const hourlyRate = payroll.hourlyRate;
      
      const regularPay = regularHours.mul(hourlyRate);
      const overtimeRate = hourlyRate.mul(payroll.company.overtimeMultiplier);
      const overtimePay = overtimeHours.mul(overtimeRate);
      const netPay = regularPay.add(overtimePay).add(bonuses).sub(deductions);
      
      updateData.regularPay = regularPay;
      updateData.overtimePay = overtimePay;
      updateData.netPay = netPay;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'APPROVED') {
        updateData.approvedBy = user.id;
        updateData.approvedAt = new Date();
      } else if (data.status === 'PAID') {
        updateData.paidAt = new Date();
      }
    }

    const updated = await prisma.payroll.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            hourlyRate: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Payroll record updated successfully',
      data: updated as any,
    });
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payroll record',
    });
  }
};

/**
 * Delete payroll record
 */
export const deletePayroll = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    // Only admins can delete payroll records
    if (user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: 'Only admins can delete payroll records',
      });
      return;
    }

    const payroll = await prisma.payroll.findUnique({
      where: { id },
    });

    if (!payroll) {
      res.status(404).json({
        success: false,
        error: 'Payroll record not found',
      });
      return;
    }

    await prisma.payroll.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Payroll record deleted successfully',
    });
  } catch (error) {
    console.error('Delete payroll error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete payroll record',
    });
  }
};

/**
 * Generate payroll for a period (auto-calculate from attendance)
 */
export const generatePayroll = async (
  req: AuthRequest,
  res: Response<ApiResponse<PayrollResponse>>
): Promise<void> => {
  try {
    const user = req.user!;
    const { userId, periodStart, periodEnd } = req.body;

    // Only admins and accountants can generate payroll
    if (user.role !== 'ADMIN' && user.role !== 'ACCOUNTANT') {
      res.status(403).json({
        success: false,
        error: 'Only admins and accountants can generate payroll',
      });
      return;
    }

    const employee = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!employee || !employee.companyId) {
      res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
      return;
    }

    // Get all approved attendance records for the period
    const attendances = await prisma.attendance.findMany({
      where: {
        userId,
        status: 'APPROVED',
        clockIn: {
          gte: new Date(periodStart),
          lte: new Date(periodEnd),
        },
      },
    });

    // Calculate total hours
    let totalHours = 0;
    attendances.forEach((att) => {
      if (att.totalHours) {
        totalHours += Number(att.totalHours);
      }
    });

    const company = employee.company!;
    const regularHours = Math.min(totalHours, company.weeklyHoursThreshold);
    const overtimeHours = Math.max(0, totalHours - company.weeklyHoursThreshold);
    const hourlyRate = Number(employee.hourlyRate);

    // Calculate pay
    const regularPay = new Prisma.Decimal(regularHours * hourlyRate);
    const overtimeRate = hourlyRate * Number(company.overtimeMultiplier);
    const overtimePay = new Prisma.Decimal(overtimeHours * overtimeRate);
    const netPay = regularPay.add(overtimePay);

    // Create payroll record
    const payroll = await prisma.payroll.create({
      data: {
        userId,
        companyId: employee.companyId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        regularHours: new Prisma.Decimal(regularHours),
        overtimeHours: new Prisma.Decimal(overtimeHours),
        hourlyRate: new Prisma.Decimal(hourlyRate),
        regularPay,
        overtimePay,
        bonuses: new Prisma.Decimal(0),
        deductions: new Prisma.Decimal(0),
        netPay,
        status: 'PENDING_APPROVAL',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            hourlyRate: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: `Payroll generated successfully. Total hours: ${totalHours} (Regular: ${regularHours}, Overtime: ${overtimeHours})`,
      data: payroll as any,
    });
  } catch (error) {
    console.error('Generate payroll error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate payroll',
    });
  }
};

/**
 * Approve payroll (Manager/Admin)
 */
export const approvePayroll = async (
  req: AuthRequest,
  res: Response<ApiResponse<PayrollResponse>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      res.status(403).json({
        success: false,
        error: 'Only admins and managers can approve payroll',
      });
      return;
    }

    const payroll = await prisma.payroll.findUnique({
      where: { id },
    });

    if (!payroll) {
      res.status(404).json({
        success: false,
        error: 'Payroll record not found',
      });
      return;
    }

    const updated = await prisma.payroll.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: user.id,
        approvedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    res.json({
      success: true,
      message: 'Payroll approved successfully',
      data: updated as any,
    });
  } catch (error) {
    console.error('Approve payroll error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve payroll',
    });
  }
};

