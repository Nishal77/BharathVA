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
import AccountPreferences from './accountpreference';
import SecuritySettings from './securityinfo';
import TwoFactorSetup from './securityinfo/TwoFactorSetup';
import PrivacySettings from './privacy';
import AppSettings, { ThemeSelection } from './appsetting';
import PrivacyInsights from './privacyinsights';
import ProfileVisibility from './privacy/ProfileVisibility';
import SettingItem from './SettingItem';
import { SettingsIcon } from './SettingsIcon';
import { useAuth } from '../../../../../../contexts/AuthContext';

interface PrivacySecurityProps {
  onBackPress?: () => void;
}

export default function PrivacySecurity({ onBackPress }: PrivacySecurityProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { logout } = useAuth();

  // State for toggle switches
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [appLock, setAppLock] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('private');
  const [activityStatus, setActivityStatus] = useState(true);
  const [blockedAccounts, setBlockedAccounts] = useState(false);
  const [showAccountPreferences, setShowAccountPreferences] = useState(false);
  const [showProfileVisibility, setShowProfileVisibility] = useState(false);
  const [showThemeSelection, setShowThemeSelection] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);

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

  // Handlers
  const handleAccountPreferences = () => {
    setShowAccountPreferences(true);
  };

  const handleAccountPreferencesBack = () => {
    setShowAccountPreferences(false);
  };

  const handleProfileVisibilityPress = () => {
    setShowProfileVisibility(true);
  };

  const handleProfileVisibilityBack = () => {
    setShowProfileVisibility(false);
  };

  const handleThemePress = () => {
    setShowThemeSelection(true);
  };

  const handleThemeSelectionBack = () => {
    setShowThemeSelection(false);
  };

  const handleLoginAlerts = () => {
    Alert.alert('Login Alerts', 'Login alerts management will be implemented');
  };

  const handleActiveSessions = () => {
    Alert.alert('Active Sessions', 'Active sessions management will be implemented');
  };

  const handleSecurityCheckup = () => {
    Alert.alert('Security Checkup', 'Security checkup will be implemented');
  };

  const handleTwoFactorPress = () => {
    setShowTwoFactor(true);
  };
  const handleTwoFactorBack = () => {
    setShowTwoFactor(false);
  };

  const handleDataSharing = () => {
    Alert.alert('Data Sharing Preferences', 'Data sharing preferences will be implemented');
  };

  const handleLanguagePress = () => {
    Alert.alert('Language', 'Language selection will be implemented');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? You will need to sign in again to access your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'default', onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Error signing out:', error);
          }
        }},
      ]
    );
  };

  // Show Account Preferences screen if enabled
  if (showAccountPreferences) {
    return (
      <AccountPreferences onBackPress={handleAccountPreferencesBack} />
    );
  }

  // Show Profile Visibility screen if enabled
  if (showProfileVisibility) {
    return (
      <ProfileVisibility
        currentVisibility={profileVisibility}
        onVisibilityChange={setProfileVisibility}
        onBackPress={handleProfileVisibilityBack}
      />
    );
  }

  // Show Theme Selection screen if enabled
  if (showThemeSelection) {
    return (
      <ThemeSelection
        currentTheme={themeMode}
        onThemeChange={setThemeMode}
        onBackPress={handleThemeSelectionBack}
      />
    );
  }

  // Show Two Factor screen if enabled
  if (showTwoFactor) {
    return (
      <TwoFactorSetup onBackPress={handleTwoFactorBack} colors={{
        background: colors.background,
        cardBackground: colors.cardBackground,
        primaryText: colors.primaryText,
        secondaryText: colors.secondaryText,
        border: colors.border,
        accent: colors.accent,
        toggleActive: colors.toggleActive,
        toggleInactive: colors.toggleInactive,
      }} />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
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
          Privacy & Security
        </Text>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Preferences Section */}
        <View style={styles.accountSection}>
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBackground }]}>
            <SettingItem
              iconName="account"
              title="Account Preferences"
              subtitle="Manage your account settings and information"
              onPress={handleAccountPreferences}
              colors={colors}
            />
          </View>
        </View>

        {/* Security Section */}
        <SecuritySettings
          twoFactorAuth={twoFactorAuth}
          appLock={appLock}
          onTwoFactorAuthChange={setTwoFactorAuth}
          onTwoFactorAuthPress={handleTwoFactorPress}
          onLoginAlertsPress={handleLoginAlerts}
          onActiveSessionsPress={handleActiveSessions}
          onAppLockChange={setAppLock}
          onSecurityCheckupPress={handleSecurityCheckup}
          colors={colors}
        />

        {/* Privacy Section */}
        <PrivacySettings
          profileVisibility={profileVisibility}
          activityStatus={activityStatus}
          blockedAccounts={blockedAccounts}
          onProfileVisibilityPress={handleProfileVisibilityPress}
          onActivityStatusChange={setActivityStatus}
          onBlockedAccountsChange={setBlockedAccounts}
          onDataSharingPress={handleDataSharing}
          colors={colors}
        />

        {/* App Settings Section */}
        <AppSettings
          themeMode={themeMode}
          notifications={notifications}
          language={language}
          onThemePress={handleThemePress}
          onNotificationsChange={setNotifications}
          onLanguagePress={handleLanguagePress}
          colors={colors}
        />

        {/* Privacy Insights Section */}
        <PrivacyInsights colors={colors} />

        {/* Account Actions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
            Account Actions
          </Text>

          <View style={[styles.sectionCard, { backgroundColor: colors.cardBackground }]}>
            <SettingItem
              iconName="logout"
              title="Sign Out"
              subtitle="Sign out from your current session"
              onPress={handleSignOut}
              isDestructive={true}
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
    borderBottomWidth: 0,
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
  accountSection: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
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
  footer: {
    height: 80,
  },
});
