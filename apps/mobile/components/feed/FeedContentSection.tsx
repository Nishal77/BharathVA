import React from 'react';
import { Image, Pressable, Text, View, useColorScheme } from 'react-native';
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
  
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View className="flex-1 pr-1">
      {/* Header Row - Name, @Username, Time, 3 Dots */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Text 
            className="text-base font-bold mr-1"
            style={{ 
              color: name === '[Deleted User]' ? secondaryTextColor : textColor,
              fontStyle: name === '[Deleted User]' ? 'italic' : 'normal'
            }}
          >
            {name}
          </Text>
          {verified && name !== '[Deleted User]' && (
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3256/3256004.png' }}
              style={{ 
                width: 16, 
                height: 16, 
                marginRight: 4 
              }}
              resizeMode="contain"
              onError={() => console.log('Verified badge failed to load')}
            />
          )}
          <Text 
            className="text-sm mr-2"
            style={{ 
              color: handle.startsWith('[deleted_') ? secondaryTextColor : secondaryTextColor,
              fontStyle: handle.startsWith('[deleted_') ? 'italic' : 'normal'
            }}
          >
            @{handle}
          </Text>
          <Text 
            className="text-sm"
            style={{ color: secondaryTextColor }}
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
          className="text-base leading-5"
          style={{ color: textColor }}
        >
          {content}
          {emojis && emojis.length > 0 && (
            <Text style={{ fontSize: 16, marginLeft: 6 }}>
              {' '}{emojis.join(' ')}
            </Text>
          )}
        </Text>
      </View>
    </View>
  );
}
