import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const { height: screenHeight } = Dimensions.get('screen');

// Responsive calculations based on device dimensions
const isSmallDevice = height < 700;
const isMediumDevice = height >= 700 && height <= 800;
const isLargeDevice = height > 800;
const isTablet = width > 768;

// Android-specific height calculations
const isAndroid = Platform.OS === 'android';
const statusBarHeight = isAndroid ? StatusBar.currentHeight || 0 : 0;
const availableHeight = height;

// Dynamic image scaling based on device dimensions
const aspectRatio = width / height;
const isWideScreen = aspectRatio > 0.5; // Wider than standard mobile
const isTallScreen = height > 800;

// Optimized image height based on device characteristics
const optimizedImageHeight = isAndroid 
  ? (isTallScreen ? 0.45 : isWideScreen ? 0.50 : 0.48)
  : (isTallScreen ? 0.50 : isWideScreen ? 0.45 : 0.48);

const overlayHeight = optimizedImageHeight;
const gradientStart = optimizedImageHeight - 0.15;

// Dynamic content positioning based on device characteristics - moved upward for perfect UI
const contentMarginTop = isSmallDevice ? 0.20 : isMediumDevice ? 0.25 : isLargeDevice ? 0.30 : 0.27;
const androidContentMarginTop = isAndroid ? Math.max(contentMarginTop - 0.05, 0.15) : contentMarginTop;

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
    <View className="flex-1" style={{ backgroundColor: bgColor, minHeight: availableHeight }}>
      {/* Header Image - Dynamic scaling based on device dimensions */}
      <Image
        source={require('../../../../assets/images/Amber Fort.jpeg')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: height * optimizedImageHeight,
          width: '100%',
        }}
        resizeMode={isWideScreen ? 'cover' : 'cover'}
        contentFit="cover"
      />
      
      {/* Enhanced Gradient Overlay for Better Readability */}
      <LinearGradient
        colors={isDark 
          ? ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)']
          : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.5)']
        }
        locations={[0, 0.5, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: height * optimizedImageHeight,
        }}
      />
      
      {/* Gradient Fade Overlay - Dynamic positioning based on image height */}
      <LinearGradient
        colors={isDark 
          ? ['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.95)', 'rgba(0,0,0,1)']
          : ['rgba(255,255,255,0)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.75)', 'rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']
        }
        locations={[0, 0.15, 0.3, 0.5, 0.7, 0.88, 1]}
        style={{
          position: 'absolute',
          top: height * (optimizedImageHeight - 0.15),
          left: 0,
          width: width,
          height: height * 0.15,
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
            source={require('../../../../assets/logo/arrow.png')}
            style={{
              width: 20,
              height: 20,
              tintColor: '#FFFFFF',
            }}
            contentFit="contain"
          />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        style={{ minHeight: availableHeight }}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            minHeight: availableHeight,
            paddingBottom: isAndroid ? 20 : 0,
          }}
        >
          {/* Bottom Section - All Content - Optimized positioning for all devices */}
          <View 
            className="px-6 pb-8" 
            style={{ 
              marginTop: height * (isAndroid ? androidContentMarginTop : contentMarginTop),
              minHeight: isAndroid ? availableHeight * 0.6 : undefined,
              paddingTop: isWideScreen ? 10 : (isTallScreen ? 5 : 0), // Reduced padding for upward positioning
            }}
          >
            {/* Header Text - Enhanced Hierarchy - Responsive with reduced spacing */}
            <View className="items-center" style={{ marginBottom: isSmallDevice ? 16 : isMediumDevice ? 18 : 20 }}>
              <Text 
                className={`${isSmallDevice ? 'text-xl' : isMediumDevice ? 'text-2xl' : isLargeDevice ? 'text-3xl' : 'text-2xl'} font-black text-center mb-3`}
                style={{ color: textColor }}
              >
                Set Your Password
              </Text>
              <Text 
                className={`${isSmallDevice ? 'text-xs' : isMediumDevice ? 'text-sm' : 'text-base'} text-center leading-6 px-4 font-medium`}
                style={{ color: secondaryTextColor }}
              >
                Keep your account secure with a strong, unique password.
              </Text>
              
              {/* India Brand Accent Line */}
              <View className="flex-row items-center mt-4">
                <View className="w-8 h-1 bg-orange-500 rounded-full mr-2" />
                <View className="w-8 h-1 bg-white rounded-full mr-2" />
                <View className="w-8 h-1 bg-green-500 rounded-full" />
              </View>
            </View>

            {/* Password Input - Reduced size and spacing */}
            <View style={{ marginBottom: isSmallDevice ? 12 : isMediumDevice ? 14 : 16 }}>
              <Text 
                className={`${isSmallDevice ? 'text-xs' : 'text-sm'} font-medium mb-2`}
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
                  className={`w-full ${isSmallDevice ? 'py-2.5' : isMediumDevice ? 'py-3' : 'py-3.5'} px-4 rounded-xl border ${isSmallDevice ? 'text-sm' : 'text-base'} ${
                    isDark 
                      ? 'bg-[#151515] border-white/5' 
                      : 'bg-gray-50 border-gray-300'
                  } ${password.length >= 8 ? 'border-green-500' : ''}`}
                  style={{
                    color: textColor,
                  }}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 ${isSmallDevice ? 'top-3' : isMediumDevice ? 'top-3.5' : 'top-4'}`}
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

            {/* Confirm Password Input - Reduced size and spacing */}
            <View style={{ marginBottom: isSmallDevice ? 16 : isMediumDevice ? 18 : 20 }}>
              <Text 
                className={`${isSmallDevice ? 'text-xs' : 'text-sm'} font-medium mb-2`}
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
                  className={`w-full ${isSmallDevice ? 'py-2.5' : isMediumDevice ? 'py-3' : 'py-3.5'} px-4 rounded-xl border ${isSmallDevice ? 'text-sm' : 'text-base'} ${
                    isDark 
                      ? 'bg-[#151515] border-white/5' 
                      : 'bg-gray-50 border-gray-300'
                  } ${confirmPassword.length >= 8 && password === confirmPassword ? 'border-green-500' : ''}`}
                  style={{
                    color: textColor,
                  }}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-4 ${isSmallDevice ? 'top-3' : isMediumDevice ? 'top-3.5' : 'top-4'}`}
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

            {/* Enhanced Create Password Button with Brand Gradient - Reduced size and responsive */}
            <View style={{ marginBottom: isSmallDevice ? 16 : isMediumDevice ? 18 : 20 }}>
              <Pressable
                onPress={handleCreatePassword}
                disabled={!isFormValid || isLoading}
                className={`rounded-xl ${isSmallDevice ? 'py-2.5' : isMediumDevice ? 'py-3' : 'py-3.5'} shadow-lg`}
              style={{
                backgroundColor: isFormValid && !isLoading 
                  ? (isDark ? '#FFFFFF' : '#000000') 
                  : '#9CA3AF',
                opacity: (!isFormValid || isLoading) ? 0.5 : 1,
                shadowColor: isFormValid && !isLoading ? '#000000' : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center justify-center">
                <Text 
                  className={`${isSmallDevice ? 'text-sm' : isMediumDevice ? 'text-base' : 'text-lg'} font-bold text-center mr-2`}
                  style={{ 
                    color: isFormValid && !isLoading 
                      ? (isDark ? '#000000' : '#FFFFFF') 
                      : '#FFFFFF' 
                  }}
                >
                  {isLoading ? 'Creating...' : 'Create Password'}
                </Text>
                {isFormValid && !isLoading && (
                  <View className={`${isSmallDevice ? 'w-4 h-4' : 'w-5 h-5'} bg-orange-500 rounded-full items-center justify-center`}>
                    <Text className="text-white text-xs font-bold">→</Text>
                  </View>
                )}
              </View>
            </Pressable>
            </View>


            {/* Terms and Privacy - Reduced spacing for upward positioning */}
            <Text 
              className={`${isSmallDevice ? 'text-xs' : 'text-sm'} text-center leading-5`}
              style={{ 
                color: secondaryTextColor,
                marginTop: isSmallDevice ? 8 : isMediumDevice ? 10 : 12,
              }}
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
