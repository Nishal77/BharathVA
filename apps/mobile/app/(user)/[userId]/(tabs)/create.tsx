import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { PostComposer } from '../../../../components/PostComposer';

export default function CreateScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePost = (content: string) => {
    console.log('New post created:', content);
    // TODO: Implement post creation API call
    // For now, just navigate back
    router.back();
  };

  const handleCancel = () => {
    console.log('Post creation cancelled');
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <PostComposer 
        onPost={handlePost}
        onCancel={handleCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});