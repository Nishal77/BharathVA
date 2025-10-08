import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
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
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const inputBgColor = isDark ? '#1F2937' : '#F9FAFB';
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
          width: '100%',
          backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)',
        }}
      />
      
      {/* Gradient Fade Overlay */}
      <LinearGradient
        colors={isDark 
          ? ['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.95)', 'rgba(0,0,0,1)']
          : ['rgba(255,255,255,0)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.75)', 'rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']
        }
        locations={[0, 0.15, 0.3, 0.5, 0.7, 0.88, 1]}
        style={{
          position: 'absolute',
          top: height * 0.25,
          left: 0,
          width: width,
          height: height * 0.15,
        }}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <View className="flex-row items-center px-6 pt-12 pb-4 mt-4">
            <Pressable
              onPress={onBack}
              className="p-2"
            >
              <Image
                source={require('../../../assets/logo/arrow.png')}
                style={{ width: 20, height: 20 }}
                contentFit="contain"
              />
            </Pressable>
          </View>

          {/* Bottom Section - All Content */}
          <View className="px-6 pb-8" style={{ marginTop: height * 0.30 }}>
            {/* Header Text */}
            <View className="items-center mb-6">
              <Text 
                className="text-3xl font-bold text-center mb-3"
                style={{ color: textColor }}
              >
                Verify Your Email
              </Text>
              <Text 
                className="text-base text-center leading-6 mb-2"
                style={{ color: secondaryTextColor }}
              >
                We've sent a magical 6-digit code to your inbox
              </Text>
              <Text 
                className="text-lg font-semibold text-center"
                style={{ color: textColor }}
              >
                {email}
              </Text>
            </View>

            {/* Journey Text */}
            <Text 
              className="text-sm text-center mb-6"
              style={{ color: secondaryTextColor }}
            >
              Check your email and enter the code below to continue your journey! ✨
            </Text>

            {/* OTP Input Boxes */}
            <View className="flex-row justify-center mb-6">
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
                  className="w-12 h-12 mx-2 text-center text-xl font-bold rounded-xl border-2"
                  style={{
                    backgroundColor: inputBgColor,
                    borderColor: digit ? '#3B82F6' : borderColor,
                    color: textColor,
                  }}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Continue Button */}
            <Pressable
              onPress={handleVerify}
              disabled={!isOtpComplete || isLoading}
              className="rounded-xl py-4 mb-6"
              style={{
                backgroundColor: '#000000',
                opacity: (!isOtpComplete || isLoading) ? 0.5 : 1,
              }}
            >
              <Text 
                className="text-base font-semibold text-center"
                style={{ color: '#FFFFFF' }}
              >
                {isLoading ? 'Verifying...' : 'Continue'}
              </Text>
            </Pressable>

            {/* Resend Section */}
            <View className="items-center mb-6">
              <Text 
                className="text-sm text-center mb-2"
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
                  className="text-base font-semibold"
                  style={{ 
                    color: canResend ? '#3B82F6' : secondaryTextColor 
                  }}
                >
                  {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                </Text>
              </Pressable>
            </View>

            {/* Terms and Privacy */}
            <Text 
              className="text-sm text-center leading-5"
              style={{ color: secondaryTextColor }}
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
