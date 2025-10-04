import React from 'react';
import { Text, View } from 'react-native';

interface MessageBubbleProps {
  text: string;
  timestamp: string;
  isFromUser: boolean;
  isLastMessage?: boolean;
}

export default function MessageBubble({
  text,
  timestamp,
  isFromUser,
  isLastMessage = false,
}: MessageBubbleProps) {
  return (
    <View
      className={`mb-4 ${isFromUser ? 'items-end' : 'items-start'}`}
    >
      <View
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isFromUser
            ? 'bg-blue-500 rounded-br-md'
            : 'bg-white rounded-bl-md shadow-sm'
        }`}
      >
        <Text
          className={`text-base leading-relaxed ${
            isFromUser ? 'text-white' : 'text-gray-900'
          }`}
        >
          {text}
        </Text>
      </View>
      <Text className="text-gray-500 text-xs mt-1 px-2">
        {timestamp}
      </Text>
    </View>
  );
}
