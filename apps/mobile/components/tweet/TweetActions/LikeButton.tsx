import { Heart } from 'lucide-react-native';
import React, { useState } from 'react';
import { Animated, Pressable, Text } from 'react-native';

interface LikeButtonProps {
  likes?: number;
  onPress?: () => void;
}

export default function LikeButton({ likes = 0, onPress }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const likeScale = new Animated.Value(1);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onPress?.();

    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable onPress={handleLike} className="flex-row items-center">
      <Animated.View style={{ transform: [{ scale: likeScale }] }}>
        <Heart
          size={16}
          color={isLiked ? "#EF4444" : "#546471"}
          strokeWidth={2}
          fill={isLiked ? "#EF4444" : "transparent"}
        />
      </Animated.View>
      {likes > 0 && (
        <Text className="text-xs font-normal ml-1.5" style={{ color: isLiked ? '#EF4444' : '#151515' }}>
          {likes}
        </Text>
      )}
    </Pressable>
  );
}
