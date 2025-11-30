import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Animated,
  Pressable,
  Dimensions,
  Platform,
  StatusBar,
  useColorScheme,
  KeyboardAvoidingView,
} from 'react-native';
import { BlurView } from 'expo-blur';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | string;
  showHandleBar?: boolean;
  showBackdrop?: boolean;
  backdropOpacity?: number;
  blurIntensity?: number;
  animationDuration?: number;
  enableKeyboardAvoiding?: boolean;
}

export default function BaseModal({
  visible,
  onClose,
  children,
  height = SCREEN_HEIGHT * 0.85,
  showHandleBar = true,
  showBackdrop = true,
  backdropOpacity = 0.6,
  blurIntensity = 20,
  animationDuration = 300,
  enableKeyboardAvoiding = false,
}: BaseModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: animationDuration * 0.7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: animationDuration * 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: animationDuration * 0.7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, animationDuration]);

  const modalBgColor = isDark ? '#1A1A1A' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';

  const content = (
    <View style={{ flex: 1 }}>
      {showBackdrop && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: fadeAnim,
          }}
        >
          <BlurView
            intensity={blurIntensity}
            tint={isDark ? 'dark' : 'light'}
            style={{
              flex: 1,
              backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
            }}
          >
            <Pressable
              style={{ flex: 1 }}
              onPress={onClose}
            />
          </BlurView>
        </Animated.View>
      )}

      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: typeof height === 'number' ? height : SCREEN_HEIGHT * 0.85,
          maxHeight: SCREEN_HEIGHT * 0.95,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -8,
          },
          shadowOpacity: 0.4,
          shadowRadius: 32,
          elevation: 32,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        }}
      >
        <BlurView
          intensity={isDark ? 90 : 100}
          tint={isDark ? 'dark' : 'light'}
          style={{
            flex: 1,
            backgroundColor: isDark ? 'rgba(20, 20, 20, 0.75)' : 'rgba(255, 255, 255, 0.85)',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
          }}
        >
        {showHandleBar && (
          <View
            style={{
              alignItems: 'center',
              paddingTop: 12,
              paddingBottom: 8,
            }}
          >
            <View
              style={{
                width: 40,
                height: 5,
                borderRadius: 3,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
              }}
            />
          </View>
        )}
        {children}
        </BlurView>
      </Animated.View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {enableKeyboardAvoiding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </Modal>
  );
}

