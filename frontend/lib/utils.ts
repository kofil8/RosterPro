import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

/**
 * Merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date
 */
export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format date to relative time
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format currency
 */
export function formatCurrency(amountInCents: number, currency: string = 'USD'): string {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Get initials from name
 */
export function getInitials(firstName: string, lastName?: string): string {
  if (lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  return firstName.slice(0, 2).toUpperCase();
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Get error message from error object
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get role color
 */
export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-500',
    ADMIN: 'bg-blue-500',
    MANAGER: 'bg-green-500',
    EMPLOYEE: 'bg-gray-500',
  };
  return colors[role] || 'bg-gray-500';
}

/**
 * Get shift status color
 */
export function getShiftStatusColor(status: string): string {
  const colors: Record<string, string> = {
    SCHEDULED: 'bg-blue-500',
    IN_PROGRESS: 'bg-yellow-500',
    COMPLETED: 'bg-green-500',
    CANCELED: 'bg-red-500',
  };
  return colors[status] || 'bg-gray-500';
}

/**
 * Get subscription status color
 */
export function getSubscriptionStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-500',
    CANCELED: 'bg-red-500',
    PAST_DUE: 'bg-orange-500',
    TRIALING: 'bg-blue-500',
    INCOMPLETE: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

