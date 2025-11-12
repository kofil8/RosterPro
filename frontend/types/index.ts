// User Types
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  EMPLOYEE = 'EMPLOYEE',
}

export interface User {
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
  createdAt: string;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  timezone: string;
  logo?: string;
  overtimeMultiplier?: number;
  weeklyHoursThreshold?: number;
  createdAt: string;
}

// Roster Types
export interface Roster {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  companyId: string;
  shifts?: Shift[];
  createdAt: string;
  updatedAt: string;
}

// Shift Types
export enum ShiftStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export interface Shift {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  clientName?: string;
  clientNotes?: string;
  notes?: string;
  status: ShiftStatus;
  rosterId: string;
  assignedUserId?: string;
  assignedUser?: User;
  attendance?: Attendance;
  createdAt: string;
  updatedAt: string;
}

// Attendance Types
export enum AttendanceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Attendance {
  id: string;
  shiftId: string;
  shift?: Shift;
  userId: string;
  user?: User;
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  breakDuration: number;
  notes?: string;
  status: AttendanceStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Payroll Types
export enum PayrollStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
}

export interface Payroll {
  id: string;
  userId: string;
  user?: User;
  companyId: string;
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
  status: PayrollStatus;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
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
  user: User;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Dashboard Analytics
export interface DashboardAnalytics {
  employees: {
    total: number;
    active: number;
    inactive: number;
  };
  rosters: {
    total: number;
    published: number;
    draft: number;
  };
  shifts: {
    total: number;
    upcoming: number;
    thisWeek: number;
    thisMonth: number;
    unassigned: number;
  };
  attendance: {
    pending: number;
  };
  payroll: {
    total: number;
    pendingApproval: number;
  };
}

// Excel Import/Export Types
export interface ExcelImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors?: string[];
}

