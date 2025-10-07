import React from 'react';
import { Image, Pressable, Text, View, useColorScheme } from 'react-native';


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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const iconColor = isDark ? '#F9FAFB' : '#1F2937';
  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  return (
    <View 
      className="pt-[60px] pb-4 px-5 flex-row items-center justify-between h-[100px]"
      style={{ 
        backgroundColor: bgColor,
        borderBottomColor: borderColor 
      }}
    >
      {/* Back Arrow */}
      <Pressable
        onPress={onBackPress}
        className="w-10 h-10 items-center justify-center active:opacity-70"
      >
        <Image
          source={require('../../../../assets/logo/arrow.png')}
          style={{
            width: 24,
            height: 24,
            tintColor: isDark ? '#FFFFFF' : '#000000'
          }}
          resizeMode="contain"
        />
      </Pressable>
      
      {/* Username - Centered */}
      <Text 
        className="text-lg font-semibold text-center flex-1"
        style={{ color: textColor }}
      >
        {username}
      </Text>
      
      {/* Category Menu */}
      <Pressable
        onPress={onMenuPress}
        className="w-10 h-10 items-center justify-center active:opacity-70"
      >
        <Image
          source={require('../../../../assets/logo/Category.png')}
          style={{
            width: 24,
            height: 24,
            tintColor: isDark ? '#FFFFFF' : '#000000'
          }}
          resizeMode="contain"
        />
      </Pressable>
    </View>
  );
}