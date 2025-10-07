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

const { height, width } = Dimensions.get('window');

export default function PasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load the Aclonica font
  const [fontsLoaded] = useFonts({
    Aclonica: require('../../assets/fonts/Aclonica-Regular.ttf'),
  });

  const handleLogin = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push('/(user)/123/(tabs)');
    }, 1500);
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  const handleBack = () => {
    router.push('/(auth)/login');
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
        source={require('../../assets/images/11.jpg')}
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
      
      {/* Theme-based Image Overlay - Dark overlay in light mode, light overlay in dark mode */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: height * 0.4,
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
          bottom: height * 0.2,
          left: 0,
          width: width,
          height: height * 0.2,
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
            <Text className={`text-3xl font-semibold ${isDark ? 'text-white' : 'text-black'} text-center leading-tight mb-2`}>
              Good to see you again
            </Text>
            <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-500'} text-center font-medium px-2`}>
            {/* Enter your password to continue. */}
            Unlock your account with your password
            </Text>
          </View>

          {/* Password Form */}
          <View className="px-6 pb-8">
            {/* Password Input */}
            <View className="mb-6">
              <Text className={`${isDark ? 'text-white' : 'text-black'} text-base font-semibold mb-3`}>Enter your password</Text>
              <View className={`${isDark ? 'bg-[#151515]' : 'bg-white'} rounded-2xl px-4 py-4 border ${isDark ? 'border-white/5' : 'border-gray-200'} flex-row items-center`}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="********"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  className={`${isDark ? 'text-white' : 'text-gray-900'} text-base flex-1`}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="ml-2"
                >
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-base`}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Remember Me and Forgot Password */}
            <View className="flex-row justify-between items-center mb-8">
              {/* Remember Me Checkbox */}
              <Pressable 
                onPress={() => setRememberMe(!rememberMe)}
                className="flex-row items-center"
              >
                <View className={`w-5 h-5 rounded border-2 mr-2 ${
                  rememberMe ? 'bg-blue-600 border-blue-600' : (isDark ? 'border-gray-600' : 'border-gray-300')
                }`}>
                  {rememberMe && (
                    <Text className="text-white text-xs text-center leading-5">✓</Text>
                  )}
                </View>
                <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-base`}>
                  Remember me
                </Text>
              </Pressable>

              {/* Forgot Password */}
              <Pressable onPress={handleForgotPassword}>
                <Text className={`${isDark ? 'text-white' : 'text-black'} text-base font-medium`}>
                  Forgot password?
                </Text>
              </Pressable>
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
                {isLoading ? 'Signing In...' : 'Log in'}
              </Text>
            </Pressable>

            {/* Register Link */}
            <View className="flex-row justify-center items-center">
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-base`}>
                Don't have an account?{' '}
              </Text>
              <Pressable onPress={handleRegister}>
                <Text className={`${isDark ? 'text-white' : 'text-black'} text-base font-semibold`}>
                  Sign up
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
