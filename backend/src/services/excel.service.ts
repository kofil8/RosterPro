import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { ExcelImportResult, PayrollExportData } from '../types';

const prisma = new PrismaClient();

/**
 * Import employees from Excel file
 */
export const importEmployeesFromExcel = async (
  buffer: Buffer,
  companyId: string
): Promise<ExcelImportResult> => {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const row of data as any[]) {
      try {
        // Expected columns: firstName, lastName, email, phone, address, hourlyRate, bankAccount, nationalInsuranceNumber
        await prisma.user.create({
          data: {
            email: row.email,
            password: '$2b$10$defaultHashedPassword', // Default password, should be changed
            firstName: row.firstName,
            lastName: row.lastName,
            phone: row.phone || null,
            address: row.address || null,
            hourlyRate: row.hourlyRate ? parseFloat(row.hourlyRate) : 0,
            bankAccount: row.bankAccount || null,
            nationalInsuranceNumber: row.nationalInsuranceNumber || null,
            role: 'EMPLOYEE',
            companyId,
          },
        });
        imported++;
      } catch (error: any) {
        failed++;
        errors.push(`Failed to import ${row.email}: ${error.message}`);
      }
    }

    return {
      success: true,
      imported,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      imported: 0,
      failed: 0,
      errors: [error.message],
    };
  }
};

/**
 * Export employees to Excel file
 */
export const exportEmployeesToExcel = async (companyId: string): Promise<Buffer> => {
  const employees = await prisma.user.findMany({
    where: { companyId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      role: true,
      hourlyRate: true,
      bankAccount: true,
      nationalInsuranceNumber: true,
      isActive: true,
      createdAt: true,
    },
  });

  const data = employees.map((emp) => ({
    'First Name': emp.firstName,
    'Last Name': emp.lastName,
    Email: emp.email,
    Phone: emp.phone || '',
    Address: emp.address || '',
    Role: emp.role,
    'Hourly Rate (£)': Number(emp.hourlyRate).toFixed(2),
    'Bank Account': emp.bankAccount || '',
    'NI Number': emp.nationalInsuranceNumber || '',
    Active: emp.isActive ? 'Yes' : 'No',
    'Created Date': emp.createdAt.toISOString().split('T')[0],
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

  // Set column widths
  const maxWidth = 20;
  const cols = [
    { wch: 15 }, // First Name
    { wch: 15 }, // Last Name
    { wch: 25 }, // Email
    { wch: 15 }, // Phone
    { wch: 30 }, // Address
    { wch: 12 }, // Role
    { wch: 15 }, // Hourly Rate
    { wch: 20 }, // Bank Account
    { wch: 15 }, // NI Number
    { wch: 8 },  // Active
    { wch: 12 }, // Created Date
  ];
  worksheet['!cols'] = cols;

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Export payroll to Excel file
 */
export const exportPayrollToExcel = async (
  companyId: string,
  periodStart?: Date,
  periodEnd?: Date
): Promise<Buffer> => {
  const where: any = { companyId };

  if (periodStart || periodEnd) {
    where.periodStart = {};
    if (periodStart) {
      where.periodStart.gte = periodStart;
    }
    if (periodEnd) {
      where.periodStart.lte = periodEnd;
    }
  }

  const payrolls = await prisma.payroll.findMany({
    where,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          nationalInsuranceNumber: true,
        },
      },
    },
    orderBy: { periodStart: 'desc' },
  });

  const data: PayrollExportData[] = payrolls.map((p) => ({
    employeeName: `${p.user.firstName} ${p.user.lastName}`,
    email: p.user.email,
    periodStart: p.periodStart.toISOString().split('T')[0],
    periodEnd: p.periodEnd.toISOString().split('T')[0],
    regularHours: Number(p.regularHours),
    overtimeHours: Number(p.overtimeHours),
    hourlyRate: Number(p.hourlyRate),
    regularPay: Number(p.regularPay),
    overtimePay: Number(p.overtimePay),
    bonuses: Number(p.bonuses),
    deductions: Number(p.deductions),
    netPay: Number(p.netPay),
    status: p.status,
  }));

  const excelData = data.map((p) => ({
    'Employee Name': p.employeeName,
    Email: p.email,
    'Period Start': p.periodStart,
    'Period End': p.periodEnd,
    'Regular Hours': p.regularHours.toFixed(2),
    'Overtime Hours': p.overtimeHours.toFixed(2),
    'Hourly Rate (£)': p.hourlyRate.toFixed(2),
    'Regular Pay (£)': p.regularPay.toFixed(2),
    'Overtime Pay (£)': p.overtimePay.toFixed(2),
    'Bonuses (£)': p.bonuses.toFixed(2),
    'Deductions (£)': p.deductions.toFixed(2),
    'Net Pay (£)': p.netPay.toFixed(2),
    Status: p.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Summary');

  // Set column widths
  const cols = [
    { wch: 20 }, // Employee Name
    { wch: 25 }, // Email
    { wch: 12 }, // Period Start
    { wch: 12 }, // Period End
    { wch: 15 }, // Regular Hours
    { wch: 15 }, // Overtime Hours
    { wch: 15 }, // Hourly Rate
    { wch: 15 }, // Regular Pay
    { wch: 15 }, // Overtime Pay
    { wch: 12 }, // Bonuses
    { wch: 15 }, // Deductions
    { wch: 15 }, // Net Pay
    { wch: 18 }, // Status
  ];
  worksheet['!cols'] = cols;

  // Add summary row
  const totalNetPay = data.reduce((sum, p) => sum + p.netPay, 0);
  const totalRegularHours = data.reduce((sum, p) => sum + p.regularHours, 0);
  const totalOvertimeHours = data.reduce((sum, p) => sum + p.overtimeHours, 0);

  XLSX.utils.sheet_add_json(
    worksheet,
    [
      {
        'Employee Name': 'TOTAL',
        Email: '',
        'Period Start': '',
        'Period End': '',
        'Regular Hours': totalRegularHours.toFixed(2),
        'Overtime Hours': totalOvertimeHours.toFixed(2),
        'Hourly Rate (£)': '',
        'Regular Pay (£)': '',
        'Overtime Pay (£)': '',
        'Bonuses (£)': '',
        'Deductions (£)': '',
        'Net Pay (£)': totalNetPay.toFixed(2),
        Status: '',
      },
    ],
    { origin: -1, skipHeader: true }
  );

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Import shifts/roster from Excel file
 */
export const importShiftsFromExcel = async (
  buffer: Buffer,
  rosterId: string
): Promise<ExcelImportResult> => {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const row of data as any[]) {
      try {
        // Expected columns: title, description, startTime, endTime, location, clientName, clientNotes, assignedUserEmail
        let assignedUserId = null;

        if (row.assignedUserEmail) {
          const user = await prisma.user.findUnique({
            where: { email: row.assignedUserEmail },
          });
          if (user) {
            assignedUserId = user.id;
          }
        }

        await prisma.shift.create({
          data: {
            title: row.title,
            description: row.description || null,
            startTime: new Date(row.startTime),
            endTime: new Date(row.endTime),
            location: row.location || null,
            clientName: row.clientName || null,
            clientNotes: row.clientNotes || null,
            notes: row.notes || null,
            rosterId,
            assignedUserId,
          },
        });
        imported++;
      } catch (error: any) {
        failed++;
        errors.push(`Failed to import shift "${row.title}": ${error.message}`);
      }
    }

    return {
      success: true,
      imported,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      imported: 0,
      failed: 0,
      errors: [error.message],
    };
  }
};

/**
 * Export attendance report to Excel
 */
export const exportAttendanceToExcel = async (
  companyId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Buffer> => {
  const where: any = {
    user: { companyId },
  };

  if (startDate || endDate) {
    where.clockIn = {};
    if (startDate) {
      where.clockIn.gte = startDate;
    }
    if (endDate) {
      where.clockIn.lte = endDate;
    }
  }

  const attendances = await prisma.attendance.findMany({
    where,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      shift: {
        select: {
          title: true,
          location: true,
          clientName: true,
        },
      },
    },
    orderBy: { clockIn: 'desc' },
  });

  const data = attendances.map((att) => ({
    'Employee Name': `${att.user.firstName} ${att.user.lastName}`,
    Email: att.user.email,
    'Shift Title': att.shift.title,
    Location: att.shift.location || '',
    'Client Name': att.shift.clientName || '',
    'Clock In': att.clockIn.toISOString().replace('T', ' ').substring(0, 19),
    'Clock Out': att.clockOut
      ? att.clockOut.toISOString().replace('T', ' ').substring(0, 19)
      : '',
    'Total Hours': att.totalHours ? Number(att.totalHours).toFixed(2) : '',
    'Break Duration': Number(att.breakDuration).toFixed(2),
    Status: att.status,
    Notes: att.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');

  // Set column widths
  const cols = [
    { wch: 20 }, // Employee Name
    { wch: 25 }, // Email
    { wch: 20 }, // Shift Title
    { wch: 20 }, // Location
    { wch: 20 }, // Client Name
    { wch: 20 }, // Clock In
    { wch: 20 }, // Clock Out
    { wch: 12 }, // Total Hours
    { wch: 15 }, // Break Duration
    { wch: 15 }, // Status
    { wch: 30 }, // Notes
  ];
  worksheet['!cols'] = cols;

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

