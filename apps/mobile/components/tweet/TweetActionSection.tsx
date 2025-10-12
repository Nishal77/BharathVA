import React from 'react';
import { Pressable, Text, View, useColorScheme } from 'react-native';
import { Image } from 'expo-image';

interface TweetActionSectionProps {
  onLike?: () => void;
  onReply?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

export default function TweetActionSection({ 
  onLike, 
  onReply, 
  onShare, 
  onBookmark 
}: TweetActionSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const textColor = isDark ? '#F9FAFB' : '#111827';

  return (
    <View className="mb-3">
      {/* Main Action Buttons */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center space-x-4">
          <Pressable className="p-1" onPress={onLike}>
            <Image
              source={require('../../assets/logo/heart.svg')}
              style={{
                width: 24,
                height: 24,
              }}
              contentFit="contain"
              tintColor={textColor}
            />
          </Pressable>
          <Pressable className="p-1" onPress={onReply}>
            <Image
              source={require('../../assets/logo/msg-writing.svg')}
              style={{
                width: 24,
                height: 24,
              }}
              contentFit="contain"
              tintColor={textColor}
            />
          </Pressable>
          <Pressable className="p-1" onPress={onShare}>
            <Image
              source={require('../../assets/logo/paper-plane-2.svg')}
              style={{
                width: 24,
                height: 24,
              }}
              contentFit="contain"
              tintColor={textColor}
            />
          </Pressable>
        </View>
        
        <View className="flex-row items-center space-x-3">
          <Pressable className="p-1">
            <Image
              source={require('../../assets/logo/plus.png')}
              style={{
                width: 20,
                height: 20,
              }}
              contentFit="contain"
              tintColor={textColor}
            />
          </Pressable>
          <Pressable className="p-1" onPress={onBookmark}>
            <Image
              source={require('../../assets/logo/bookmark.svg')}
              style={{
                width: 24,
                height: 24,
              }}
              contentFit="contain"
              tintColor={textColor}
            />
          </Pressable>
        </View>
      </View>

      {/* Perfect Emoji Reactions - Clean Design */}
      <View className="flex-row items-center mt-4">
        <View className="flex-row items-center space-x-2">
          {/* Emoji Reactions */}
          <Pressable className="flex-row items-center bg-white dark:bg-gray-800 rounded-full px-2 py-1 border border-gray-200 dark:border-gray-700">
            <Text style={{ fontSize: 16 }}>👍</Text>
            <Text style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600', marginLeft: 4 }}>12</Text>
          </Pressable>
          
          <Pressable className="flex-row items-center bg-white dark:bg-gray-800 rounded-full px-2 py-1 border border-gray-200 dark:border-gray-700">
            <Text style={{ fontSize: 16 }}>😂</Text>
            <Text style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600', marginLeft: 4 }}>8</Text>
          </Pressable>
          
          <Pressable className="flex-row items-center bg-white dark:bg-gray-800 rounded-full px-2 py-1 border border-gray-200 dark:border-gray-700">
            <Text style={{ fontSize: 16 }}>🔥</Text>
            <Text style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600', marginLeft: 4 }}>5</Text>
          </Pressable>
          
          <Pressable className="flex-row items-center bg-white dark:bg-gray-800 rounded-full px-2 py-1 border border-gray-200 dark:border-gray-700">
            <Text style={{ fontSize: 16 }}>😮</Text>
            <Text style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600', marginLeft: 4 }}>3</Text>
          </Pressable>
          
          {/* More Option */}
          <Pressable className="flex-row items-center bg-blue-50 dark:bg-blue-900/30 rounded-full px-2 py-1 border border-blue-200 dark:border-blue-700">
            <Text style={{ fontSize: 12, color: '#3B82F6', fontWeight: '700' }}>...more</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
