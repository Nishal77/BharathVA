import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
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

// Get screen dimensions for better Android compatibility
const screenData = Dimensions.get('screen');
const screenHeight = screenData.height;
const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
const availableHeight = height;

// Responsive calculations based on device dimensions
const isSmallDevice = height < 700;
const isMediumDevice = height >= 700 && height <= 800;
const isLargeDevice = height > 800;
const isTablet = width > 768;

// Dynamic sizing based on device for perfect compatibility
const imageHeight = isSmallDevice ? 0.40 : isMediumDevice ? 0.45 : isLargeDevice ? 0.50 : 0.48;
const overlayHeight = imageHeight;
const gradientStart = imageHeight - 0.15;
const contentMarginTop = isSmallDevice ? 0.25 : isMediumDevice ? 0.30 : isLargeDevice ? 0.35 : 0.32;

// Android-specific adjustments for full height
const isAndroid = Platform.OS === 'android';

// Dynamic image scaling based on device dimensions
const aspectRatio = width / height;
const isWideScreen = aspectRatio > 0.5; // Wider than standard mobile
const isTallScreen = height > 800;

// Optimized image height based on device characteristics
const optimizedImageHeight = isAndroid 
  ? (isTallScreen ? 0.45 : isWideScreen ? 0.50 : 0.48)
  : (isTallScreen ? 0.50 : isWideScreen ? 0.45 : 0.48);

const androidContentMarginTop = isAndroid ? Math.max(contentMarginTop - 0.03, 0.20) : contentMarginTop;

interface OTPVerificationProps {
  email: string;
  onBack: () => void;
  onVerify: (otp: string) => void;
  onResend: () => void;
}

export default function OTPVerification({ 
  email, 
  onBack, 
  onVerify, 
  onResend 
}: OTPVerificationProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<TextInput[]>([]);
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB';
  const inputBgColor = isDark ? '#151515' : '#F9FAFB';
  const buttonBgColor = isDark ? '#1F2937' : '#F3F4F6';

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        onVerify(otpString);
      }, 1000);
    }
  };

  const handleResend = () => {
    if (canResend) {
      setResendTimer(30);
      setCanResend(false);
      onResend();
      
      // Start countdown
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor, minHeight: availableHeight }}>
      {/* Header Image - Dynamic scaling based on device dimensions */}
      <Image
        source={require('../../assets/images/beach.jpg')}
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

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        style={{ minHeight: availableHeight }}
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ 
            flexGrow: 1,
            minHeight: availableHeight,
            paddingBottom: isAndroid ? 20 : 0
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <View className="flex-row items-center px-6 pt-12 pb-4 mt-4">
            <Pressable
              onPress={onBack}
              className="p-2 rounded-full"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Image
                source={require('../../assets/logo/arrow.png')}
                style={{
                  width: 20,
                  height: 20,
                  tintColor: '#FFFFFF',
                }}
                contentFit="contain"
              />
            </Pressable>
          </View>

          {/* Bottom Section - All Content - Optimized positioning for all devices */}
          <View 
            className="px-6 pb-8" 
            style={{ 
              marginTop: height * (isAndroid ? androidContentMarginTop : contentMarginTop),
              minHeight: isAndroid ? availableHeight * 0.6 : undefined,
              paddingTop: isWideScreen ? 15 : (isTallScreen ? 10 : 5), // Dynamic padding based on screen
            }}
          >
            {/* Header Text - Enhanced Hierarchy - Responsive with dynamic spacing */}
            <View className="items-center" style={{ marginBottom: isSmallDevice ? 20 : isMediumDevice ? 24 : 28 }}>
              <Text 
                className={`${isSmallDevice ? 'text-xl' : isMediumDevice ? 'text-2xl' : isLargeDevice ? 'text-3xl' : 'text-2xl'} font-black text-center mb-3`}
                style={{ color: textColor }}
              >
                Verify Your Email
              </Text>
              <Text 
                className={`${isSmallDevice ? 'text-xs' : isMediumDevice ? 'text-sm' : 'text-base'} text-center leading-5 px-4 font-medium`}
                style={{ color: secondaryTextColor }}
              >
                We've sent a magical 6-digit code to your inbox
              </Text>
            </View>

            {/* Journey Text - Responsive */}
            <Text 
              className={`${isSmallDevice ? 'text-xs' : 'text-sm'} text-center mb-5`}
              style={{ color: secondaryTextColor }}
            >
              Check your email and enter the code below to continue your journey!
            </Text>

            {/* OTP Input Boxes - Responsive */}
            <View className="flex-row justify-center" style={{ marginBottom: isSmallDevice ? 20 : isMediumDevice ? 24 : 28 }}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  className={`${isSmallDevice ? 'w-10 h-10 mx-1' : isMediumDevice ? 'w-11 h-11 mx-1.5' : 'w-12 h-12 mx-2'} text-center ${isSmallDevice ? 'text-lg' : 'text-xl'} font-bold rounded-xl border`}
                  style={{
                    backgroundColor: inputBgColor,
                    borderColor: digit ? '#3B82F6' : borderColor,
                    color: textColor,
                  }}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Enhanced Continue Button with Brand Gradient - Responsive with dynamic spacing */}
            <View style={{ marginBottom: isSmallDevice ? 20 : isMediumDevice ? 24 : 28 }}>
              <Pressable
                onPress={handleVerify}
                disabled={!isOtpComplete || isLoading}
                className={`rounded-xl ${isSmallDevice ? 'py-2.5' : isMediumDevice ? 'py-3' : 'py-3.5'} shadow-lg`}
              style={{
                backgroundColor: isOtpComplete && !isLoading 
                  ? (isDark ? '#FFFFFF' : '#000000') 
                  : '#9CA3AF',
                opacity: (!isOtpComplete || isLoading) ? 0.5 : 1,
                shadowColor: isOtpComplete && !isLoading ? '#000000' : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center justify-center">
                <Text 
                  className={`${isSmallDevice ? 'text-sm' : isMediumDevice ? 'text-sm' : 'text-base'} font-bold text-center mr-2`}
                  style={{ 
                    color: isOtpComplete && !isLoading 
                      ? (isDark ? '#000000' : '#FFFFFF') 
                      : '#FFFFFF' 
                  }}
                >
                  {isLoading ? 'Verifying...' : 'Continue'}
                </Text>
                {isOtpComplete && !isLoading && (
                  <View className={`${isSmallDevice ? 'w-4 h-4' : 'w-5 h-5'} bg-orange-500 rounded-full items-center justify-center`}>
                    <Text className="text-white text-xs font-bold">→</Text>
                  </View>
                )}
              </View>
            </Pressable>
            </View>

            {/* Resend Section - Responsive with dynamic spacing */}
            <View className="items-center" style={{ marginBottom: isSmallDevice ? 20 : isMediumDevice ? 24 : 28 }}>
              <Text 
                className={`${isSmallDevice ? 'text-xs' : 'text-sm'} text-center mb-2`}
                style={{ color: secondaryTextColor }}
              >
                Didn't receive the magical code?
              </Text>
              <Pressable
                onPress={handleResend}
                disabled={!canResend}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text 
                  className={`${isSmallDevice ? 'text-sm' : 'text-base'} font-semibold`}
                  style={{ 
                    color: canResend ? '#3B82F6' : secondaryTextColor 
                  }}
                >
                  {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                </Text>
              </Pressable>
            </View>

            {/* Terms and Privacy - Responsive with dynamic spacing */}
            <Text 
              className={`${isSmallDevice ? 'text-xs' : 'text-sm'} text-center leading-4`}
              style={{ 
                color: secondaryTextColor,
                marginTop: isSmallDevice ? 10 : isMediumDevice ? 15 : 20,
              }}
            >
              By verifying your email, you agree to our{' '}
              <Text style={{ color: '#3B82F6' }}>Terms</Text>
              {' '}and{' '}
              <Text style={{ color: '#3B82F6' }}>Privacy Policy</Text>
              . Your trust and voice are protected under{' '}
              <Text style={{ color: '#3B82F6' }}>Secure Data & Cookie Policy</Text>
              .
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
