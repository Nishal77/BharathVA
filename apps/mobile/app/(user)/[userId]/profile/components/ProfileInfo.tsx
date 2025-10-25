import React from 'react';
import { Image, Pressable, Text, View, useColorScheme } from 'react-native';

export default function ProfileInfo() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const borderColor = isDark ? '#374151' : '#D1D5DB';
  const iconColor = isDark ? '#D1D5DB' : '#374151';
  const buttonBg = isDark ? '#FFFFFF' : '#111827';
  const buttonText = isDark ? '#000000' : '#FFFFFF';

  return (
    <View className="px-5 py-4" style={{ backgroundColor: bgColor }}>
      {/* Profile Section */}
      <View className="flex-row items-center">
        {/* Profile Picture */}
        <View className="mr-4">
          <View className="w-20 h-20 rounded-full overflow-hidden border-2" style={{ borderColor: borderColor }}>
            <Image
              source={{ uri: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg` }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Action Buttons - Right Aligned */}
        <View className="flex-row items-center ml-auto">
          {/* Upload Button */}
          <Pressable 
            className="w-10 h-10 rounded-full items-center justify-center active:opacity-70 mr-3 border"
            style={{ borderColor: borderColor }}
          >
            <Image
              source={require('../../../../../assets/logo/upload.png')}
              style={{
                width: 18,
                height: 18,
                tintColor: isDark ? '#FFFFFF' : '#000000'
              }}
              resizeMode="contain"
            />
          </Pressable>

          {/* Edit Profile Button */}
          <Pressable 
            className="rounded-full py-2 px-4 active:opacity-70"
            style={{ backgroundColor: buttonBg }}
          >
            <Text className="text-sm font-medium" style={{ color: buttonText }}>
              Edit Profile
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
