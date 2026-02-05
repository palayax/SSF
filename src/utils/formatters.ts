import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format a date for display in the UI
 */
export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'PPP p');
}

/**
 * Format a timestamp for timeline display
 */
export function formatTimestamp(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm:ss');
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Format IP address for display
 */
export function formatIP(ip: string | undefined): string {
  return ip || 'N/A';
}

/**
 * Format hostname for display
 */
export function formatHostname(hostname: string): string {
  return hostname.toUpperCase();
}

/**
 * Get severity color class
 */
export function getSeverityColor(severity: 'critical' | 'high' | 'medium' | 'low' | 'info'): string {
  const colors: Record<typeof severity, string> = {
    critical: 'text-red-600 dark:text-red-400',
    high: 'text-orange-600 dark:text-orange-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-green-600 dark:text-green-400',
    info: 'text-blue-600 dark:text-blue-400',
  };
  return colors[severity];
}

/**
 * Get severity background color class
 */
export function getSeverityBgColor(severity: 'critical' | 'high' | 'medium' | 'low' | 'info'): string {
  const colors: Record<typeof severity, string> = {
    critical: 'bg-red-100 dark:bg-red-900/30',
    high: 'bg-orange-100 dark:bg-orange-900/30',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30',
    low: 'bg-green-100 dark:bg-green-900/30',
    info: 'bg-blue-100 dark:bg-blue-900/30',
  };
  return colors[severity];
}

/**
 * Get validation status color class
 */
export function getValidationStatusColor(status: 'verified' | 'failed' | 'pending' | 'unknown'): string {
  const colors: Record<typeof status, string> = {
    verified: 'text-green-600 dark:text-green-400',
    failed: 'text-red-600 dark:text-red-400',
    pending: 'text-yellow-600 dark:text-yellow-400',
    unknown: 'text-slate-500 dark:text-slate-400',
  };
  return colors[status];
}
