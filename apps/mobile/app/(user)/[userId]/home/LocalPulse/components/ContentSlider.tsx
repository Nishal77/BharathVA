import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, Dimensions, useColorScheme } from 'react-native';
import WeatherCard from './WeatherCard';
import BreakingNews from './BreakingNews';
// import LocalAlerts from './LocalAlerts';

interface ContentSliderProps {
  breakingNewsItems?: any[];
  localAlertsItems?: any[];
  onWeatherPress?: () => void;
  onBreakingNewsPress?: (item: any) => void;
  onLocalAlertsPress?: (item: any) => void;
}

const { width } = Dimensions.get('window');
const SLIDE_INTERVAL = 5500; // 5.5 seconds for premium feel
const ANIMATION_DURATION = 700; // 700ms for smooth transition
const TOTAL_SLIDES = 2; // Weather, Breaking News
// const TOTAL_SLIDES = 3; // Weather, Breaking News, Local Alerts (commented out)

export default function ContentSlider({
  breakingNewsItems,
  localAlertsItems,
  onWeatherPress,
  onBreakingNewsPress,
  onLocalAlertsPress,
}: ContentSliderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dotAnim1 = useRef(new Animated.Value(1)).current; // Active dot scale
  const dotAnim2 = useRef(new Animated.Value(0.5)).current; // Inactive dot scale
  const dotAnim3 = useRef(new Animated.Value(0.5)).current; // Inactive dot scale

  useEffect(() => {
    // Start the auto-slide interval
    const startInterval = () => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % TOTAL_SLIDES;
          
          // Animate slide transition with easing
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: nextIndex,
              duration: ANIMATION_DURATION,
              useNativeDriver: true,
            }),
            // Animate dot indicators
            Animated.parallel([
              Animated.timing(nextIndex === 0 ? dotAnim1 : dotAnim2, {
                toValue: 1,
                duration: ANIMATION_DURATION,
                useNativeDriver: true,
              }),
              Animated.timing(nextIndex === 0 ? dotAnim2 : dotAnim1, {
                toValue: 0.5,
                duration: ANIMATION_DURATION,
                useNativeDriver: true,
              }),
            ]),
            // Animated.parallel([
            //   Animated.timing(nextIndex === 0 ? dotAnim1 : (nextIndex === 1 ? dotAnim2 : dotAnim3), {
            //     toValue: 1,
            //     duration: ANIMATION_DURATION,
            //     useNativeDriver: true,
            //   }),
            //   Animated.timing(nextIndex === 0 ? dotAnim2 : (nextIndex === 1 ? dotAnim3 : dotAnim1), {
            //     toValue: 0.5,
            //     duration: ANIMATION_DURATION,
            //     useNativeDriver: true,
            //   }),
            //   Animated.timing(nextIndex === 0 ? dotAnim3 : (nextIndex === 1 ? dotAnim1 : dotAnim2), {
            //     toValue: 0.5,
            //     duration: ANIMATION_DURATION,
            //     useNativeDriver: true,
            //   }),
            // ]),
          ]).start();

          return nextIndex;
        });
      }, SLIDE_INTERVAL);
    };

    startInterval();

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Calculate translateX based on current index
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width],
  });
  // const translateX = slideAnim.interpolate({
  //   inputRange: [0, 1, 2],
  //   outputRange: [0, -width, -width * 2],
  // });

  // Dot opacity animations
  const dotOpacity1 = dotAnim1.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0.4, 1],
  });

  const dotOpacity2 = dotAnim2.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0.4, 1],
  });

  const dotOpacity3 = dotAnim3.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0.4, 1],
  });

  return (
    <View style={{ width }}>
      <View style={{ overflow: 'hidden', width }}>
        <Animated.View
          style={{
            flexDirection: 'row',
            transform: [{ translateX }],
            width: width * TOTAL_SLIDES,
          }}
        >
          {/* Weather Card */}
          <View style={{ width }}>
            <WeatherCard onPress={onWeatherPress} />
          </View>

          {/* Breaking News */}
          <View style={{ width }}>
            <BreakingNews
              items={breakingNewsItems || []}
              onPress={onBreakingNewsPress}
            />
          </View>

          {/* Local Alerts - Commented out temporarily */}
          {/* LocalAlerts component temporarily disabled */}
        </Animated.View>
      </View>

      {/* Dot Indicators */}
      <View className="flex-row items-center justify-center gap-2 mt-3 mb-2">
        <Animated.View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: isDark ? '#FFFFFF' : '#000000',
            opacity: dotOpacity1,
            transform: [{ scale: dotAnim1 }],
          }}
        />
        <Animated.View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: isDark ? '#FFFFFF' : '#000000',
            opacity: dotOpacity2,
            transform: [{ scale: dotAnim2 }],
          }}
        />
        {/* Third dot indicator - commented out temporarily */}
        {/* <Animated.View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: isDark ? '#FFFFFF' : '#000000',
            opacity: dotOpacity3,
            transform: [{ scale: dotAnim3 }],
          }}
        /> */}
      </View>
    </View>
  );
}

