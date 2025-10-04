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
    <Pressable onPress={handleBookmark} className="flex-row items-center">
      <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
        <Bookmark
          size={16}
          color={isBookmarked ? "#A855F7" : "#546471"}
          strokeWidth={2}
          fill={isBookmarked ? "#A855F7" : "transparent"}
        />
      </Animated.View>
      {bookmarks > 0 && (
        <Text className="text-xs font-normal ml-1.5" style={{ color: isBookmarked ? '#A855F7' : '#151515' }}>
          {bookmarks}
        </Text>
      )}
    </Pressable>
  );
}
