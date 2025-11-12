import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import {
  exportEmployeesToExcel,
  exportPayrollToExcel,
  exportAttendanceToExcel,
  importEmployeesFromExcel,
  importShiftsFromExcel,
} from '../services/excel.service';

/**
 * Export employees to Excel
 */
export const exportEmployees = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;

    if (!user.companyId) {
      res.status(400).json({
        success: false,
        error: 'User is not associated with a company',
      });
      return;
    }

    const buffer = await exportEmployeesToExcel(user.companyId);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=employees-${new Date().toISOString().split('T')[0]}.xlsx`
    );

    res.send(buffer);
  } catch (error) {
    console.error('Export employees error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export employees',
    });
  }
};

/**
 * Import employees from Excel
 */
export const importEmployees = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const user = req.user!;

    if (user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: 'Only admins can import employees',
      });
      return;
    }

    if (!user.companyId) {
      res.status(400).json({
        success: false,
        error: 'User is not associated with a company',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
      return;
    }

    const result = await importEmployeesFromExcel(req.file.buffer, user.companyId);

    if (result.success) {
      res.json({
        success: true,
        message: `Successfully imported ${result.imported} employees. ${result.failed} failed.`,
        data: result,
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to import employees',
        data: result,
      });
    }
  } catch (error) {
    console.error('Import employees error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import employees',
    });
  }
};

/**
 * Export payroll to Excel
 */
export const exportPayroll = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;
    const { periodStart, periodEnd } = req.query;

    if (!user.companyId) {
      res.status(400).json({
        success: false,
        error: 'User is not associated with a company',
      });
      return;
    }

    const startDate = periodStart ? new Date(periodStart as string) : undefined;
    const endDate = periodEnd ? new Date(periodEnd as string) : undefined;

    const buffer = await exportPayrollToExcel(user.companyId, startDate, endDate);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=payroll-${new Date().toISOString().split('T')[0]}.xlsx`
    );

    res.send(buffer);
  } catch (error) {
    console.error('Export payroll error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export payroll',
    });
  }
};

/**
 * Export attendance report to Excel
 */
export const exportAttendance = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;
    const { startDate, endDate } = req.query;

    if (!user.companyId) {
      res.status(400).json({
        success: false,
        error: 'User is not associated with a company',
      });
      return;
    }

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const buffer = await exportAttendanceToExcel(user.companyId, start, end);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance-${new Date().toISOString().split('T')[0]}.xlsx`
    );

    res.send(buffer);
  } catch (error) {
    console.error('Export attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export attendance report',
    });
  }
};

/**
 * Import shifts from Excel
 */
export const importShifts = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const user = req.user!;
    const { rosterId } = req.body;

    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      res.status(403).json({
        success: false,
        error: 'Only admins and managers can import shifts',
      });
      return;
    }

    if (!rosterId) {
      res.status(400).json({
        success: false,
        error: 'Roster ID is required',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
      return;
    }

    const result = await importShiftsFromExcel(req.file.buffer, rosterId);

    if (result.success) {
      res.json({
        success: true,
        message: `Successfully imported ${result.imported} shifts. ${result.failed} failed.`,
        data: result,
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to import shifts',
        data: result,
      });
    }
  } catch (error) {
    console.error('Import shifts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import shifts',
    });
  }
};

