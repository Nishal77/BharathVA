import { useState, useEffect } from 'react';
import { formatTimeAgo, getSmartTimeFormat } from '../utils/timeUtils';

/**
 * Hook that provides real-time updating time ago functionality
 * Updates every second for recent posts, less frequently for older posts
 */
export function useTimeAgo(dateString: string, options?: { 
  updateInterval?: number;
  maxUpdateInterval?: number;
}) {
  const [timeAgo, setTimeAgo] = useState<string>(() => getSmartTimeFormat(dateString));
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const {
    updateInterval = 1000, // Update every second by default
    maxUpdateInterval = 60000 // Max 1 minute for older posts
  } = options || {};

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeSinceLastUpdate = now.getTime() - lastUpdate.getTime();
      
      // Determine update frequency based on post age
      const postDate = new Date(dateString);
      const postAge = now.getTime() - postDate.getTime();
      const postAgeInMinutes = postAge / (1000 * 60);
      
      let currentUpdateInterval = updateInterval;
      
      // Adjust update frequency based on post age
      if (postAgeInMinutes > 60) {
        // Posts older than 1 hour: update every 5 minutes
        currentUpdateInterval = 5 * 60 * 1000;
      } else if (postAgeInMinutes > 10) {
        // Posts older than 10 minutes: update every minute
        currentUpdateInterval = 60 * 1000;
      } else if (postAgeInMinutes > 1) {
        // Posts older than 1 minute: update every 10 seconds
        currentUpdateInterval = 10 * 1000;
      }
      
      // Don't update more frequently than the minimum interval
      if (timeSinceLastUpdate >= currentUpdateInterval) {
        setTimeAgo(getSmartTimeFormat(dateString));
        setLastUpdate(now);
      }
    };

    // Initial update
    updateTime();

    // Set up interval based on post age
    const postDate = new Date(dateString);
    const postAge = Date.now() - postDate.getTime();
    const postAgeInMinutes = postAge / (1000 * 60);
    
    let interval: NodeJS.Timeout;
    
    if (postAgeInMinutes < 1) {
      // Very recent posts: update every second
      interval = setInterval(updateTime, 1000);
    } else if (postAgeInMinutes < 10) {
      // Recent posts: update every 10 seconds
      interval = setInterval(updateTime, 10 * 1000);
    } else if (postAgeInMinutes < 60) {
      // Posts less than an hour old: update every minute
      interval = setInterval(updateTime, 60 * 1000);
    } else {
      // Older posts: update every 5 minutes
      interval = setInterval(updateTime, 5 * 60 * 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [dateString, updateInterval, lastUpdate]);

  return timeAgo;
}

/**
 * Hook for batch time ago updates (useful for feed lists)
 * Updates all timestamps at once to avoid excessive re-renders
 */
export function useBatchTimeAgo(dateStrings: string[], updateInterval: number = 10000) {
  const [timeAgoMap, setTimeAgoMap] = useState<Record<string, string>>(() => {
    const initialMap: Record<string, string> = {};
    dateStrings.forEach(dateString => {
      initialMap[dateString] = getSmartTimeFormat(dateString);
    });
    return initialMap;
  });

  useEffect(() => {
    const updateAllTimes = () => {
      const newMap: Record<string, string> = {};
      dateStrings.forEach(dateString => {
        newMap[dateString] = getSmartTimeFormat(dateString);
      });
      setTimeAgoMap(newMap);
    };

    // Initial update
    updateAllTimes();

    // Set up interval
    const interval = setInterval(updateAllTimes, updateInterval);

    return () => {
      clearInterval(interval);
    };
  }, [dateStrings, updateInterval]);

  return timeAgoMap;
}
