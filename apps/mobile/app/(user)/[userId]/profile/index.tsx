import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import ProfileHeader from './ProfileHeader';
import PrivacySecurity from './components/settings/PrivacySecurity';
import { useAuth } from '../../../../contexts/AuthContext';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme colors
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    surface: isDark ? '#111111' : '#F9FAFB',
    cardBackground: isDark ? '#1A1A1A' : '#FFFFFF',
    primaryText: isDark ? '#FFFFFF' : '#000000',
    secondaryText: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
    accent: '#3B82F6',
  };

  const handleBackPress = () => {
    if (showPrivacySettings) {
      setShowPrivacySettings(false);
    } else {
      router.back();
    }
  };

  const handlePrivacyPress = () => {
    setShowPrivacySettings(true);
  };

  const handleMenuPress = () => {
    handlePrivacyPress();
  };

  if (showPrivacySettings) {
    return (
      <PrivacySecurity onBackPress={handleBackPress} />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ProfileHeader
        username={user?.username}
        onBackPress={handleBackPress}
        onPrivacyPress={handlePrivacyPress}
        onMenuPress={handleMenuPress}
      />
      
      <ScrollView style={{ flex: 1 }}>
        {/* Profile Content */}
        <View style={{ padding: 20 }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: colors.primaryText,
            textAlign: 'center',
            marginBottom: 20 
          }}>
            Welcome to BharathVA Profile
          </Text>
          
          <Text style={{ 
            fontSize: 16, 
            color: colors.secondaryText,
            textAlign: 'center',
            marginBottom: 30 
          }}>
            Tap the menu icon in the header to access Privacy & Security settings
          </Text>

          {/* Quick Access Card */}
          <Pressable
            onPress={handlePrivacyPress}
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('../../../../assets/logo/Category.png')}
                style={{
                  width: 32,
                  height: 32,
                  tintColor: colors.accent,
                  marginRight: 16,
                }}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.primaryText,
                  marginBottom: 4,
                }}>
                  Privacy & Security
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.secondaryText,
                }}>
                  Manage your account security and privacy settings
                </Text>
              </View>
              <Image
                source={require('../../../../assets/logo/arrow.png')}
                style={{
                  width: 16,
                  height: 16,
                  tintColor: colors.secondaryText,
                  transform: [{ rotate: '180deg' }],
                }}
                resizeMode="contain"
              />
            </View>
          </Pressable>

          {/* User Info Card */}
          <View style={{
            backgroundColor: colors.cardBackground,
            borderRadius: 12,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.primaryText,
              marginBottom: 12,
            }}>
              Account Information
            </Text>
            
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: colors.secondaryText }}>Username</Text>
              <Text style={{ fontSize: 16, color: colors.primaryText }}>@{user?.username || 'user'}</Text>
            </View>
            
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: colors.secondaryText }}>Email</Text>
              <Text style={{ fontSize: 16, color: colors.primaryText }}>{user?.email || 'user@example.com'}</Text>
            </View>
            
            <View>
              <Text style={{ fontSize: 14, color: colors.secondaryText }}>Full Name</Text>
              <Text style={{ fontSize: 16, color: colors.primaryText }}>{user?.fullName || 'User Name'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
