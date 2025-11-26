import React from 'react';
import { Image, Pressable, Text, View, useColorScheme, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { MoreHorizontal } from 'lucide-react-native';

interface FeedContentSectionProps {
  name: string;
  handle: string;
  time: string;
  verified?: boolean;
  content: string;
  emojis?: string[];
}

export default function FeedContentSection({ 
  name, 
  handle, 
  time, 
  verified = false, 
  content, 
  emojis 
}: FeedContentSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [fontsLoaded] = useFonts({
    'Chirp-Regular': require('../../assets/fonts/Chirp-Regular.ttf'),
    'Chirp-Medium': require('../../assets/fonts/Chirp-Medium.ttf'),
    'Chirp-Bold': require('../../assets/fonts/Chirp-Bold.ttf'),
    'Chirp Heavy': require('../../assets/fonts/Chirp Heavy.ttf'),
  });
  
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';

  if (!fontsLoaded) {
    return (
      <View style={{ padding: 8, alignItems: 'center', justifyContent: 'center', minHeight: 60 }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <View className="flex-1 pr-1">
      {/* Header Row - Name, @Username, Time, 3 Dots */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Text 
            className={`mr-1 text-[15px] ${name === '[Deleted User]' ? 'italic' : ''} ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
            style={{ 
              fontFamily: 'Chirp-Bold',
              fontWeight: '700',
              fontSize: 15,
              color: name === '[Deleted User]' ? secondaryTextColor : textColor,
              letterSpacing: -0.1,
            }}
          >
            {name}
          </Text>
          {verified && name !== '[Deleted User]' && (
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3256/3256004.png' }}
              className="w-4 h-4 mr-1"
              resizeMode="contain"
              onError={() => console.log('Verified badge failed to load')}
            />
          )}
          <Text 
            className={`mr-2 text-[13px] ${handle.startsWith('[deleted_') ? 'italic' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            style={{ 
              fontFamily: 'Chirp-Regular',
              color: handle.startsWith('[deleted_') ? secondaryTextColor : secondaryTextColor,
              letterSpacing: 0.05,
            }}
          >
            @{handle}
          </Text>
          <Text 
            className={`text-[13px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            style={{ 
              fontFamily: 'Chirp-Regular',
              color: secondaryTextColor,
              letterSpacing: 0.05,
            }}
          >
            · {time}
          </Text>
        </View>
        <Pressable className="p-1 pr-1">
          <MoreHorizontal size={20} color={secondaryTextColor} />
        </Pressable>
      </View>

      {/* Caption */}
      <View className="mb-3">
        <Text 
          className={`text-[15px] leading-5 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
          style={{ 
            fontFamily: 'Chirp-Regular',
            lineHeight: 20,
            color: textColor,
            letterSpacing: 0.05,
          }}
        >
          {content}
          {emojis && emojis.length > 0 && (
            <Text 
              className="ml-1.5"
              style={{ 
                fontFamily: 'Chirp-Regular', 
                fontSize: 15,
              }}
            >
              {' '}{emojis.join(' ')}
            </Text>
          )}
        </Text>
      </View>
    </View>
  );
}
