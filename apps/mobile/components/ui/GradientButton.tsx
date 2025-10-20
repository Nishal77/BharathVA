import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
  onPress: () => void;
  disabled?: boolean;
  text: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function GradientButton({ 
  onPress, 
  disabled = false, 
  text, 
  style, 
  textStyle 
}: GradientButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        style,
        disabled && styles.disabled,
        pressed && styles.pressed
      ]}
    >
      <LinearGradient
        colors={disabled ? ['#9CA3AF', '#6B7280'] : ['#3B82F6', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={[styles.text, textStyle]}>
          {text}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 28,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  disabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
