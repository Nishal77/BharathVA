import React, { useEffect, useState } from 'react';
import { Image, Pressable, Text, View, useColorScheme } from 'react-native';
import { useAuth } from '../../../../contexts/AuthContext';

interface ProfileHeaderProps {
  username?: string;
  onBackPress?: () => void;
  onMenuPress?: () => void;
}

export default function ProfileHeader({ 
  username,
  onBackPress, 
  onMenuPress 
}: ProfileHeaderProps) {
  const { user } = useAuth();
  const [displayUsername, setDisplayUsername] = useState(`@${user?.username || 'user'}`);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const iconColor = isDark ? '#F9FAFB' : '#1F2937';
  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  useEffect(() => {
    if (username) {
      setDisplayUsername(username);
    } else if (user?.username) {
      setDisplayUsername(`@${user.username}`);
    } else {
      setDisplayUsername('@user');
    }
  }, [user, username]);

  return (
    <View 
      style={{ 
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 100,
        backgroundColor: bgColor,
        borderBottomColor: borderColor 
      }}
    >
      {/* Back Arrow */}
      <Pressable
        onPress={onBackPress}
        style={{ 
          width: 40, 
          height: 40, 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
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
        style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          textAlign: 'center', 
          flex: 1,
          color: textColor 
        }}
      >
        {displayUsername}
      </Text>
      
      {/* Category Menu */}
      <Pressable
        onPress={onMenuPress}
        style={{ 
          width: 40, 
          height: 40, 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
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