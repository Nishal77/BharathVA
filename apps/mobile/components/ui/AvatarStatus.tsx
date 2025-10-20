import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AvatarStatusProps {
  initial: string;
  isOnline?: boolean;
  size?: number;
  showProgressRing?: boolean;
  progress?: number;
}

export default function AvatarStatus({ 
  initial, 
  isOnline = true, 
  size = 44, 
  showProgressRing = false,
  progress = 0 
}: AvatarStatusProps) {
  const avatarSize = size;
  const ringSize = avatarSize + 8;

  return (
    <View style={[styles.container, { width: ringSize, height: ringSize }]}>
      {showProgressRing && (
        <View style={[styles.progressRing, { 
          width: ringSize, 
          height: ringSize,
          borderColor: progress > 0 ? '#3B82F6' : 'transparent'
        }]} />
      )}
      
      <View style={[styles.avatar, { 
        width: avatarSize, 
        height: avatarSize, 
        borderRadius: avatarSize / 2 
      }]}>
        <Text style={[styles.initial, { fontSize: avatarSize * 0.4 }]}>
          {initial}
        </Text>
      </View>
      
      {isOnline && (
        <View style={[styles.onlineIndicator, { 
          width: avatarSize * 0.25, 
          height: avatarSize * 0.25,
          borderRadius: (avatarSize * 0.25) / 2,
          right: avatarSize * 0.05,
          bottom: avatarSize * 0.05
        }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  avatar: {
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
