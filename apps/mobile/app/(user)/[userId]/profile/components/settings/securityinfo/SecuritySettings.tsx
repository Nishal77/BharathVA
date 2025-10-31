import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SettingItem from '../SettingItem';

interface SecuritySettingsProps {
  twoFactorAuth: boolean;
  appLock: boolean;
  onTwoFactorAuthChange: (value: boolean) => void;
  onTwoFactorAuthPress?: () => void;
  onLoginAlertsPress: () => void;
  onActiveSessionsPress: () => void;
  onAppLockChange: (value: boolean) => void;
  onSecurityCheckupPress: () => void;
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

export default function SecuritySettings({
  twoFactorAuth,
  appLock,
  onTwoFactorAuthChange,
  onTwoFactorAuthPress,
  onLoginAlertsPress,
  onActiveSessionsPress,
  onAppLockChange,
  onSecurityCheckupPress,
  colors,
}: SecuritySettingsProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
        Security
      </Text>

      <View style={[styles.sectionCard, { backgroundColor: colors.cardBackground }]}>
        <SettingItem
          iconName="security"
          title="Two-Factor Authentication"
          subtitle="Add an extra layer of protection"
          hasToggle={false}
          onPress={onTwoFactorAuthPress}
          colors={colors}
        />

        <SettingItem
          iconName="loginAlerts"
          title="Login Alerts"
          subtitle="Get notified of new device logins"
          onPress={onLoginAlertsPress}
          colors={colors}
        />

        <SettingItem
          iconName="activeSessions"
          title="Active Sessions"
          subtitle="Manage devices you're signed in on"
          onPress={onActiveSessionsPress}
          colors={colors}
        />

        <SettingItem
          iconName="appLock"
          title="App Lock"
          subtitle="Use Face ID or PIN for extra security"
          hasToggle={true}
          toggleValue={appLock}
          toggleOnChange={onAppLockChange}
          colors={colors}
        />

        <SettingItem
          iconName="securityCheckup"
          title="Security Checkup"
          subtitle="Review your protection status"
          onPress={onSecurityCheckupPress}
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
