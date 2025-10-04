import { MessageCircle } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text } from 'react-native';

interface CommentButtonProps {
  replies?: number;
  onPress?: () => void;
}

export default function CommentButton({ replies = 0, onPress }: CommentButtonProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center">
      <MessageCircle size={16} color="#546471" strokeWidth={2} />
      {replies > 0 && (
        <Text className="text-xs font-normal ml-1.5" style={{ color: '#151515' }}>
          {replies}
        </Text>
      )}
    </Pressable>
  );
}
