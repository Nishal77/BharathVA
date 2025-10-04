import { ChartNoAxesColumn } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text } from 'react-native';

interface ViewCountProps {
  views?: number;
  onPress?: () => void;
}

export default function ViewCount({ views = 0, onPress }: ViewCountProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center">
      <ChartNoAxesColumn size={16} color="#546471" strokeWidth={2} />
      {views > 0 && (
        <Text className="text-xs font-normal ml-1.5" style={{ color: '#151515' }}>
          {views}
        </Text>
      )}
    </Pressable>
  );
}
