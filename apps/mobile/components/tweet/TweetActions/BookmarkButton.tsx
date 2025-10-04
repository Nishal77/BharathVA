import { Bookmark } from 'lucide-react-native';
import React, { useState } from 'react';
import { Animated, Pressable, Text } from 'react-native';

interface BookmarkButtonProps {
  bookmarks?: number;
  onPress?: () => void;
}

export default function BookmarkButton({ bookmarks = 0, onPress }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const bookmarkScale = new Animated.Value(1);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onPress?.();

    Animated.sequence([
      Animated.timing(bookmarkScale, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(bookmarkScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={handleBookmark}
      className="flex-row items-center p-1 rounded-lg"
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        backgroundColor: pressed ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
        <Bookmark
          size={18}
          color={isBookmarked ? "#A855F7" : "#6B7280"}
          strokeWidth={2}
          fill={isBookmarked ? "#A855F7" : "transparent"}
        />
      </Animated.View>
      {bookmarks > 0 && (
        <Text className="text-xs text-gray-500 ml-1.5 font-medium">
          {bookmarks}
        </Text>
      )}
    </Pressable>
  );
}
