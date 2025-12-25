import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '0₮';
  return `${amount.toLocaleString('mn-MN')}₮`;
}
