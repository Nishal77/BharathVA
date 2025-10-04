import { Share2 } from 'lucide-react-native';
import React from 'react';
import { Pressable } from 'react-native';

interface ShareButtonProps {
  onPress?: () => void;
}

export default function ShareButton({ onPress }: ShareButtonProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center">
      <Share2 size={16} color="#546471" strokeWidth={2} />
    </Pressable>
  );
}
