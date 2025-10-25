/**
 * Twitter-like time ago utility functions
 * Provides precise time formatting similar to Twitter's time display
 */

export interface TimeAgoOptions {
  showSeconds?: boolean;
  maxDays?: number;
  showYear?: boolean;
}

/**
 * Formats a date string into Twitter-like time ago format
 * Examples: "1s", "30s", "1m", "5m", "1h", "2h", "1d", "2d", "1w", "1mo", "1y"
 */
export function formatTimeAgo(dateString: string, options: TimeAgoOptions = {}): string {
  const {
    showSeconds = true,
    maxDays = 7,
    showYear = true
  } = options;

  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  // Handle future dates
  if (diffInMs < 0) {
    return 'now';
  }

  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  // Seconds (0-59 seconds)
  if (showSeconds && diffInSeconds < 60) {
    return diffInSeconds <= 0 ? 'now' : `${diffInSeconds}s`;
  }

  // Minutes (1-59 minutes)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  // Hours (1-23 hours)
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  // Days (1-6 days)
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  // Weeks (1-3 weeks)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w`;
  }

  // Months (1-11 months)
  if (diffInMonths < 12) {
    return `${diffInMonths}mo`;
  }

  // Years (1+ years)
  if (showYear) {
    return `${diffInYears}y`;
  }

  // Fallback to days if year display is disabled
  return `${diffInDays}d`;
}

/**
 * Formats time ago with more detailed information for longer periods
 * Used for posts older than a week
 */
export function formatDetailedTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  if (diffInMs < 0) {
    return 'now';
  }

  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  // For posts older than a year, show the actual date
  if (diffInYears >= 1) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: diffInYears >= 2 ? 'numeric' : undefined
    });
  }

  // For posts older than a month, show month and day
  if (diffInMonths >= 1) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  // For posts older than a week, show week count
  if (diffInWeeks >= 1) {
    return `${diffInWeeks}w`;
  }

  // For posts older than a day, show day count
  return `${diffInDays}d`;
}

/**
 * Gets a more human-readable time format for accessibility
 * Used for screen readers and accessibility features
 */
export function getAccessibleTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  if (diffInMs < 0) {
    return 'just now';
  }

  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return diffInSeconds <= 0 ? 'just now' : `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }

  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }

  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
}

/**
 * Checks if a post is recent (within the last hour)
 * Used for real-time updates and live indicators
 */
export function isRecentPost(dateString: string, thresholdMinutes: number = 60): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  return diffInMinutes <= thresholdMinutes;
}

/**
 * Gets the appropriate time format based on post age
 * Automatically switches between compact and detailed formats
 */
export function getSmartTimeFormat(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Use compact format for recent posts (within a week)
  if (diffInDays < 7) {
    return formatTimeAgo(dateString);
  }

  // Use detailed format for older posts
  return formatDetailedTimeAgo(dateString);
}
