import { ApiResponse } from '../types';

/**
 * Create a standardized success response
 */
export const successResponse = <T>(data?: T, message?: string): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
  };
};

/**
 * Create a standardized error response
 */
export const errorResponse = (error: string, message?: string): ApiResponse => {
  return {
    success: false,
    message,
    error,
  };
};

/**
 * Remove sensitive fields from user object
 */
export const sanitizeUser = (user: any) => {
  const { password, refreshTokens, ...sanitized } = user;
  return sanitized;
};

/**
 * Calculate pagination metadata
 */
export const calculatePagination = (page: number = 1, limit: number = 10, total: number) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNext,
    hasPrev,
  };
};

/**
 * Validate date range
 */
export const isValidDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate < endDate;
};

/**
 * Check if two date ranges overlap
 */
export const doDateRangesOverlap = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean => {
  return start1 < end2 && start2 < end1;
};

/**
 * Format currency amount (from cents to dollars)
 */
export const formatCurrency = (amountInCents: number, currency: string = 'USD'): string => {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Generate a random string
 */
export const generateRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Sleep/delay function
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Check if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if password meets requirements
 * At least 8 characters, one uppercase, one lowercase, one number
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Format date to ISO string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

/**
 * Parse date string safely
 */
export const parseDate = (dateString: string): Date | null => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

