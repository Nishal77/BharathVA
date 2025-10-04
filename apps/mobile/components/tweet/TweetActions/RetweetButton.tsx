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
    <Pressable onPress={handleRetweet} className="flex-row items-center">
      <Animated.View style={{ transform: [{ scale: retweetScale }] }}>
        <Repeat2 size={16} color={isRetweeted ? "#22C55E" : "#546471"} strokeWidth={2} />
      </Animated.View>
      {retweets > 0 && (
        <Text className="text-xs font-normal ml-1.5" style={{ color: isRetweeted ? '#22C55E' : '#151515' }}>
          {retweets}
        </Text>
      )}
    </Pressable>
  );
}
