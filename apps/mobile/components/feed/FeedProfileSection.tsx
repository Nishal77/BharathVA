import React from 'react';
import { Image, View, useColorScheme } from 'react-native';

interface FeedProfileSectionProps {
  avatar: string;
}

export default function FeedProfileSection({ avatar }: FeedProfileSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="w-12 items-center pt-0 relative mr-3">
      {/* Profile Picture */}
      <View className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
        <Image
          source={{ 
            uri: avatar || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg` 
          }}
          className="w-full h-full"
          resizeMode="cover"
          onError={() => console.log('Profile image failed to load')}
        />
      </View>
      
      {/* Vertical Line - Connecting Main Profile to Top Avatar */}
      <View
        className="absolute w-px bg-black/15 dark:bg-[#2B2B2B]"
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
  );
}
