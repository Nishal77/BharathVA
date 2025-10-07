import React from 'react';
import { Text, View, useColorScheme } from 'react-native';

export default function ProfileBio() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#E5E7EB' : '#1F2937';

  return (
    <View className="px-5 pt-1 pb-4" style={{ backgroundColor: bgColor }}>
      <Text 
        className="leading-5 text-left"
        style={{ color: textColor }}
      >
        Contributed to AI research (MIT Press) | Embedding AI into your thoughts w/ a Voice-First app | Dropped out
      </Text>
    </View>
  );
}
