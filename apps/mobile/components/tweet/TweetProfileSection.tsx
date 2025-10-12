import React from 'react';
import { Image, View, useColorScheme } from 'react-native';

interface TweetProfileSectionProps {
  avatar: string;
}

export default function TweetProfileSection({ avatar }: TweetProfileSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="w-12 items-center pt-0 relative mr-3">
      {/* Profile Picture */}
      <View className="w-10 h-10 rounded-full overflow-hidden">
        <Image
          source={{ 
            uri: avatar || `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}` 
          }}
          className="w-full h-full"
          resizeMode="cover"
          onError={() => console.log('Profile image failed to load')}
        />
      </View>
      
      {/* Vertical Line - Connecting Main Profile to Bottom Avatars */}
      <View
        className={`absolute w-px ${isDark ? 'bg-white/20' : 'bg-black/15'}`}
        style={{
          left: 19,
          top: 44,
          bottom: 40,
        }}
      />
      
      {/* Three Images in Horizontal Row Formation - Aligned with Stats */}
      {/* Left Image */}
      <View
        className="absolute"
        style={{
          left: 3,
          bottom: 12,
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
          left: 11,
          bottom: 12,
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
          left: 19,
          bottom: 12,
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
