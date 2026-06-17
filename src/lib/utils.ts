// ===========================================
// src/lib/utils.ts
// Small reusable helper functions
// ===========================================

import { clsx, type ClassValue } from 'clsx';

// Combine CSS class names conditionally
// Usage: cn('base-class', isActive && 'active-class', { 'conditional': someBoolean })
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format bytes into human-readable size (e.g. 2048 → "2 KB")
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Format a date string into a readable format (e.g. "Jun 12, 2025")
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Truncate long text with ellipsis
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

// Get file extension from filename
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// Generate a storage path for a user's PDF
// e.g. "abc123/1234567890-lecture1.pdf"
export function generateStoragePath(userId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${userId}/${timestamp}-${sanitized}`;
}
