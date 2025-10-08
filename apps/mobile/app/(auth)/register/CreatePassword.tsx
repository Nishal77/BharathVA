import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    useColorScheme,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface CreatePasswordProps {
  onBack: () => void;
  onCreatePassword: (password: string, confirmPassword: string) => void;
}

export default function CreatePassword({ 
  onBack, 
  onCreatePassword 
}: CreatePasswordProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Theme colors
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const inputBgColor = isDark ? '#374151' : '#F9FAFB';
  const borderColor = isDark ? '#4B5563' : '#D1D5DB';

  const isFormValid = password.length >= 8 && confirmPassword.length >= 8 && password === confirmPassword;

  const handleCreatePassword = async () => {
    if (!isFormValid) return;
    
    setIsLoading(true);
    try {
      await onCreatePassword(password, confirmPassword);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {/* Header Image - 40% Height */}
      <Image
        source={require('../../../assets/images/beach.jpg')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: height * 0.4,
          width: '100%',
        }}
        resizeMode="cover"
      />
      
      {/* Theme-based Image Overlay */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: height * 0.4,
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
        }}
      />

      {/* Back Button */}
      <View className="flex-row items-center px-6 pt-12 pb-4 mt-4">
        <Pressable
          onPress={onBack}
          className="p-2 rounded-full"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <Image
            source={require('../../../assets/logo/arrow.png')}
            style={{
              width: 20,
              height: 20,
              tintColor: '#FFFFFF',
              transform: [{ rotate: '180deg' }],
            }}
            contentFit="contain"
          />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Bottom Section - All Content */}
          <View className="px-6 pb-8" style={{ marginTop: height * 0.30 }}>
            {/* Header Text */}
            <View className="items-center mb-6">
              <Text 
                className="text-3xl font-bold text-center mb-3"
                style={{ color: textColor }}
              >
                Create Your Password
              </Text>
              <Text 
                className="text-base text-center leading-6 mb-2"
                style={{ color: secondaryTextColor }}
              >
                Choose a strong password to secure your account
              </Text>
              <Text 
                className="text-sm text-center"
                style={{ color: secondaryTextColor }}
              >
                Make it memorable but secure! 🔒
              </Text>
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text 
                className="text-sm font-medium mb-2"
                style={{ color: textColor }}
              >
                Password
              </Text>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={secondaryTextColor}
                  secureTextEntry={!showPassword}
                  className="w-full py-4 px-4 rounded-xl border-2 text-base"
                  style={{
                    backgroundColor: inputBgColor,
                    borderColor: password.length >= 8 ? '#10B981' : borderColor,
                    color: textColor,
                  }}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  <Text 
                    className="text-sm font-semibold"
                    style={{ color: '#3B82F6' }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
              {password.length > 0 && password.length < 8 && (
                <Text 
                  className="text-xs mt-1"
                  style={{ color: '#EF4444' }}
                >
                  Password must be at least 8 characters
                </Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Text 
                className="text-sm font-medium mb-2"
                style={{ color: textColor }}
              >
                Confirm Password
              </Text>
              <View className="relative">
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor={secondaryTextColor}
                  secureTextEntry={!showConfirmPassword}
                  className="w-full py-4 px-4 rounded-xl border-2 text-base"
                  style={{
                    backgroundColor: inputBgColor,
                    borderColor: confirmPassword.length >= 8 && password === confirmPassword ? '#10B981' : borderColor,
                    color: textColor,
                  }}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4"
                >
                  <Text 
                    className="text-sm font-semibold"
                    style={{ color: '#3B82F6' }}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text 
                  className="text-xs mt-1"
                  style={{ color: '#EF4444' }}
                >
                  Passwords do not match
                </Text>
              )}
            </View>

            {/* Create Password Button */}
            <Pressable
              onPress={handleCreatePassword}
              disabled={!isFormValid || isLoading}
              className="rounded-xl py-4 mb-6"
              style={{
                backgroundColor: isFormValid && !isLoading ? '#000000' : '#9CA3AF',
                opacity: (!isFormValid || isLoading) ? 0.5 : 1,
              }}
            >
              <Text 
                className="text-base font-semibold text-center"
                style={{ color: '#FFFFFF' }}
              >
                {isLoading ? 'Creating...' : 'Create Password'}
              </Text>
            </Pressable>

            {/* Password Requirements */}
            <View className="mb-6">
              <Text 
                className="text-sm font-medium mb-3"
                style={{ color: textColor }}
              >
                Password Requirements:
              </Text>
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <Text 
                    className="text-sm mr-2"
                    style={{ color: password.length >= 8 ? '#10B981' : secondaryTextColor }}
                  >
                    {password.length >= 8 ? '✓' : '○'}
                  </Text>
                  <Text 
                    className="text-sm"
                    style={{ color: secondaryTextColor }}
                  >
                    At least 8 characters
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text 
                    className="text-sm mr-2"
                    style={{ color: password === confirmPassword && password.length >= 8 ? '#10B981' : secondaryTextColor }}
                  >
                    {password === confirmPassword && password.length >= 8 ? '✓' : '○'}
                  </Text>
                  <Text 
                    className="text-sm"
                    style={{ color: secondaryTextColor }}
                  >
                    Passwords match
                  </Text>
                </View>
              </View>
            </View>

            {/* Terms and Privacy */}
            <Text 
              className="text-sm text-center leading-5"
              style={{ color: secondaryTextColor }}
            >
              By creating your password, you agree to our{' '}
              <Text style={{ color: '#3B82F6' }}>Terms</Text>
              {' '}and{' '}
              <Text style={{ color: '#3B82F6' }}>Privacy Policy</Text>
              . Your account is protected with{' '}
              <Text style={{ color: '#3B82F6' }}>Secure Data & Cookie Policy</Text>
              .
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
