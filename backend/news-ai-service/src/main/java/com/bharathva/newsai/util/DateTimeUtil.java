package com.bharathva.newsai.util;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Utility class for date/time operations with IST timezone support.
 * Handles conversion between UTC and IST for news timestamps.
 * 
 * @author BharathVA Engineering Team
 */
public class DateTimeUtil {

    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");
    private static final ZoneId UTC_ZONE = ZoneId.of("UTC");
    
    private static final DateTimeFormatter IST_FORMATTER = 
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a 'IST'");
    
    private static final DateTimeFormatter RELATIVE_FORMATTER = 
            DateTimeFormatter.ofPattern("dd MMM, hh:mm a");
    
    /**
     * Convert UTC LocalDateTime to IST ZonedDateTime.
     * Used when reading from database (stored in UTC).
     */
    public static ZonedDateTime utcToIst(LocalDateTime utcDateTime) {
        if (utcDateTime == null) {
            return null;
        }
        return utcDateTime.atZone(UTC_ZONE).withZoneSameInstant(IST_ZONE);
    }
    
    /**
     * Convert IST ZonedDateTime to UTC LocalDateTime.
     * Used when saving to database (store in UTC).
     */
    public static LocalDateTime istToUtc(ZonedDateTime istDateTime) {
        if (istDateTime == null) {
            return null;
        }
        return istDateTime.withZoneSameInstant(UTC_ZONE).toLocalDateTime();
    }
    
    /**
     * Get current time in IST as ZonedDateTime.
     */
    public static ZonedDateTime nowInIst() {
        return ZonedDateTime.now(IST_ZONE);
    }
    
    /**
     * Get current time in UTC as LocalDateTime (for database storage).
     */
    public static LocalDateTime nowInUtc() {
        return LocalDateTime.now(UTC_ZONE);
    }
    
    /**
     * Format UTC datetime as IST string for display.
     * Example: "12 Jan 2025, 03:30 PM IST"
     */
    public static String formatAsIst(LocalDateTime utcDateTime) {
        if (utcDateTime == null) {
            return "";
        }
        ZonedDateTime istDateTime = utcToIst(utcDateTime);
        return istDateTime.format(IST_FORMATTER);
    }
    
    /**
     * Format UTC datetime as relative time string (e.g., "5 hours ago", "2 days ago").
     * This is for the news card display.
     */
    public static String formatRelativeTime(LocalDateTime utcDateTime) {
        if (utcDateTime == null) {
            return "";
        }
        
        ZonedDateTime istDateTime = utcToIst(utcDateTime);
        ZonedDateTime now = nowInIst();
        
        long minutesDiff = java.time.Duration.between(istDateTime, now).toMinutes();
        
        if (minutesDiff < 1) {
            return "Just now";
        } else if (minutesDiff < 60) {
            return minutesDiff + (minutesDiff == 1 ? " minute ago" : " minutes ago");
        } else if (minutesDiff < 1440) { // Less than 24 hours
            long hours = minutesDiff / 60;
            return hours + (hours == 1 ? " hour ago" : " hours ago");
        } else if (minutesDiff < 10080) { // Less than 7 days
            long days = minutesDiff / 1440;
            return days + (days == 1 ? " day ago" : " days ago");
        } else {
            // For older news, show the date
            return istDateTime.format(RELATIVE_FORMATTER);
        }
    }
    
    /**
     * Parse RSS feed date string and convert to UTC LocalDateTime.
     * Handles various RSS date formats.
     */
    public static LocalDateTime parseRssFeedDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return nowInUtc();
        }
        
        try {
            // Try parsing common RSS date formats
            // RFC 822 format: "Wed, 12 Jan 2025 14:30:00 +0530"
            DateTimeFormatter rfc822 = DateTimeFormatter.RFC_1123_DATE_TIME;
            ZonedDateTime parsed = ZonedDateTime.parse(dateString, rfc822);
            return istToUtc(parsed.withZoneSameInstant(IST_ZONE));
        } catch (Exception e) {
            // If parsing fails, use current time
            return nowInUtc();
        }
    }
}

