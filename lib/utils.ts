import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';
import { DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, VALIDATION } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatDate(date: Date | string | undefined, formatStr = DATE_FORMAT): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr);
}

export function formatDateTime(date: Date | string | undefined): string {
  return formatDate(date, DATETIME_FORMAT);
}

export function formatTime(date: Date | string | undefined): string {
  return formatDate(date, TIME_FORMAT);
}

// ============================================================================
// VALIDATION
// ============================================================================

export function isValidEmail(email: string): boolean {
  return VALIDATION.EMAIL_REGEX.test(email);
}

export function isValidPhone(phone: string): boolean {
  return VALIDATION.PHONE_REGEX.test(phone);
}

export function isValidPassword(password: string): boolean {
  return password.length >= VALIDATION.MIN_PASSWORD_LENGTH;
}

// ============================================================================
// STRING MANIPULATION
// ============================================================================

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

// ============================================================================
// NAME FORMATTING
// ============================================================================

export function formatFullName(
  firstName: string,
  middleName?: string,
  lastName?: string
): string {
  const parts = [firstName, middleName, lastName].filter(Boolean);
  return parts.join(' ');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

// ============================================================================
// ID GENERATION
// ============================================================================

export function generateSacramentId(
  type: string,
  parishId: string,
  date: Date
): string {
  const year = date.getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${type.toUpperCase()}-${parishId.toUpperCase()}-${year}-${random}`;
}

export function generateMemberId(parishId: string): string {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `MBR-${parishId.toUpperCase()}-${random}`;
}

// ============================================================================
// FILE HANDLING
// ============================================================================

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-MW').format(num);
}

export function formatCurrency(amount: number, currency = 'MWK'): string {
  return new Intl.NumberFormat('en-MW', {
    style: 'currency',
    currency,
  }).format(amount);
}

// ============================================================================
// ARRAY HELPERS
// ============================================================================

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// ============================================================================
// DEBOUNCE
// ============================================================================

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================================================
// DEEP CLONE
// ============================================================================

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ============================================================================
// COMPARISON
// ============================================================================

export function isEqual(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}

// ============================================================================
// QUERY PARAMS
// ============================================================================

export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}

export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}

// ============================================================================
// ASYNC DELAY
// ============================================================================

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// RANDOM
// ============================================================================

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
