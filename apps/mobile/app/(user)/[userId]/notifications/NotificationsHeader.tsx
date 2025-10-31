import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

export default function NotificationsHeader() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    primaryText: isDark ? '#FFFFFF' : '#000000',
    border: isDark ? '#1F2937' : '#E5E7EB',
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Notifications</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});


