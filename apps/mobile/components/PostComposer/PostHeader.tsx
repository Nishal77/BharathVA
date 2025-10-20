import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface PostHeaderProps {
  onCancel: () => void;
  canPost: boolean;
  onPost: () => void;
  isDark: boolean;
}

export default function PostHeader({ onCancel, canPost, onPost, isDark }: PostHeaderProps) {
  const insets = useSafeAreaInsets();
  const dynamicMarginTop = Platform.OS === 'android' 
    ? StatusBar.currentHeight || 0 
    : insets.top || 0;

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
          borderBottomColor: isDark ? '#333333' : '#F0F0F0',
          marginTop: dynamicMarginTop,
        },
      ]}
    >
      <Pressable
        onPress={onCancel}
        style={styles.cancelButton}
        accessibilityRole="button"
        accessibilityLabel="Cancel post creation"
      >
        <Text
          style={[
            styles.cancelText,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}
        >
          Cancel
        </Text>
      </Pressable>

     
      <Pressable
        onPress={onPost}
        disabled={!canPost}
        style={[
          styles.postButton,
          {
            backgroundColor: canPost 
              ? '#1DA1F2' 
              : isDark ? '#333333' : '#E5E5E5',
            opacity: canPost ? 1 : 0.6,
          }
        ]}
        accessibilityRole="button"
        accessibilityLabel="Post content"
      >
        <Text
          style={[
            styles.postText,
            { 
              color: canPost 
                ? '#FFFFFF' 
                : isDark ? '#666666' : '#999999'
            }
          ]}
        >
          Post
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderBottomWidth: 1,
    height: 44,
  },
  cancelButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
