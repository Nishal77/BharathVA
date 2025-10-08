import { Bookmark, Heart, MessageCircle, MoreHorizontal, Share } from 'lucide-react-native';
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
    <View style={{ backgroundColor: bgColor, paddingBottom: 100 }}>
      {/* Post */}
      <View className="border-b relative" style={{ borderBottomColor: borderColor }}>
        {/* Two Column Layout */}
        <View className="flex-row px-4 py-3">
          {/* Left Column - Profile Picture and Vertical Line */}
          <View className="w-12 items-center pt-0 relative mr-3">
            {/* Profile Picture */}
            <View className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            
            {/* Vertical Line - Connecting Main Profile to Top Avatar */}
            <View
              className={`absolute w-px ${isDark ? 'bg-white/20' : 'bg-black/15'}`}
              style={{
                left: 19, // Centered on the profile images
                top: 44, // Below the main profile image with small gap (40px height + 8px space)
                bottom: 40, // Above the top small avatar (20px from bottom + 20px avatar height)
              }}
            />
            
            {/* Three Images in Horizontal Row Formation - Aligned with Stats */}
            {/* Left Image */}
            <View
              className="absolute"
              style={{
                left: 3, // Leftmost position
                bottom: 12, // Same spacing as pb-3 (12px) from stats text
              }}
            >
              <View className="w-5 h-5 rounded-full overflow-hidden border-1 border-white">
                <Image
                  source={{ uri: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}` }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Center Image */}
            <View
              className="absolute"
              style={{
                left: 11, // Center position with slight overlap
                bottom: 12, // Same spacing as pb-3 (12px) from stats text
              }}
            >
              <View className="w-5 h-5 rounded-full overflow-hidden border-1 border-white">
                <Image
                  source={{ uri: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}` }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Right Image */}
            <View
              className="absolute"
              style={{
                left: 19, // Rightmost position with slight overlap
                bottom: 12, // Same spacing as pb-3 (12px) from stats text
              }}
            >
              <View className="w-5 h-5 rounded-full overflow-hidden border-1 border-white">
                <Image
                  source={{ uri: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}` }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>

          {/* Right Column - All Content */}
          <View className="flex-1">
            {/* Header Row - Name, @Username, Time, 3 Dots */}
            <View className="flex-row items-center justify-between pr-2">
              <View className="flex-row items-center flex-1">
                <Text 
                  className="text-base font-bold mr-1"
                  style={{ color: textColor }}
                >
                  Sarah Johnson
                </Text>
                <Text 
                  className="text-sm mr-2"
                  style={{ color: secondaryTextColor }}
                >
                  @macoydubs
                </Text>
                <Text 
                  className="text-sm"
                  style={{ color: secondaryTextColor }}
                >
                  · 12h
                </Text>
              </View>
              <Pressable className="p-1">
                <MoreHorizontal size={20} color={secondaryTextColor} />
              </Pressable>
            </View>

            {/* Caption */}
            <View className="mb-3">
              <Text 
                className="text-base leading-5"
                style={{ color: textColor }}
              >
                Look for tonight's RPDR PH S2 live viewing party happening at 8pm! Excited to see everyone and catch all the drama together. Who's coming?
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

            {/* Engagement Stats - Aligned with Bottom of Triangle */}
            <View className="pb-3">
              <View className="flex-row items-end">
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