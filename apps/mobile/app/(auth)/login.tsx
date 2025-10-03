import { useFonts } from 'expo-font';
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


export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load the Aclonica font
  const [fontsLoaded] = useFonts({
    Aclonica: require('../../assets/fonts/Aclonica-Regular.ttf'),
  });

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push('/(auth)/password');
    }, 1500);
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };


  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600 text-xl">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Bottom Image - 20% Height */}
      <Image
        source={require('../../assets/images/login.jpg')}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: height * 0.3,
          width: '100%',
        }}
        resizeMode="cover"
      />
      
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Spacing */}
        <View className="pt-12 pb-4" />

        {/* Welcome Section */}
        <View className="mx-6 mb-12 mt-6">
          <View className="items-center mb-2">
            <Image
              source={require('../../assets/images/india.png')}
              className="w-24 h-24"
              resizeMode="contain"
            />
          </View>
          <Text 
            className="text-3xl font-semibold text-black text-center leading-tight"
          >
            Join the Billion Voices
          </Text>
          
          {/* Register Link - Moved to top */}
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-600 text-base">
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={handleRegister}>
              <Text className="text-black text-base font-semibold">
                Sign Up
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Login Form */}
        <View className="px-6 pb-8">
          {/* Email Input */}
          <View className="mb-6">
            <Text className="text-black text-base font-semibold mb-3">Your Account</Text>
            <View className="bg-white rounded-2xl px-4 py-4 border border-gray-200">
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Phone, email address or username"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="text-gray-900 text-base"
              />
            </View>
          </View>

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
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
              {isLoading ? 'Signing In...' : 'Next'}
            </Text>
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center mb-8">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-gray-400 text-sm mx-4 font-medium">Or</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Social Login Buttons */}
          <View className="space-y-4">
            {/* Google Button */}
            <Pressable 
              className="bg-white border border-gray-200 py-4 rounded-2xl flex-row items-center justify-center"
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <View className="w-6 h-6 mr-3 items-center justify-center">
                <Image
                  source={require('../../assets/logo/Google.png')}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base font-semibold">
                Sign in with Google
              </Text>
            </Pressable>

            {/* Apple Button */}
            <Pressable 
              className="bg-white border border-gray-200 py-4 rounded-2xl flex-row items-center justify-center mt-3"
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <View className="w-6 h-6 mr-3 items-center justify-center">
                <Image
                  source={require('../../assets/logo/Apple.png')}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-black text-base font-semibold">
                Sign in with Apple
              </Text>
            </Pressable>
            
          </View>

          {/* Privacy Policy Text */}
          <View className="mt-8 mb-6">
            <Text className="text-gray-400 text-sm text-center leading-4">
              By continuing, you agree to our{' '}
              <Text className="text-black">Terms &amp; Conditions</Text> and{' '}
              <Text className="text-black">Privacy Policy</Text>.
            </Text>
          </View>


        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
