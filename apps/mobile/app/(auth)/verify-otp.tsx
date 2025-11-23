import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from 'react-native';

const { height } = Dimensions.get('window');

export default function VerifyOTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter the complete OTP');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'OTP verified successfully!', [
        { text: 'OK', onPress: () => router.push('/(auth)/password') }
      ]);
    }, 1500);
  };

  const handleResend = () => {
    Alert.alert('Success', 'OTP resent to your phone number');
  };

  const handleBack = () => {
    // Check if we can go back in the auth stack
    if (router.canGoBack()) {
      router.back();
    } else {
      // If no previous screen, go to landing page
      router.replace('/');
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Bottom Image - 30% Height */}
      <Image
        source={require('../../assets/images/incrible.jpg')}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: height * 0.4,
          width: '100%',
        }}
        resizeMode="cover"
      />
      
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header with Back Button */}
          <View className="flex-row items-center justify-between px-6 pt-16">
            <Pressable
              onPress={handleBack}
              className="w-8 h-8 items-center justify-center mt-2"
            >
              <Text className="text-gray-600 text-2xl font-bold">‹</Text>
            </Pressable>
            <View className="w-8" />
          </View>

          {/* Welcome Section */}
          <View className="mx-6 mb-12 mt-8">
            <Text 
              className="text-3xl font-bold text-black text-center leading-tight mb-4"
            >
              Verify Your Identity
            </Text>
            <Text 
              className="text-gray-600 text-base text-center leading-relaxed"
            >
              We've sent a 6-digit code to your registered number
            </Text>
          </View>

          {/* OTP Form */}
          <View className="px-6 pb-8">
            <Text className="text-gray-600 text-base text-center mb-8 leading-relaxed">
              Enter the verification code below to continue
            </Text>

            {/* OTP Input Fields */}
            <View className="flex-row justify-between mb-8 px-2">
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
                  className="w-14 h-16 bg-white rounded-2xl border-2 border-gray-200 text-center text-2xl font-bold text-gray-900"
                  placeholderTextColor="#E5E7EB"
                  placeholder=""
                />
              ))}
            </View>

            {/* Verify Button */}
            <Pressable
              onPress={handleVerify}
              disabled={isLoading}
              className={`py-4 rounded-2xl mb-8 ${
                isLoading ? 'bg-gray-400' : 'bg-black'
              }`}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text 
                className="text-white text-lg font-bold text-center"
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </Text>
            </Pressable>

            {/* Resend OTP */}
            <View className="flex-row justify-center items-center mb-6">
              <Text className="text-gray-600 text-base">
                Didn't receive the code?{' '}
              </Text>
              <Pressable onPress={handleResend}>
                <Text className="text-black text-base font-semibold">
                  Resend OTP
                </Text>
              </Pressable>
            </View>

            {/* Back to Login */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-600 text-base">
                Wrong number?{' '}
              </Text>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <Text className="text-black text-base font-semibold">
                  Change Number
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
