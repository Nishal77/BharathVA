import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColorScheme } from 'react-native';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function ProfileUsername() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Display full name if available, otherwise fallback to username
  const displayFullName = user?.fullName || user?.username || 'User';
  const displayUsername = user?.username || 'user';

  return (
    <View className="px-5 pb-2 bg-white dark:bg-[#0A0A0A]">
      {/* Full Name */}
      <Text className="text-2xl font-bold text-left text-gray-900 dark:text-[#E5E5E5]">
        {displayFullName}
      </Text>

      {/* Username + Location */}
      <View className="flex-row items-center text-left">
        <Text className="text-base mr-2 text-gray-500 dark:text-[#71767B]">
          @{displayUsername}
        </Text>
        <Ionicons name="pin-outline" size={14} color={isDark ? '#71767B' : '#6B7280'} />
        <Text className="text-sm ml-1 text-gray-500 dark:text-[#71767B]">
          India
        </Text>
      </View>
    </View>
  );
}

