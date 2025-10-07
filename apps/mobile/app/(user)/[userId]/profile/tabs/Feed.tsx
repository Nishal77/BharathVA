import { Bookmark, Heart, MessageCircle, MoreHorizontal, Share, Verified } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, Text, View, useColorScheme } from 'react-native';

export default function Feed() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  return (
    <View style={{ backgroundColor: bgColor }}>
      {/* Post */}
      <View className="border-b relative" style={{ borderBottomColor: borderColor }}>
        {/* Two Column Layout */}
        <View className="flex-row px-4 py-3">
          {/* Left Column - Profile Picture and Vertical Line */}
          <View className="w-12 items-center pt-1 relative mr-3">
            {/* Profile Picture */}
            <View className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            
            {/* Vertical Line */}
            <View
              className="absolute w-px"
              style={{
                backgroundColor: '#000000',
                left: 19, // Center of the 40px profile pic (20px) - 0.5px for line center
                top: 40, // Below the profile picture (40px height)
                bottom: 36, // Stops above the small avatar (32px avatar + 4px margin)
              }}
            />
            
            {/* Small Avatar at Bottom */}
            <View
              className="absolute"
              style={{
                left: 11, // Center the 20px avatar on the line (19px - 8px = 11px)
                bottom: 0,
              }}
            >
              <View className="w-5 h-5 rounded-full overflow-hidden border-2 border-white">
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>

          {/* Right Column - All Content */}
          <View className="flex-1">
            {/* Header Row - Username, Verified Badge, Timestamp, Menu */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Text 
                  className="text-base font-semibold mr-1"
                  style={{ color: textColor }}
                >
                  macoydubs
                </Text>
                <Verified size={14} color="#3B82F6" />
              </View>
              <View className="flex-row items-center">
                <Text 
                  className="text-sm mr-3"
                  style={{ color: secondaryTextColor }}
                >
                  12h
                </Text>
                <Pressable className="p-1">
                  <MoreHorizontal size={20} color={secondaryTextColor} />
                </Pressable>
              </View>
            </View>

            {/* Caption */}
            <View className="mb-3">
              <Text 
                className="text-base leading-5"
                style={{ color: textColor }}
              >
                Look for tonight's RPDR PH S2 live viewing party
              </Text>
            </View>

            {/* Main Image */}
            <View className="aspect-square rounded-xl overflow-hidden mb-3">
              <Image
                source={{ uri: 'https://picsum.photos/400/400?random=1' }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            {/* Action Buttons */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center space-x-4">
                <Pressable className="p-1">
                  <Heart size={24} color={textColor} strokeWidth={1.5} />
                </Pressable>
                <Pressable className="p-1">
                  <MessageCircle size={24} color={textColor} strokeWidth={1.5} />
                </Pressable>
                <Pressable className="p-1">
                  <Share size={24} color={textColor} strokeWidth={1.5} />
                </Pressable>
              </View>
              
              <Pressable className="p-1">
                <Bookmark size={24} color={textColor} strokeWidth={1.5} />
              </Pressable>
            </View>

            {/* Engagement Stats - New Layout */}
            <View className="pb-3">
              <View className="flex-row items-center">
                <Text 
                  className="text-sm mr-4"
                  style={{ color: secondaryTextColor }}
                >
                  4 replies
                </Text>
                <Text 
                  className="text-sm"
                  style={{ color: secondaryTextColor }}
                >
                  10 likes
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}