import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import MessagesIndexScreen from '../messages/index';

export default function MessagesScreen() {
  const { userId } = useLocalSearchParams();

  return (
    <View className="flex-1">
      <MessagesIndexScreen />
    </View>
  );
}
