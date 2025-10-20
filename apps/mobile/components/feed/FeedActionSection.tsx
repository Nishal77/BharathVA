import React from 'react';
import { Pressable, Text, View, useColorScheme } from 'react-native';
import { HeartPlus, MessageCircle, Send, SmilePlus, BookmarkMinus } from 'lucide-react-native';

interface FeedActionSectionProps {
  onLike?: () => void;
  onReply?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

export default function FeedActionSection({ 
  onLike, 
  onReply, 
  onShare, 
  onBookmark 
}: FeedActionSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Use strong black with 80% opacity in light mode, solid black in dark mode
  const textColor = isDark ? '#000000' : 'rgba(0, 0, 0, 0.8)';

  return (
    <View className="mb-3 pr-1">
      {/* Professional Action Buttons - Left to Right Priority */}
      <View className="flex-row items-center justify-between mb-0">
        {/* Primary Actions - Most Used */}
        <View className="flex-row items-center space-x-4">
          <Pressable className="p-2" onPress={onReply}>
            <MessageCircle 
              size={22} 
              color={textColor}
            />
          </Pressable>
          <Pressable className="p-2" onPress={onLike}>
            <HeartPlus 
              size={22} 
              color={textColor}
            />
          </Pressable>
        </View>
        
        {/* Secondary Actions - Less Frequent */}
        <View className="flex-row items-center space-x-4">
          <Pressable className="p-2">
            <SmilePlus 
              size={22} 
              color={textColor}
            />
          </Pressable>
          <Pressable className="p-2" onPress={onShare}>
            <Send 
              size={22} 
              color={textColor}
            />
          </Pressable>
          <Pressable className="p-2" onPress={onBookmark}>
            <BookmarkMinus 
              size={22} 
              color={textColor}
            />
          </Pressable>
        </View>
      </View>

      {/* Beautiful Consolidated Emoji Reactions */}
      <View className="mt-2">
        <Pressable 
          className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-full px-3 py-1.5 border border-gray-200 dark:border-gray-700"
          style={{
            alignSelf: 'flex-start',
            minHeight: 28,
          }}
        >
          {/* Emoji Collection */}
          <View className="flex-row items-center space-x-1 mr-2">
            <Text style={{ fontSize: 14 }}>👏</Text>
            <Text style={{ fontSize: 14 }}>🙏</Text>
            <Text style={{ fontSize: 14 }}>🌟</Text>
            <Text className="text-sm text-blue-600 ml-1">+3</Text>
          </View>
          
          {/* Combined Count */}
          <Text style={{ 
            fontSize: 12, 
            color: isDark ? '#D1D5DB' : '#374151', 
            fontWeight: '600',
            marginLeft: 2
          }}>
            234 vibes 
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
