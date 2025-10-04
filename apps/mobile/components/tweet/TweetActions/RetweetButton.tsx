import { Repeat2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Animated, Pressable, Text } from 'react-native';

interface RetweetButtonProps {
  retweets?: number;
  onPress?: () => void;
}

export default function RetweetButton({ retweets = 0, onPress }: RetweetButtonProps) {
  const [isRetweeted, setIsRetweeted] = useState(false);
  const retweetScale = new Animated.Value(1);

  const handleRetweet = () => {
    setIsRetweeted(!isRetweeted);
    onPress?.();

    Animated.sequence([
      Animated.timing(retweetScale, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(retweetScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={handleRetweet}
      className="flex-row items-center p-1 rounded-lg"
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        backgroundColor: pressed ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      <Animated.View style={{ transform: [{ scale: retweetScale }] }}>
        <Repeat2 size={18} color={isRetweeted ? "#22C55E" : "#6B7280"} strokeWidth={2} />
      </Animated.View>
      {retweets > 0 && (
        <Text className="text-xs text-gray-500 ml-1.5 font-medium">
          {retweets}
        </Text>
      )}
    </Pressable>
  );
}
