import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  useColorScheme,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SettingsIcon } from '../SettingsIcon';
import { authService } from '../../../../../../../services/api/authService';

interface ChangePasswordProps {
  onBackPress?: () => void;
}

export default function ChangePassword({ onBackPress }: ChangePasswordProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Theme colors
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    cardBackground: isDark ? '#1A1A1A' : '#FFFFFF',
    primaryText: isDark ? '#FFFFFF' : '#000000',
    secondaryText: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
    accent: '#3B82F6',
    error: '#EF4444',
    inputBackground: isDark ? '#1A1A1A' : '#F9FAFB',
    inputBorder: isDark ? '#374151' : '#E5E7EB',
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleChangePassword = async () => {
    // Validation
    if (!oldPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      Alert.alert('Invalid Password', passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from your current password');
      return;
    }

    try {
      setLoading(true);
      
      // TODO: Implement actual password change API call
      // const response = await authService.changePassword(oldPassword, newPassword);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Success',
        'Your password has been changed successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setOldPassword('');
              setNewPassword('');
              setConfirmPassword('');
              onBackPress?.();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    showPassword,
    onToggleVisibility,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    showPassword: boolean;
    onToggleVisibility: () => void;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.primaryText }]}>{label}</Text>
      <View style={[styles.inputContainer, { 
        backgroundColor: colors.inputBackground,
        borderColor: colors.inputBorder,
      }]}>
        <TextInput
          style={[styles.input, { color: colors.primaryText }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.secondaryText}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
        <Pressable
          onPress={onToggleVisibility}
          style={styles.eyeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.eyeIcon, { color: colors.secondaryText }]}>
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </Text>
        </Pressable>
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
          Change Password
        </Text>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={[styles.description, { color: colors.secondaryText }]}>
            Enter your current password and choose a new secure password for your account.
          </Text>

          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <PasswordInput
              label="Current Password"
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Enter your current password"
              showPassword={showOldPassword}
              onToggleVisibility={() => setShowOldPassword(!showOldPassword)}
            />

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <PasswordInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter your new password"
              showPassword={showNewPassword}
              onToggleVisibility={() => setShowNewPassword(!showNewPassword)}
            />

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your new password"
              showPassword={showConfirmPassword}
              onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </View>

          {/* Password Requirements */}
          <View style={[styles.requirementsCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.requirementsTitle, { color: colors.primaryText }]}>
              Password Requirements
            </Text>
            <View style={styles.requirementList}>
              <Text style={[styles.requirementItem, { color: colors.secondaryText }]}>
                • At least 8 characters long
              </Text>
              <Text style={[styles.requirementItem, { color: colors.secondaryText }]}>
                • Contains at least one uppercase letter
              </Text>
              <Text style={[styles.requirementItem, { color: colors.secondaryText }]}>
                • Contains at least one lowercase letter
              </Text>
              <Text style={[styles.requirementItem, { color: colors.secondaryText }]}>
                • Contains at least one number
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleChangePassword}
            disabled={loading || !oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
            style={({ pressed }) => [
              styles.submitButton,
              {
                backgroundColor: colors.accent,
                opacity: loading || !oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()
                  ? 0.5
                  : pressed
                  ? 0.8
                  : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Change Password</Text>
            )}
          </Pressable>
        </View>
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
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
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
    marginBottom: 20,
  },
  inputGroup: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  divider: {
    height: 1,
    opacity: 0.3,
    marginHorizontal: 16,
  },
  requirementsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirementList: {
    gap: 8,
  },
  requirementItem: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

