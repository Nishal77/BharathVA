import React from 'react';
import { Text, View, useColorScheme } from 'react-native';

interface FeedStatsSectionProps {
  replies?: number;
  likes?: number;
  views?: number;
}

// Utility function to format large numbers as 1.2k, 5M, etc.
function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

export default function FeedStatsSection({ 
  replies = 0, 
  likes = 0,
  views = 2500, // For testing, hardcode views to 2.5k
}: FeedStatsSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View className="pb-3 pr-1">
      <View className="flex-row items-end">
        <Text 
          className="text-sm mr-4"
          style={{ color: secondaryTextColor }}
        >
          {replies} {replies === 1 ? 'reply' : 'replies'}
        </Text>
        <Text 
          className="text-sm mr-4"
          style={{ color: secondaryTextColor }}
        >
          {likes} {likes === 1 ? 'like' : 'likes'}
        </Text>
        <Text 
          className="text-sm mr-4"
          style={{ color: secondaryTextColor }}
        >
          {formatNumber(views)} {views === 1 ? 'view' : 'views'}
        </Text>
      </View>
    </View>
  );
}
