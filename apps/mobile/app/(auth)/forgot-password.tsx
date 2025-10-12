import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your account details');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push('/(auth)/verify-otp');
    }, 1500);
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
        source={require('../../assets/images/forgot1.jpg')}
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
              className="text-3xl font-bold text-black text-center leading-tight mb-2"
            >
              Forgot your password?
            </Text>
            <Text 
              className="text-gray-600 text-base text-center leading-relaxed"
            >
             Don’t worry, we’ll get you back in.
            </Text>
          </View>

        {/* Reset Form */}
        <View className="px-6 pb-8">
          <Text className="text-gray-600 text-base text-center mb-8 leading-relaxed">
          Enter your email, phone, or username and we’ll send reset instructions.
          </Text>

          {/* Email Input */}
          <View className="mb-8">
            <Text className="text-gray-700 text-base font-medium mb-3">Account Details</Text>
            <View className="bg-gray-50 rounded-2xl px-4 py-4 border border-gray-200">
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Phone, email, or username"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="text-gray-900 text-base"
              />
            </View>
          </View>

          {/* Reset Button */}
          <Pressable
            onPress={handleResetPassword}
            disabled={isLoading}
            className={`py-4 rounded-2xl mb-6 ${
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
              {isLoading ? 'Sending...' : 'Reset My Password'}
            </Text>
          </Pressable>

          {/* Back to Login */}
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-600 text-base">
              Remember your password?{' '}
            </Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text className="text-black text-base font-semibold">
                Sign In
              </Text>
            </Pressable>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
