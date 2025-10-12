import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, useColorScheme } from 'react-native';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  duration?: number;
  onHide?: () => void;
}

export default function Toast({ 
  message, 
  type, 
  visible, 
  duration = 3000, 
  onHide 
}: ToastProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const getToastStyles = () => {
    const baseStyles = {
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: '#10B981',
        };
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: '#EF4444',
        };
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: '#F59E0B',
        };
      case 'info':
        return {
          ...baseStyles,
          backgroundColor: isDark ? '#374151' : '#F3F4F6',
          borderWidth: 1,
          borderColor: isDark ? '#4B5563' : '#D1D5DB',
        };
      default:
        return baseStyles;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
      case 'error':
      case 'warning':
        return '#FFFFFF';
      case 'info':
        return isDark ? '#F9FAFB' : '#111827';
      default:
        return isDark ? '#F9FAFB' : '#111827';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        zIndex: 1000,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View style={getToastStyles()}>
        <Text
          style={{
            color: getTextColor(),
            fontSize: 14,
            fontWeight: '500',
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
