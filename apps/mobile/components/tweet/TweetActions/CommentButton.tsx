import { MessageCircle } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text } from 'react-native';

interface CommentButtonProps {
  replies?: number;
  onPress?: () => void;
}

export default function CommentButton({ replies = 0, onPress }: CommentButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center p-1 rounded-lg"
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        backgroundColor: pressed ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      <MessageCircle size={18} color="#6B7280" strokeWidth={2} />
      {replies > 0 && (
        <Text className="text-xs text-gray-500 ml-1.5 font-medium">
          {replies}
        </Text>
      )}
    </Pressable>
  );
}
