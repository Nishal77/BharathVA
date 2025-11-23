import React from 'react';
import { Animated, useColorScheme } from 'react-native';
import { Svg, Line } from 'react-native-svg';

interface CustomLoaderProps {
  spinValue: Animated.Value;
}

export default function CustomLoader({ spinValue }: CustomLoaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Svg width={18} height={18} viewBox="0 0 18 18">
        <Line x1="9" y1="1.75" x2="9" y2="4.25" fill="none" stroke={isDark ? '#FFFFFF' : '#000000'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <Line x1="14.127" y1="3.873" x2="12.359" y2="5.641" fill="none" opacity="0.88" stroke={isDark ? '#FFFFFF' : '#000000'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <Line x1="16.25" y1="9" x2="13.75" y2="9" fill="none" opacity="0.75" stroke={isDark ? '#FFFFFF' : '#000000'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <Line x1="14.127" y1="14.127" x2="12.359" y2="12.359" fill="none" opacity="0.63" stroke={isDark ? '#FFFFFF' : '#000000'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <Line x1="9" y1="16.25" x2="9" y2="13.75" fill="none" opacity="0.5" stroke={isDark ? '#FFFFFF' : '#000000'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <Line x1="3.873" y1="14.127" x2="5.641" y2="12.359" fill="none" opacity="0.38" stroke={isDark ? '#FFFFFF' : '#000000'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <Line x1="1.75" y1="9" x2="4.25" y2="9" fill="none" opacity="0.25" stroke={isDark ? '#FFFFFF' : '#000000'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <Line x1="3.873" y1="3.873" x2="5.641" y2="5.641" fill="none" opacity="0.13" stroke={isDark ? '#FFFFFF' : '#000000'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </Svg>
    </Animated.View>
  );
}
