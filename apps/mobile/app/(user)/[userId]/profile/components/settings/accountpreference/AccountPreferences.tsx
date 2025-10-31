import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
  Alert,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../../../../../../../contexts/AuthContext';
import SettingItem from '../SettingItem';
import { SettingsIcon } from '../SettingsIcon';
import AccountInformation from './AccountInformation';
import ChangePassword from './ChangePassword';

interface AccountPreferencesProps {
  onBackPress?: () => void;
}

export default function AccountPreferences({ onBackPress }: AccountPreferencesProps) {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showAccountInformation, setShowAccountInformation] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Theme colors
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    surface: isDark ? '#111111' : '#F9FAFB',
    cardBackground: isDark ? '#1A1A1A' : '#FFFFFF',
    primaryText: isDark ? '#FFFFFF' : '#000000',
    secondaryText: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
    accent: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    toggleActive: isDark ? '#3B82F6' : '#3B82F6',
    toggleInactive: isDark ? '#4B5563' : '#D1D5DB',
  };

  const handlePress = (action: string) => {
    switch (action) {
      case 'accountInformation':
        setShowAccountInformation(true);
        break;
      case 'changePassword':
        setShowChangePassword(true);
        break;
      case 'manageEmailPhone':
        Alert.alert('Manage Email & Phone', 'Email and phone management will be implemented');
        break;
      case 'deactivateAccount':
        Alert.alert(
          'Deactivate / Delete Account',
          'Are you sure you want to deactivate or delete your account? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Deactivate',
              style: 'destructive',
              onPress: () => {
                Alert.alert('Account Deactivated', 'Your account has been deactivated successfully.');
              },
            },
          ]
        );
        break;
      case 'downloadData':
        Alert.alert('Download My Data', 'Your data export will be prepared and sent to your email');
        break;
      case 'linkedAccounts':
        Alert.alert('Manage Linked Accounts', 'Linked accounts management will be implemented');
        break;
    }
  };

  const handleAccountInformationBack = () => {
    setShowAccountInformation(false);
  };

  const handleChangePasswordBack = () => {
    setShowChangePassword(false);
  };

  // Show Account Information screen if enabled
  if (showAccountInformation) {
    return (
      <AccountInformation onBackPress={handleAccountInformationBack} />
    );
  }

  // Show Change Password screen if enabled
  if (showChangePassword) {
    return (
      <ChangePassword onBackPress={handleChangePasswordBack} />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={onBackPress} style={styles.backButton}>
          <View style={styles.backIconContainer}>
            <SettingsIcon
              name="arrow"
              size={24}
              color={colors.primaryText}
            />
          </View>
        </Pressable>

        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>
          Account Preferences
        </Text>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Preferences Section */}
        <View style={[styles.section, styles.firstSection]}>
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBackground }]}>
            <SettingItem
              iconName="emailPhone"
              title="Account Information"
              subtitle="View your username, email, and phone number"
              onPress={() => handlePress('accountInformation')}
              colors={colors}
            />

            <SettingItem
              iconName="password"
              title="Change Password"
              subtitle={`Secure your account - @${user?.username || 'user'}`}
              onPress={() => handlePress('changePassword')}
              colors={colors}
            />

            <SettingItem
              iconName="delete"
              title="Deactivate / Delete Account"
              subtitle="Permanently remove your account and data"
              onPress={() => handlePress('deactivateAccount')}
              isDestructive={true}
              colors={colors}
            />

            <SettingItem
              iconName="download"
              title="Download My Data"
              subtitle="Export your account information and content"
              onPress={() => handlePress('downloadData')}
              colors={colors}
            />

            <SettingItem
              iconName="linkedAccounts"
              title="Manage Linked Accounts"
              subtitle="Connect and manage third-party integrations"
              onPress={() => handlePress('linkedAccounts')}
              colors={colors}
            />
          </View>
        </View>

        {/* Footer Spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    height: 100,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIconContainer: {
    transform: [{ rotate: '180deg' }],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  firstSection: {
    marginTop: 0,
    paddingTop: 16,
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
  footer: {
    height: 40,
  },
});
