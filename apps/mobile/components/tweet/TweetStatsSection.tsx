import React from 'react';
import { Text, View, useColorScheme } from 'react-native';

interface TweetStatsSectionProps {
  replies?: number;
  likes?: number;
}

export default function TweetStatsSection({ 
  replies = 0, 
  likes = 0 
}: TweetStatsSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View className="pb-3">
      <View className="flex-row items-end">
        <Text 
          className="text-sm mr-4"
          style={{ color: secondaryTextColor }}
        >
          {replies} {replies === 1 ? 'reply' : 'replies'}
        </Text>
        <Text 
          className="text-sm"
          style={{ color: secondaryTextColor }}
        >
          {likes} {likes === 1 ? 'like' : 'likes'}
        </Text>
      </View>
    </View>
  );
}
