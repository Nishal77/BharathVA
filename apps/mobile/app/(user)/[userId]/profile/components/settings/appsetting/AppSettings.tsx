import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SettingItem from '../SettingItem';

interface AppSettingsProps {
  themeMode: 'system' | 'light' | 'dark';
  notifications: boolean;
  language: boolean;
  onThemePress: () => void;
  onNotificationsChange: (value: boolean) => void;
  onLanguagePress: () => void;
  colors: {
    cardBackground: string;
    border: string;
    primaryText: string;
    secondaryText: string;
    error: string;
    toggleActive: string;
    toggleInactive: string;
  };
}

export default function AppSettings({
  themeMode,
  notifications,
  language,
  onThemePress,
  onNotificationsChange,
  onLanguagePress,
  colors,
}: AppSettingsProps) {
  const getThemeDisplayName = () => {
    switch (themeMode) {
      case 'system':
        return 'System';
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      default:
        return 'System';
    }
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
        App Settings
      </Text>

      <View style={[styles.sectionCard, { backgroundColor: colors.cardBackground }]}>
        <SettingItem
          iconName="theme"
          title="Appearance"
          subtitle="Switch between light and dark themes"
          onPress={onThemePress}
          colors={colors}
        />

        <SettingItem
          iconName="notification"
          title="Notifications"
          subtitle="Receive push notifications"
          hasToggle={true}
          toggleValue={notifications}
          toggleOnChange={onNotificationsChange}
          colors={colors}
        />

        <SettingItem
          iconName="language"
          title="Language"
          subtitle="Change your preferred language"
          onPress={onLanguagePress}
          colors={colors}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingLeft: 4,
  },
  sectionCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
