import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SettingItem from '../SettingItem';

interface PrivacySettingsProps {
  profileVisibility: 'public' | 'private';
  activityStatus: boolean;
  blockedAccounts: boolean;
  onProfileVisibilityPress: () => void;
  onActivityStatusChange: (value: boolean) => void;
  onBlockedAccountsChange: (value: boolean) => void;
  onDataSharingPress: () => void;
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

export default function PrivacySettings({
  profileVisibility,
  activityStatus,
  blockedAccounts,
  onProfileVisibilityPress,
  onActivityStatusChange,
  onBlockedAccountsChange,
  onDataSharingPress,
  colors,
}: PrivacySettingsProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
        Privacy
      </Text>

      <View style={[styles.sectionCard, { backgroundColor: colors.cardBackground }]}>
        <SettingItem
          iconName="profileVisibility"
          title="Profile Visibility"
          subtitle="Who can view your profile"
          valueText={profileVisibility === 'public' ? 'Public' : 'Private'}
          onPress={onProfileVisibilityPress}
          colors={colors}
        />

        <SettingItem
          iconName="activityStatus"
          title="Activity Status"
          subtitle="Control your online visibility"
          hasToggle={true}
          toggleValue={activityStatus}
          toggleOnChange={onActivityStatusChange}
          colors={colors}
        />

        <SettingItem
          iconName="blockedAccounts"
          title="Blocked Accounts"
          subtitle="Manage users you've blocked"
          hasToggle={true}
          toggleValue={blockedAccounts}
          toggleOnChange={onBlockedAccountsChange}
          colors={colors}
        />

        <SettingItem
          iconName="dataSharing"
          title="Data Sharing Preferences"
          subtitle="Control analytics and personalization data"
          onPress={onDataSharingPress}
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