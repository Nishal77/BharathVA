import React from 'react';
import { Image, Pressable, Text, View, useColorScheme } from 'react-native';
import { Svg, Path } from 'react-native-svg';

export default function ProfileInfo() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const borderColor = isDark ? '#374151' : '#D1D5DB';
  const buttonBg = isDark ? '#FFFFFF' : '#111827';
  const buttonText = isDark ? '#000000' : '#FFFFFF';

  return (
    <View className="px-5 py-4 dark:bg-[#0A0A0A] bg-white">
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
            className="w-10 h-10 rounded-full items-center justify-center active:opacity-70 mr-3 border border-gray-300 dark:border-[#5F5F5F] dark:bg-[#171717]"
            // style={{ borderColor: borderColor }}
          >
            <Svg width={18} height={18} viewBox="0 0 48 48">
              <Path
                d="M 35.478516 5.9804688 A 2.0002 2.0002 0 0 0 34.085938 9.4140625 L 35.179688 10.507812 C 23.476587 10.680668 14 20.256715 14 32 A 2.0002 2.0002 0 1 0 18 32 C 18 22.427546 25.627423 14.702715 35.154297 14.517578 L 34.085938 15.585938 A 2.0002 2.0002 0 1 0 36.914062 18.414062 L 41.236328 14.091797 A 2.0002 2.0002 0 0 0 41.228516 10.900391 L 36.914062 6.5859375 A 2.0002 2.0002 0 0 0 35.478516 5.9804688 z M 12.5 6 C 8.9338464 6 6 8.9338464 6 12.5 L 6 35.5 C 6 39.066154 8.9338464 42 12.5 42 L 35.5 42 C 39.066154 42 42 39.066154 42 35.5 L 42 28 A 2.0002 2.0002 0 1 0 38 28 L 38 35.5 C 38 36.903846 36.903846 38 35.5 38 L 12.5 38 C 11.096154 38 10 36.903846 10 35.5 L 10 12.5 C 10 11.096154 11.096154 10 12.5 10 L 20 10 A 2.0002 2.0002 0 1 0 20 6 L 12.5 6 z"
                fill={isDark ? '#FFFFFF' : '#000000'}
              />
            </Svg>
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
