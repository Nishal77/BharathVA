import { Share2 } from 'lucide-react-native';
import React from 'react';
import { Pressable } from 'react-native';

interface ShareButtonProps {
  onPress?: () => void;
}

export default function ShareButton({ onPress }: ShareButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center p-1 rounded-lg"
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        backgroundColor: pressed ? 'rgba(107, 114, 128, 0.1)' : 'transparent',
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      <Share2 size={18} color="#6B7280" strokeWidth={2} />
    </Pressable>
  );
}
