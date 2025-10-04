import React from 'react';
import { Text, View } from 'react-native';

interface TweetContentProps {
  text: string;
  emojis?: string[];
}

export default function TweetContent({ text, emojis }: TweetContentProps) {
  return (
    <View className="mb-4 ml-[52px] -mt-4">
      <Text className="text-base text-black leading-6">
        {text}
        {emojis && (
          <Text className="text-lg ml-1">
            {emojis.join(' ')}
          </Text>
        )}
      </Text>
    </View>
  );
}
