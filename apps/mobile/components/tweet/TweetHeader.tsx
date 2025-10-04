import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface TweetHeaderProps {
  name: string;
  handle: string;
  time: string;
  avatar: string;
  verified?: boolean;
}

export default function TweetHeader({ 
  name, 
  handle, 
  time, 
  avatar, 
  verified = false 
}: TweetHeaderProps) {
  return (
    <View className="flex-row">
      {/* Profile Picture Container */}
      <View className="mr-3">
        <Pressable>
          <Image
            source={{ uri: avatar }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
            contentFit="cover"
            placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
            onError={() => console.log('Image failed to load:', avatar)}
          />
        </Pressable>
      </View>

      {/* Text Container - Separate View with Flex */}
      <View className="flex-1 justify-start">
        <View className="flex-row items-center">
          <Text className="text-base font-bold text-black mr-2">
            {name}
          </Text>
          {verified && (
            <Text className="text-blue-500 mr-1">✓</Text>
          )}
          <Text className="text-sm text-gray-500">
            @{handle} · {time}
          </Text>
        </View>
      </View>

      {/* More Options Container - Separate View */}
      <View className="justify-start">
        <Pressable className="p-2">
          <Text className="text-gray-500 text-lg font-bold">⋯</Text>
        </Pressable>
      </View>
    </View>
  );
}
