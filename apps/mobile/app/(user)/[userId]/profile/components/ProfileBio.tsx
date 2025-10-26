import React from 'react';
import { Text, View, useColorScheme } from 'react-native';

export default function ProfileBio() {
  const colorScheme = useColorScheme();
  // const isDark = colorScheme === 'dark';
  
  // const bgColor = isDark ? '#000000' : '#FFFFFF';
  // const textColor = isDark ? '#E5E7EB' : '#1F2937';

  return (
    <View className="px-5 pt-1 pb-4 dark:bg-[#000000] bg-white" >
      <Text 
        className="leading-5 text-left text-black dark:text-[#E7E9EA]" 
        // or #C9CDD0
        // style={{ color: textColor }}
      >
        Contributed to AI research (MIT Press) | Embedding AI into your thoughts w/ a Voice-First app | Dropped out
      </Text>
    </View>
  );
}
