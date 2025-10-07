import { ArrowLeft, MoreHorizontal } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface ProfileHeaderProps {
  username?: string;
  onBackPress?: () => void;
  onMenuPress?: () => void;
}

export default function ProfileHeader({ 
  username = '@aarav.sharma98',
  onBackPress, 
  onMenuPress 
}: ProfileHeaderProps) {
  return (
    <View className="bg-white pt-[60px] pb-4 px-5 flex-row items-center justify-between h-[100px]">
      {/* Back Arrow */}
      <Pressable
        onPress={onBackPress}
        className="w-10 h-10 items-center justify-center active:opacity-70"
      >
        <ArrowLeft size={24} color="#1F2937" />
      </Pressable>
      
      {/* Username - Centered */}
      <Text className="text-lg font-semibold text-gray-800 text-center flex-1">
        {username}
      </Text>
      
      {/* Three Dot Menu */}
      <Pressable
        onPress={onMenuPress}
        className="w-10 h-10 items-center justify-center active:opacity-70"
      >
        <MoreHorizontal size={24} color="#1F2937" />
      </Pressable>
    </View>
  );
}