/**
 * Date and Time Utility Functions
 * Handles proper timezone conversion for UK locale (GMT/BST)
 */

/**
 * Format a date string to UK format (e.g., "4 Oct 2025")
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Europe/London' // UK timezone (handles GMT/BST automatically)
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Format a date string to UK format with time (e.g., "4 Oct 2025, 14:30")
 * @param dateString - ISO date string or Date object
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string | Date): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London' // UK timezone (handles GMT/BST automatically)
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Invalid Date';
  }
}

/**
 * Format a date string to full UK format with time and seconds (e.g., "4 Oct 2025, 14:30:45")
 * @param dateString - ISO date string or Date object
 * @returns Formatted date and time string with seconds
 */
export function formatDateTimeFull(dateString: string | Date): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/London' // UK timezone (handles GMT/BST automatically)
    });
  } catch (error) {
    console.error('Error formatting date time full:', error);
    return 'Invalid Date';
  }
}

/**
 * Format time only from a date string (e.g., "14:30")
 * @param dateString - ISO date string or Date object
 * @returns Formatted time string
 */
export function formatTime(dateString: string | Date): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Time';
    
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London' // UK timezone (handles GMT/BST automatically)
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
}

/**
 * Get relative time string (e.g., "2 hours ago", "just now")
 * @param dateString - ISO date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string | Date): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return formatDate(date);
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid Date';
  }
}

/**
 * Convert ISO date string to UK timezone ISO string
 * Useful for storing dates in the correct timezone
 * @param dateString - ISO date string or Date object
 * @returns ISO string in UK timezone
 */
export function toUKTimezone(dateString: string | Date): string {
  if (!dateString) return new Date().toISOString();
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return new Date().toISOString();
    
    // Convert to UK timezone and return as ISO string
    return new Date(date.toLocaleString('en-GB', { timeZone: 'Europe/London' })).toISOString();
  } catch (error) {
    console.error('Error converting to UK timezone:', error);
    return new Date().toISOString();
  }
}

/**
 * Check if a date is today
 * @param dateString - ISO date string or Date object
 * @returns true if date is today, false otherwise
 */
export function isToday(dateString: string | Date): boolean {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const today = new Date();
    
    return date.toDateString() === today.toDateString();
  } catch (error) {
    return false;
  }
}

/**
 * Check if a date is in the past
 * @param dateString - ISO date string or Date object
 * @returns true if date is in the past, false otherwise
 */
export function isPast(dateString: string | Date): boolean {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    return date < now;
  } catch (error) {
    return false;
  }
}
