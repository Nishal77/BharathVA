import React from 'react';
import { Image, Text, View, useColorScheme } from 'react-native';

export default function ProfileStats() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const numberColor = isDark ? '#F9FAFB' : '#111827';
  const labelColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  return (
    <View className="px-5 pt-1 pb-4" style={{ backgroundColor: bgColor }}>
      <View className="flex-row items-center">
        {/* Followers Count with Avatars */}
        <View className="flex-row items-center">
          {/* Avatar Stack */}
          <View className="flex-row items-center mr-2">
            {/* First Avatar (back) */}
            <View 
              className="w-6 h-6 rounded-full overflow-hidden"
            >
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            
            {/* Second Avatar (middle) */}
            <View 
              className="w-6 h-6 rounded-full overflow-hidden"
              style={{ 
                marginLeft: -8
              }}
            >
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            {/* Third Avatar (front) */}
            <View 
              className="w-6 h-6 rounded-full overflow-hidden"
              style={{ 
                marginLeft: -8
              }}
            >
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Followers Text */}
          <Text 
            className="text-base font-bold mr-2"
            style={{ color: numberColor }}
          >
            26
          </Text>
          <Text 
            className="text-base"
            style={{ color: labelColor }}
          >
            followers
          </Text>
        </View>

        {/* Vertical Separator */}
        <View 
          className="w-px h-6 mx-4"
          style={{ backgroundColor: borderColor }}
        />

        {/* Following Count */}
        <View className="flex-row items-center">
          <Text 
            className="text-base font-bold mr-2"
            style={{ color: numberColor }}
          >
            9
          </Text>
          <Text 
            className="text-base"
            style={{ color: labelColor }}
          >
            Following
          </Text>
        </View>

        {/* Vertical Separator */}
        <View 
          className="w-px h-6 mx-4"
          style={{ backgroundColor: borderColor }}
        />

        {/* Posts Count */}
        <View className="flex-row items-center">
          <Text 
            className="text-base font-bold mr-2"
            style={{ color: numberColor }}
          >
            156
          </Text>
          <Text 
            className="text-base"
            style={{ color: labelColor }}
          >
            Posts
          </Text>
        </View>
      </View>
    </View>
  );
}
