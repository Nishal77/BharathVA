import { MapPin, MapPinHouse } from 'lucide-react-native';
import React from 'react';
import { Text, View, useColorScheme } from 'react-native';

export default function ProfileUsername() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const nameColor = isDark ? '#F9FAFB' : '#111827';
  const usernameColor = isDark ? '#9CA3AF' : '#6B7280';
  const locationColor = isDark ? '#6B7280' : '#9CA3AF';
  const iconColor = isDark ? '#6B7280' : '#9CA3AF';

  return (
    <View className="px-5 pb-2" style={{ backgroundColor: bgColor }}>
      {/* Name */}
      <Text 
        className="text-2xl font-bold text-left"
        style={{ color: nameColor }}
      >
        Sarah Johnson
      </Text>
      
      {/* Username and Location */}
      <View className="flex-row items-center text-left">
        <Text 
          className="text-base mr-2"
          style={{ color: usernameColor }}
        >
          @sarah.johnson
        </Text>
        <MapPinHouse size={14} color={iconColor} />
        <Text 
          className="text-sm ml-1"
          style={{ color: locationColor }}
        >
          India
        </Text>
      </View>
    </View>
  );
}
