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

export default function PasswordScreen() {
  const router = useRouter();
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
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600 text-xl">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Bottom Image - 20% Height */}
      <Image
        source={require('../../assets/images/redfort.jpg')}
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
          <View className="mx-6 mb-12">
            <View className="items-center mb-2">
              <Image
                source={require('../../assets/images/india.png')}
                className="w-24 h-24"
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl font-semibold text-black text-center leading-tight mb-2">
              Good to see you again
            </Text>
            <Text className="text-base text-gray-500 text-center font-medium px-2">
            {/* Enter your password to continue. */}
            Unlock your account with your password
            </Text>
          </View>

          {/* Password Form */}
          <View className="px-6 pb-8">
            {/* Password Input */}
            <View className="mb-6">
              <Text className="text-black text-base font-semibold mb-3">Enter your password</Text>
              <View className="bg-white rounded-2xl px-4 py-4 border border-gray-200 flex-row items-center">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="********"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  className="text-gray-900 text-base flex-1"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="ml-2"
                >
                  <Text className="text-gray-500 text-base">
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
                  rememberMe ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}>
                  {rememberMe && (
                    <Text className="text-white text-xs text-center leading-5">✓</Text>
                  )}
                </View>
                <Text className="text-gray-700 text-base">
                  Remember me
                </Text>
              </Pressable>

              {/* Forgot Password */}
              <Pressable onPress={handleForgotPassword}>
                <Text className="text-black text-base font-medium">
                  Forgot password?
                </Text>
              </Pressable>
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              className={`py-4 rounded-2xl mb-8 ${
                isLoading ? 'bg-gray-400' : 'bg-gray-600'
              }`}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text 
                className="text-white text-lg font-bold text-center"
              >
                {isLoading ? 'Signing In...' : 'Log in'}
              </Text>
            </Pressable>

            {/* Register Link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-600 text-base">
                Don't have an account?{' '}
              </Text>
              <Pressable onPress={handleRegister}>
                <Text className="text-black text-base font-semibold">
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
