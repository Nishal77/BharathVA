import { ResizeMode, Video } from 'expo-av';
import { Volume2, VolumeX } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    StatusBar,
    Text,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface VideoIntroProps {
  onSkip: () => void;
}

export default function VideoIntro({ onSkip }: VideoIntroProps) {
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [videoStatus, setVideoStatus] = useState({});
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const skipButtonOpacity = useRef(new Animated.Value(0)).current;
  const skipButtonScale = useRef(new Animated.Value(0.8)).current;

  console.log('VideoIntro component rendered');

  useEffect(() => {
    // Show skip button after 2 seconds with animation
    const timer = setTimeout(() => {
      setShowSkipButton(true);
      // Animate skip button appearance
      Animated.parallel([
        Animated.timing(skipButtonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(skipButtonScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <View className="flex-1 bg-black">
      {/* Hide status bar for full screen experience */}
      <StatusBar hidden />
      
      {/* Fallback Background */}
      <View 
        className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
        style={{
          width: width,
          height: height,
        }}
      />
      
      {/* Full Screen Video */}
      <Video
        source={require('../../../assets/Videos/clip1.mp4')}
        style={{
          width: width,
          height: height,
        }}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted={isMuted}
        onPlaybackStatusUpdate={(status) => {
          setVideoStatus(() => status);
          if (status.isLoaded && !videoLoaded) {
            setVideoLoaded(true);
            console.log('Video loaded successfully');
          }
        }}
        onLoad={() => {
          console.log('Video load event triggered');
          setVideoLoaded(true);
        }}
        onError={(error) => {
          console.log('Video error:', error);
          // If video fails to load, show skip button immediately
          setShowSkipButton(true);
          Animated.parallel([
            Animated.timing(skipButtonOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(skipButtonScale, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();
        }}
      />

      {/* Volume Control Button - Always visible */}
      <View className="absolute top-12 left-6 z-10">
        <Pressable
          onPress={toggleMute}
          className="bg-black/60 backdrop-blur-md p-3 rounded-full border border-white/30"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 12,
          }}
        >
          {isMuted ? (
            <VolumeX size={24} color="#FFFFFF" />
          ) : (
            <Volume2 size={24} color="#FFFFFF" />
          )}
        </Pressable>
      </View>

      {/* Skip Button - Appears after 2 seconds with animation */}
      {showSkipButton && (
        <Animated.View 
          className="absolute top-12 right-6 z-10"
          style={{
            opacity: skipButtonOpacity,
            transform: [{ scale: skipButtonScale }],
          }}
        >
          <Pressable
            onPress={onSkip}
            className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/30"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 12,
            }}
          >
            <Text className="text-white font-bold text-base">
              Skip
            </Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Welcome Message Overlay */}
      <View className="absolute bottom-16 left-0 right-0 items-center">
        {showSkipButton && (
          <Animated.View 
            className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/20"
            style={{
              opacity: skipButtonOpacity,
              transform: [{ scale: skipButtonScale }],
            }}
          >
            <Text className="text-white/90 text-sm font-medium">
              Welcome to your journey! 🎉
            </Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
