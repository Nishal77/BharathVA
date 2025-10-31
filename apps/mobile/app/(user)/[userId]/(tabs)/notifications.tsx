import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { NotificationsHeader, NotificationsContent } from '../notifications';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000000' : '#FFFFFF' }}>
      <NotificationsHeader />
      <NotificationsContent />
    </View>
  );
}

const styles = StyleSheet.create({
  // minimal wrapper styles only
});
