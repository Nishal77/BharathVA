import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
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
  View,
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
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
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Navigate to password screen with email parameter
    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: '/(auth)/password',
        params: { email: email.toLowerCase().trim() }
      });
    }, 500);
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
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


  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'} justify-center items-center`}>
        <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-xl`}>Loading...</Text>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Bottom Image - 30% Height */}
      <Image
        source={require('../../assets/images/TajMahal.jpeg')}
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
      
      {/* Theme-based Image Overlay - Dark overlay in light mode, light overlay in dark mode */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: height * 0.3,
          width: '100%',
          backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
        }}
      />
      
      {/* Gradient Fade Overlay - Creates smooth fade effect at top of image */}
      <LinearGradient
        colors={isDark 
          ? ['rgba(0,0,0,1)', 'rgba(0,0,0,0.95)', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0)']
          : ['rgba(255,255,255,1)', 'rgba(255,255,255,0.95)', 'rgba(255,255,255,0.75)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0)']
        }
        locations={[0, 0.12, 0.3, 0.5, 0.7, 0.85, 1]}
        style={{
          position: 'absolute',
          bottom: height * 0.15,
          left: 0,
          width: width,
          height: height * 0.15,
        }}
      />
      
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Spacing */}
        <View className="pt-12 pb-1" />

        {/* Welcome Section */}
        <View className="mx-6 mb-12 mt-6">
          {/* Back Button positioned near India image */}
          <View className="absolute top-0 left-0 z-10">
            <Pressable
              onPress={handleBack}
              className="w-10 h-10 items-center justify-center"
            >
              <Image
                source={require('../../assets/logo/arrow.png')}
                className="w-6 h-6"
                resizeMode="contain"
                style={{
                  tintColor: isDark ? 'white' : 'black',
                }}
              />
            </Pressable>
          </View>
          
          <View className="items-center mb-2">
            <Image
              source={require('../../assets/images/india.png')}
              className="w-24 h-24"
              resizeMode="contain"
              style={{
                tintColor: isDark ? 'white' : 'black',
              }}
            />
          </View>
          <Text 
            className={`text-3xl font-semibold ${isDark ? 'text-white' : 'text-black'} text-center leading-tight`}
          >
            Join the Billion Voices
          </Text>
          
          {/* Register Link - Moved to top */}
          <View className="flex-row justify-center items-center">
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-base`}>
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={handleRegister}>
              <Text className={`${isDark ? 'text-white' : 'text-black'} text-base font-semibold`}>
                Sign Up
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Login Form */}
        <View className="px-6 pb-8">
          {/* Email Input */}
          <View className="mb-6">
            <Text className={`${isDark ? 'text-white' : 'text-black'} text-base font-semibold mb-3`}>Your Account</Text>
            <View className={`${isDark ? 'bg-[#151515]' : 'bg-white'} rounded-2xl px-4 py-4 border ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Phone, email address or username"
                placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className={`${isDark ? 'text-white' : 'text-gray-900'} text-base`}
              />
            </View>
          </View>

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            className={`py-4 rounded-2xl mb-8 ${
              isLoading ? 'bg-gray-400' : (isDark ? 'bg-white' : 'bg-black')
            }`}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text 
              className={`${isDark ? 'text-black' : 'text-white'} text-lg font-bold text-center`}
            >
              {isLoading ? 'Signing In...' : 'Next'}
            </Text>
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center mb-8">
            <View className={`flex-1 h-px ${isDark ? 'bg-white/15' : 'bg-gray-200'}`} />
            <Text className={`${isDark ? 'text-gray-200' : 'text-gray-400'} text-sm mx-4 font-medium`}>Or</Text>
            <View className={`flex-1 h-px ${isDark ? 'bg-white/15' : 'bg-gray-200'}`} />
          </View>

          {/* Social Login Buttons */}
          <View className="space-y-4">
            {/* Google Button */}
            <Pressable 
              className={`${isDark ? 'bg-[#151515]' : 'bg-white'} border ${isDark ? 'border-white/5' : 'border-gray-200'} py-4 rounded-2xl flex-row items-center justify-center`}
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
              <Text className={`${isDark ? 'text-white' : 'text-black'} text-base font-semibold`}>
                Sign in with Google
              </Text>
            </Pressable>

            {/* Apple Button */}
            <Pressable 
              className={`${isDark ? 'bg-[#151515]' : 'bg-white'} border ${isDark ? 'border-white/5' : 'border-gray-200'} py-4 rounded-2xl flex-row items-center justify-center mt-3`}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <View className="w-6 h-6 mr-3 items-center justify-center">
                <Ionicons 
                  name="logo-apple" 
                  size={24} 
                  color={isDark ? 'white' : 'black'} 
                />
              </View>
              <Text className={`${isDark ? 'text-white' : 'text-black'} text-base font-semibold`}>
                Sign in with Apple
              </Text>
            </Pressable>
            
          </View>

          {/* Privacy Policy Text */}
          <View className="mt-8 mb-6">
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-400'} text-sm text-center leading-4`}>
              By continuing, you agree to our{' '}
              <Text className={isDark ? 'text-white' : 'text-black'}>Terms &amp; Conditions</Text> and{' '}
              <Text className={isDark ? 'text-white' : 'text-black'}>Privacy Policy</Text>.
            </Text>
          </View>


        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
