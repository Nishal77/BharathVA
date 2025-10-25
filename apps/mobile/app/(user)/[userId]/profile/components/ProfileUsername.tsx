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
    <View className="px-5 pb-2 bg-white dark:bg-black">
      {/* Full Name */}
      <Text className="text-2xl font-bold text-left text-gray-900 dark:text-gray-100">
        {displayFullName}
      </Text>

      {/* Username + Location */}
      <View className="flex-row items-center text-left">
        <Text className="text-base mr-2 text-gray-500 dark:text-gray-400">
          @{displayUsername}
        </Text>
        <Ionicons name="location-outline" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
        <Text className="text-sm ml-1 text-gray-500 dark:text-gray-400">
          India
        </Text>
      </View>
    </View>
  );
}

