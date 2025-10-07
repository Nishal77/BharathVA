import { MapPin } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

export default function ProfileUsername() {
  return (
    <View className="bg-white px-5 pb-4">
      {/* Name */}
      <Text className="text-xl font-bold text-gray-900 mb-1 text-left">
        Sarah Johnson
      </Text>
      
      {/* Username and Location */}
      <View className="flex-row items-center text-left">
        <Text className="text-gray-500 text-sm mr-2">
          @sarah.johnson
        </Text>
        <MapPin size={14} color="#9CA3AF" />
        <Text className="text-gray-400 text-sm ml-1">
          India
        </Text>
      </View>
    </View>
  );
}
