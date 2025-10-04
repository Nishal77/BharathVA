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
    <Pressable
      onPress={handleLike}
      className="flex-row items-center p-1 rounded-lg"
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        backgroundColor: pressed ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      <Animated.View style={{ transform: [{ scale: likeScale }] }}>
        <Heart
          size={18}
          color={isLiked ? "#EF4444" : "#6B7280"}
          strokeWidth={2}
          fill={isLiked ? "#EF4444" : "transparent"}
        />
      </Animated.View>
      {likes > 0 && (
        <Text className={`text-xs ml-1.5 font-semibold ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
          {likes}
        </Text>
      )}
    </Pressable>
  );
}
