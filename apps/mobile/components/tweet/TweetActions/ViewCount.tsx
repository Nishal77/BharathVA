import { ChartNoAxesColumn } from 'lucide-react-native';
import React from 'react';
import { Pressable } from 'react-native';

interface ViewCountProps {
  onPress?: () => void;
}

export default function ViewCount({ onPress }: ViewCountProps) {
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
      <ChartNoAxesColumn size={18} color="#6B7280" strokeWidth={2} />
    </Pressable>
  );
}
