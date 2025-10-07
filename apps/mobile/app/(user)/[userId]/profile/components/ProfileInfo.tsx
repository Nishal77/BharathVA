import { Share } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

export default function ProfileInfo() {
  return (
    <View className="bg-white px-5 py-6">
      {/* Profile Section */}
      <View className="flex-row items-center">
        {/* Profile Picture */}
        <View className="mr-4">
          <View className="w-20 h-20 rounded-full overflow-hidden">
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Action Buttons - Right Aligned */}
        <View className="flex-row items-center space-x-3 ml-auto">
          {/* Share Button */}
          <Pressable className="w-10 h-10 rounded-full border border-gray-300 items-center justify-center active:opacity-70">
            <Share size={18} color="#374151" strokeWidth={1.5} />
          </Pressable>

          {/* Edit Profile Button */}
          <Pressable className="bg-gray-900 rounded-full py-2 px-4 active:opacity-70">
            <Text className="text-white text-sm font-medium">Edit Profile</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
