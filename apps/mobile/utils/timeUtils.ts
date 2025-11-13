/**
 * Bulletproof real-time timestamp utility
 * Converts any date to relative time (e.g., "2 mins ago", "1 hour ago")
 */

/**
 * Get relative time string from a date (bulletproof implementation)
 * @param dateString - ISO date string or Date object
 * @returns Formatted relative time string (e.g., "2 mins ago")
 */
export function getRelativeTime(dateString: string | Date | null | undefined): string {
  if (!dateString) {
    return 'Just now';
  }

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // Validate date
    if (isNaN(date.getTime())) {
      return 'Just now';
    }

  const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
    // Future dates (clock skew)
    if (diffInSeconds < 0) {
      return 'Just now';
  }

    // Less than 1 minute
    if (diffInSeconds < 60) {
      return 'Just now';
    }

    // Minutes (1-59 mins)
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
  }

  // Hours (1-23 hours)
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  // Days (1-6 days)
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  // Weeks (1-3 weeks)
    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }

  // Months (1-11 months)
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }

  // Years (1+ years)
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return 'Just now';
  }
}

/**
 * Format date to readable string
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) {
    return 'Unknown date';
  }

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }

    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown date';
  }
}

/**
 * Check if a date is today
 */
export function isToday(dateString: string | Date | null | undefined): boolean {
  if (!dateString) {
    return false;
  }

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    
    return date.getDate() === now.getDate() &&
           date.getMonth() === now.getMonth() &&
           date.getFullYear() === now.getFullYear();
  } catch (error) {
    return false;
  }
}

/**
 * Get short relative time (e.g., "2m", "1h", "3d")
 */
export function getShortRelativeTime(dateString: string | Date | null | undefined): string {
  if (!dateString) {
    return 'now';
  }

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return 'now';
  }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 0 || diffInSeconds < 60) {
      return 'now';
  }

    if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m`;
  }

    if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h`;
  }

    if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)}d`;
  }

    if (diffInSeconds < 2592000) {
      return `${Math.floor(diffInSeconds / 604800)}w`;
}

    if (diffInSeconds < 31536000) {
      return `${Math.floor(diffInSeconds / 2592000)}mo`;
}

    return `${Math.floor(diffInSeconds / 31536000)}y`;
    
  } catch (error) {
    return 'now';
  }
}

/**
 * Get smart time format - alias for getRelativeTime for backward compatibility
 * Provides intelligent time formatting based on post age
 * @param dateString - ISO date string or Date object
 * @returns Formatted relative time string (e.g., "2 mins ago")
 */
export function getSmartTimeFormat(dateString: string | Date | null | undefined): string {
  return getRelativeTime(dateString);
}
