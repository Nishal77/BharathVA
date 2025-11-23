import { ResizeMode, Video } from 'expo-av';
import { Svg, Path as SvgPath } from 'react-native-svg';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    StatusBar,
    Text,
    View,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { profileService } from '../../services/api/profileService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

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
  const router = useRouter();
  const [finishing, setFinishing] = useState(false);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

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

  const goToHomeTabs = () => {
    if (user?.userId) {
      router.replace(`/(user)/${user.userId}/(tabs)`);
    } else {
      router.replace('/'); // Fallback
    }
  };

  const finishOnboarding = async () => {
    if (finishing) return;
    setFinishing(true);
    try {
      // Profile data is already saved in profile-setup step. Just proceed.
      try { await AsyncStorage.removeItem('registration_profile_draft'); } catch {}
      setFinishing(false);
      goToHomeTabs();
    } catch (e: any) {
      setFinishing(false);
      goToHomeTabs();
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.removeItem('registration_profile_draft');
    } catch {}
    goToHomeTabs();
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
        source={require('../../assets/Videos/Clip.mp4')}
        style={{
          width: width,
          height: height,
        }}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        isMuted={isMuted}
        onPlaybackStatusUpdate={(status) => {
          setVideoStatus(() => status);
          if (status.isLoaded && !videoLoaded) {
            setVideoLoaded(true);
            console.log('Video loaded successfully');
          }
          // Auto-redirect when video finishes
          // Expo AV sets didJustFinish on completion when not looping
          if ((status as any)?.didJustFinish) {
            handleSkip();
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
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <SvgPath d="M11 5L6 9H3v6h3l5 4V5z" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <SvgPath d="M16 9l4 4m0-4l-4 4" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          ) : (
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <SvgPath d="M11 5L6 9H3v6h3l5 4V5z" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <SvgPath d="M15 9.5a4 4 0 010 5" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <SvgPath d="M17 7a7 7 0 010 10" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
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

      {/* Top-right Skip overlay */}
      <Pressable
        onPress={handleSkip}
        style={({ pressed }) => [{
          position: 'absolute',
          top: insets.top + 12,
          right: 16,
          zIndex: 50,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 20,
          backgroundColor: 'rgba(17, 17, 17, 0.72)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)',
          opacity: pressed ? 0.9 : 1,
        }]}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>Skip</Text>
      </Pressable>

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

      {/* Footer actions */}
      <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
        <Pressable onPress={finishOnboarding} style={({ pressed }) => [{
          height: 50,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#E5E7EB',
          opacity: pressed ? 0.95 : 1,
        }]}>
          <Text style={{ color: '#111827', fontSize: 16, fontWeight: '800' }}>{finishing ? 'Finishing…' : 'Continue'}</Text>
        </Pressable>
        <Pressable onPress={handleSkip} style={({ pressed }) => [{
          height: 50,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 10,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: '#D1D5DB',
          opacity: pressed ? 0.95 : 1,
        }]}>
          <Text style={{ color: '#111827', fontSize: 16, fontWeight: '700' }}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}
