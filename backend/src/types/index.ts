import { Request } from 'express';
import { UserRole, ShiftStatus, AttendanceStatus, PayrollStatus } from '@prisma/client';

// Extended Express Request with user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    companyId?: string;
  };
}

// JWT Payload
export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  companyId?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// User Types
export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role?: UserRole;
  hourlyRate?: number;
  bankAccount?: string;
  nationalInsuranceNumber?: string;
  companyId?: string;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role?: UserRole;
  hourlyRate?: number;
  bankAccount?: string;
  nationalInsuranceNumber?: string;
  isActive?: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: UserRole;
  avatar?: string;
  hourlyRate?: number;
  bankAccount?: string;
  nationalInsuranceNumber?: string;
  isActive: boolean;
  companyId?: string;
  createdAt: Date;
}

// Company Types
export interface CreateCompanyDTO {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  timezone?: string;
}

export interface UpdateCompanyDTO {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  timezone?: string;
  logo?: string;
}

export interface CompanyResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  timezone: string;
  logo?: string;
  overtimeMultiplier?: number;
  weeklyHoursThreshold?: number;
}

// Roster Types
export interface CreateRosterDTO {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  companyId: string;
}

export interface UpdateRosterDTO {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  isPublished?: boolean;
}

export interface RosterResponse {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isPublished: boolean;
  companyId: string;
  shifts?: ShiftResponse[];
  createdAt: Date;
  updatedAt: Date;
}

// Shift Types
export interface CreateShiftDTO {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  clientName?: string;
  clientNotes?: string;
  notes?: string;
  rosterId: string;
  assignedUserId?: string;
}

export interface UpdateShiftDTO {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  clientName?: string;
  clientNotes?: string;
  notes?: string;
  status?: ShiftStatus;
  assignedUserId?: string;
}

export interface ShiftResponse {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  clientName?: string;
  clientNotes?: string;
  notes?: string;
  status: ShiftStatus;
  rosterId: string;
  assignedUserId?: string;
  assignedUser?: UserResponse;
  attendance?: AttendanceResponse;
  createdAt: Date;
  updatedAt: Date;
}

// Attendance Types
export interface CreateAttendanceDTO {
  shiftId: string;
  userId: string;
  clockIn: Date;
  clockOut?: Date;
  breakDuration?: number;
  notes?: string;
}

export interface UpdateAttendanceDTO {
  clockOut?: Date;
  breakDuration?: number;
  notes?: string;
  status?: AttendanceStatus;
}

export interface AttendanceResponse {
  id: string;
  shiftId: string;
  userId: string;
  clockIn: Date;
  clockOut?: Date;
  totalHours?: number;
  breakDuration: number;
  notes?: string;
  status: AttendanceStatus;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Payroll Types
export interface CreatePayrollDTO {
  userId: string;
  companyId: string;
  periodStart: Date;
  periodEnd: Date;
  regularHours: number;
  overtimeHours?: number;
  hourlyRate: number;
  bonuses?: number;
  deductions?: number;
  notes?: string;
}

export interface UpdatePayrollDTO {
  regularHours?: number;
  overtimeHours?: number;
  bonuses?: number;
  deductions?: number;
  notes?: string;
  status?: PayrollStatus;
}

export interface PayrollResponse {
  id: string;
  userId: string;
  user?: UserResponse;
  companyId: string;
  periodStart: Date;
  periodEnd: Date;
  regularHours: number;
  overtimeHours: number;
  hourlyRate: number;
  regularPay: number;
  overtimePay: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  status: PayrollStatus;
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Auth Types
export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  companyEmail: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

// Query Parameters
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface RosterQueryParams extends PaginationQuery {
  startDate?: string;
  endDate?: string;
  isPublished?: boolean;
}

export interface ShiftQueryParams extends PaginationQuery {
  rosterId?: string;
  assignedUserId?: string;
  startDate?: string;
  endDate?: string;
  status?: ShiftStatus;
}

export interface AttendanceQueryParams extends PaginationQuery {
  userId?: string;
  shiftId?: string;
  status?: AttendanceStatus;
  startDate?: string;
  endDate?: string;
}

export interface PayrollQueryParams extends PaginationQuery {
  userId?: string;
  companyId?: string;
  status?: PayrollStatus;
  periodStart?: string;
  periodEnd?: string;
}

// Excel Import/Export Types
export interface ExcelImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors?: string[];
}

export interface PayrollExportData {
  employeeName: string;
  email: string;
  periodStart: string;
  periodEnd: string;
  regularHours: number;
  overtimeHours: number;
  hourlyRate: number;
  regularPay: number;
  overtimePay: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  status: string;
}

