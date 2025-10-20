import React, { useState } from 'react';
import { View, StyleSheet, useColorScheme, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PostHeader from './PostHeader';
import PostMainContent from './PostMainContent';

interface PostComposerProps {
  onPost?: (content: string) => void;
  onCancel?: () => void;
}

export default function PostComposer({ onPost, onCancel }: PostComposerProps) {
  const [content, setContent] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  // Calculate the total header height including status bar
  const dynamicMarginTop = Platform.OS === 'android' 
    ? StatusBar.currentHeight || 0 
    : insets.top || 0;
  const headerHeight = 44; // Fixed header height
  const totalHeaderHeight = dynamicMarginTop + headerHeight;

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handlePost = () => {
    if (content.trim().length > 0 && onPost) {
      onPost(content.trim());
      setContent('');
    }
  };

  const handleCancel = () => {
    setContent('');
    if (onCancel) {
      onCancel();
    }
  };

  const canPost = content.trim().length > 0 && content.length <= 280;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <PostHeader
        onCancel={handleCancel}
        canPost={canPost}
        onPost={handlePost}
        isDark={isDark}
      />
      
      <View style={[styles.contentWrapper, { 
        paddingTop: totalHeaderHeight + 8,
        backgroundColor: isDark ? '#000000' : '#FFFFFF'
      }]}>
        <PostMainContent
          onContentChange={handleContentChange}
          isDark={isDark}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
});
