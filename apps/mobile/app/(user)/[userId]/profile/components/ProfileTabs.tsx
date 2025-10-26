import React, { useRef, useState } from 'react';
import { Animated, Pressable, Text, View, useColorScheme } from 'react-native';

interface ProfileTabsProps {
  onTabChange?: (tab: string) => void;
}

export default function ProfileTabs({ onTabChange }: ProfileTabsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [activeTab, setActiveTab] = useState('Feed');
  const [tabWidths, setTabWidths] = useState<number[]>([]);
  const [tabPositions, setTabPositions] = useState<number[]>([]);
  
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const colorAnimation = useRef(new Animated.Value(0)).current;

  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const activeTextColor = isDark ? '#F9FAFB' : '#111827';
  const inactiveTextColor = isDark ? '#71767B' : '#9CA3AF';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  // Indian-inspired gradient colors
  const colors = {
    saffron: '#FF9933',    // Saffron orange
    white: '#FFFFFF',      // White
    green: '#138808',      // India green
    navy: '#000080',       // Navy blue
  };

  const tabs = ['Feed', 'Media', 'Video', 'Replies'];

  const handleTabPress = (tab: string) => {
    const tabIndex = tabs.indexOf(tab);
    if (tabIndex !== -1 && tabPositions.length > tabIndex) {
      // Animate slide to new position
      Animated.timing(slideAnimation, {
        toValue: tabPositions[tabIndex],
        duration: 300,
        useNativeDriver: false,
      }).start();

      // Animate color transition
      Animated.timing(colorAnimation, {
        toValue: tabIndex,
        duration: 300,
        useNativeDriver: false,
      }).start();

      setActiveTab(tab);
      onTabChange?.(tab);
    }
  };

  const onTabLayout = (event: any, index: number) => {
    const { x, width } = event.nativeEvent.layout;
    setTabPositions(prev => {
      const newPositions = [...prev];
      newPositions[index] = x;
      return newPositions;
    });
    setTabWidths(prev => {
      const newWidths = [...prev];
      newWidths[index] = width;
      return newWidths;
    });
  };

  const getGradientColor = (index: number) => {
    const inputRange = tabs.map((_, i) => i);
    return colorAnimation.interpolate({
      inputRange,
      outputRange: [
        colors.saffron,   // Feed - Saffron
        colors.green,     // Media - Green
        colors.navy,      // Video - Navy
        colors.saffron,   // Replies - Saffron
      ],
    });
  };

  return (
    <View className="px-5 pt-4 pb-2 bg-white dark:bg-[#000000]" >
      <View className={`flex-row items-center border-b ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
        {tabs.map((tab, index) => (
          <Pressable
            key={tab}
            onPress={() => handleTabPress(tab)}
            className="flex-1 py-3"
            onLayout={(event) => onTabLayout(event, index)}
          >
            <View className="items-center">
              <Text 
                className="text-base font-medium"
                style={{ 
                  color: activeTab === tab ? activeTextColor : inactiveTextColor 
                }}
              >
                {tab}
              </Text>
            </View>
          </Pressable>
        ))}
        
        {/* Animated Gradient Underline */}
        {tabWidths.length === tabs.length && (
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: slideAnimation,
              width: tabWidths[tabs.indexOf(activeTab)] || 0,
              height: 3,
              borderRadius: 1.5,
            }}
          >
            <Animated.View
              style={{
                flex: 1,
                borderRadius: 1.5,
                backgroundColor: getGradientColor(tabs.indexOf(activeTab)),
              }}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}
