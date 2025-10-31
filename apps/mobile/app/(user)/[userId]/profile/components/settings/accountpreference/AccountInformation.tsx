import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SettingsIcon } from '../SettingsIcon';
import { authService } from '../../../../../../../services/api/authService';

interface AccountInformationProps {
  onBackPress?: () => void;
}

interface UserProfileData {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  countryCode?: string;
  dateOfBirth?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Calculate responsive label width based on device width
const getLabelWidth = (deviceWidth: number): number => {
  if (deviceWidth < 360) return 95; // Small phones - optimize space
  if (deviceWidth < 400) return 105; // Medium phones
  if (deviceWidth < 768) return 115; // Large phones - optimize for email
  return 135; // Tablets
};

export default function AccountInformation({ onBackPress }: AccountInformationProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const labelWidth = getLabelWidth(SCREEN_WIDTH);

  // Theme colors
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    cardBackground: isDark ? '#1A1A1A' : '#FFFFFF',
    primaryText: isDark ? '#FFFFFF' : '#000000',
    secondaryText: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
    accent: '#3B82F6',
    error: '#EF4444',
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.getCurrentUserProfile();
      
      if (response.success && response.data) {
        setUserProfile(response.data as UserProfileData);
      } else {
        throw new Error(response.message || 'Failed to fetch user profile');
      }
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'Failed to load account information');
      Alert.alert(
        'Error',
        'Unable to fetch your account information. Please try again.',
        [
          { text: 'Cancel', style: 'cancel', onPress: onBackPress },
          { text: 'Retry', onPress: fetchUserProfile },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phoneNumber?: string, countryCode?: string): string => {
    if (!phoneNumber) return 'Not set';
    if (countryCode) {
      return `${countryCode} ${phoneNumber}`;
    }
    return phoneNumber;
  };

  const InfoRow = ({ 
    label, 
    value, 
    isEmail = false 
  }: { 
    label: string; 
    value: string;
    isEmail?: boolean;
  }) => (
    <View style={styles.infoRow}>
      <View style={[styles.labelContainer, { width: labelWidth }]}>
        <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>{label}</Text>
      </View>
      <View style={styles.valueContainer}>
        {isEmail ? (
          <Text 
            style={[styles.infoValue, styles.emailValue, { color: colors.primaryText }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {value}
          </Text>
        ) : (
          <Text 
            style={[styles.infoValue, { color: colors.primaryText }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {value}
          </Text>
        )}
      </View>
    </View>
  );

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
          Account Information
        </Text>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
              Loading account information...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          </View>
        ) : userProfile ? (
          <View style={styles.section}>
            <View style={[styles.sectionCard, { backgroundColor: colors.cardBackground }]}>
              <InfoRow
                label="Username"
                value={`@${userProfile.username || 'Not set'}`}
              />
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <InfoRow
                label="Email"
                value={userProfile.email || 'Not set'}
                isEmail={true}
              />
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <InfoRow
                label="Phone Number"
                value={formatPhoneNumber(userProfile.phoneNumber, userProfile.countryCode)}
              />
            </View>
          </View>
        ) : null}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '400',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  section: {
    marginTop: 0,
    paddingTop: 16,
    paddingHorizontal: SCREEN_WIDTH < 360 ? 16 : 20,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 18,
    paddingHorizontal: SCREEN_WIDTH < 360 ? 16 : 20,
    minHeight: 56,
  },
  labelContainer: {
    marginRight: SCREEN_WIDTH < 360 ? 12 : 16,
    paddingTop: 2,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  valueContainer: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    justifyContent: 'flex-end',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'right',
    flexShrink: 1,
  },
  emailValue: {
    fontSize: 15,
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    opacity: 0.3,
    marginHorizontal: 16,
  },
});

