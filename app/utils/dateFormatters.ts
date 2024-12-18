/**
 * Options for formatting dates in the application
 */
const DATE_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
} as const;

const DATE_ONLY_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
} as const;

/**
 * Formats a date string or Date object to show both date and time
 * @param date The date to format (string or Date object)
 * @returns Formatted date string (e.g., "Jan 15, 2024, 03:45 PM")
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(undefined, DATE_TIME_FORMAT_OPTIONS);
}

/**
 * Formats a date string or Date object to show only the date
 * @param date The date to format (string or Date object)
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(undefined, DATE_ONLY_FORMAT_OPTIONS);
} 