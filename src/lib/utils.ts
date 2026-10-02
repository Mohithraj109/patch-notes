import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, startOfWeek, endOfWeek, getWeek } from 'date-fns';
import type { DateRange } from './git/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrentWeekRange(): DateRange {
  const now = new Date();
  const from = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const to = endOfWeek(now, { weekStartsOn: 1 });     // Sunday
  return {
    from,
    to,
    label: `Week ${getWeek(now)}`,
  };
}

export function formatDateRange(from: Date, to: Date): string {
  if (from.getMonth() === to.getMonth()) {
    return `${format(from, 'MMM d')}–${format(to, 'd, yyyy')}`;
  }
  return `${format(from, 'MMM d')} – ${format(to, 'MMM d, yyyy')}`;
}

export function getWeekLabel(date: Date): string {
  return `Week ${getWeek(date)}`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
