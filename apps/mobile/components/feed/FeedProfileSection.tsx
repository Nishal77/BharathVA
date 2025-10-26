import React from 'react';
import { Image, View, useColorScheme, Pressable } from 'react-native';

interface FeedProfileSectionProps {
  avatar: string;
  onProfilePress?: () => void;
}

export default function FeedProfileSection({ avatar, onProfilePress }: FeedProfileSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={{ 
      width: 48, 
      alignItems: 'center', 
      paddingTop: 0, 
      position: 'relative', 
      marginRight: 12 
    }}>
      {/* Profile Picture */}
      <Pressable 
        onPress={onProfilePress}
        style={{ opacity: onProfilePress ? 1 : 1 }}
      >
        <View style={{ 
          width: 40, 
          height: 40, 
          borderRadius: 20, 
          overflow: 'hidden', 
          backgroundColor: '#D1D5DB' 
        }}>
          <Image
            source={{ 
              uri: avatar || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg` 
            }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() => console.log('Profile image failed to load')}
          />
        </View>
      </Pressable>
      
      {/* Vertical Line - Connecting Main Profile to Top Avatar */}
      <View
        style={{
          position: 'absolute',
          width: 1,
          backgroundColor: isDark ? '#2B2B2B' : 'rgba(0, 0, 0, 0.15)',
          left: 19, // Centered on the profile images
          top: 44, // Below the main profile image with small gap (40px height + 8px space)
          bottom: 40, // Above the top small avatar (20px from bottom + 20px avatar height)
        }}
      />
      
      {/* Three Images in Horizontal Row Formation - Aligned with Stats */}
      {/* Left Image */}
      <View
        style={{
          position: 'absolute',
          left: 3, // Leftmost position
          bottom: 12, // Same spacing as pb-3 (12px) from stats text
        }}
      >
        <View style={{ 
          width: 20, 
          height: 20, 
          borderRadius: 10, 
          overflow: 'hidden', 
          borderWidth: 1, 
          borderColor: '#FFFFFF' 
        }}>
          <Image
            source={{ uri: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}` }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Center Image */}
      <View
        style={{
          position: 'absolute',
          left: 11, // Center position with slight overlap
          bottom: 12, // Same spacing as pb-3 (12px) from stats text
        }}
      >
        <View style={{ 
          width: 20, 
          height: 20, 
          borderRadius: 10, 
          overflow: 'hidden', 
          borderWidth: 1, 
          borderColor: '#FFFFFF' 
        }}>
          <Image
            source={{ uri: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}` }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Right Image */}
      <View
        style={{
          position: 'absolute',
          left: 19, // Rightmost position with slight overlap
          bottom: 12, // Same spacing as pb-3 (12px) from stats text
        }}
      >
        <View style={{ 
          width: 20, 
          height: 20, 
          borderRadius: 10, 
          overflow: 'hidden', 
          borderWidth: 1, 
          borderColor: '#FFFFFF' 
        }}>
          <Image
            source={{ uri: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}` }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
}
