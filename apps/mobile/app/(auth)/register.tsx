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

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Load the Aclonica font
  const [fontsLoaded] = useFonts({
    Aclonica: require('../../assets/fonts/Aclonica-Regular.ttf'),
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { fullName, email, phone, password, confirmPassword } = formData;
    
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    if (!agreedToTerms) {
      Alert.alert('Error', 'Please agree to the Terms and Conditions');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.push('/(user)/123/(tabs)') }
      ]);
    }, 2000);
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleBack = () => {
    router.back();
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
    <KeyboardAvoidingView 
      className="flex-1 bg-white" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
          <Pressable
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Text className="text-gray-600 text-lg">←</Text>
          </Pressable>
          <Text className="text-gray-600 text-base">Create Account</Text>
          <View className="w-10" />
        </View>

        {/* Hero Image Section */}
        <View className="relative h-48 mx-6 mb-6">
          <Image
            source={require('../../assets/images/IndiaGate.png')}
            className="w-full h-full rounded-3xl"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/20 rounded-3xl" />
          
          {/* Title Over Image */}
          <View className="absolute inset-0 justify-center items-center">
            <Text 
              className="text-3xl font-extrabold text-white text-center"
              style={{ fontFamily: 'Aclonica' }}
            >
              Join BharathVA
            </Text>
            <Text className="text-white/90 text-center mt-1 text-base">
              Be part of the change
            </Text>
          </View>
        </View>

        {/* Registration Form */}
        <View className="px-6 pb-8">
          {/* Full Name Input */}
          <View className="mb-4">
            <Text className="text-gray-700 text-base font-medium mb-2">Full Name</Text>
            <View className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
              <TextInput
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                className="text-gray-900 text-base"
              />
            </View>
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-gray-700 text-base font-medium mb-2">Email Address</Text>
            <View className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
              <TextInput
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="text-gray-900 text-base"
              />
            </View>
          </View>

          {/* Phone Input */}
          <View className="mb-4">
            <Text className="text-gray-700 text-base font-medium mb-2">Phone Number</Text>
            <View className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
              <TextInput
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="Enter your phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                className="text-gray-900 text-base"
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-gray-700 text-base font-medium mb-2">Password</Text>
            <View className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 flex-row items-center">
              <TextInput
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder="Create a password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                className="text-gray-900 text-base flex-1"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="ml-2"
              >
                <Text className="text-gray-500 text-sm">
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-2">Confirm Password</Text>
            <View className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 flex-row items-center">
              <TextInput
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                className="text-gray-900 text-base flex-1"
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="ml-2"
              >
                <Text className="text-gray-500 text-sm">
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Terms and Conditions */}
          <Pressable 
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            className="flex-row items-start mb-6"
          >
            <View className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 ${
              agreedToTerms ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
            }`}>
              {agreedToTerms && (
                <Text className="text-white text-xs text-center leading-5">✓</Text>
              )}
            </View>
            <Text className="text-gray-600 text-sm flex-1 leading-5">
              I agree to the{' '}
              <Text className="text-blue-600 font-medium">Terms and Conditions</Text>
              {' '}and{' '}
              <Text className="text-blue-600 font-medium">Privacy Policy</Text>
            </Text>
          </Pressable>

          {/* Register Button */}
          <Pressable
            onPress={handleRegister}
            disabled={isLoading}
            className={`py-4 rounded-2xl shadow-lg mb-6 ${
              isLoading ? 'bg-gray-400' : 'bg-black'
            }`}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text 
              className="text-white text-lg font-semibold text-center"
              style={{ fontFamily: 'Aclonica' }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-gray-500 text-sm mx-4">or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Social Register Buttons */}
          <View className="space-y-3">
            <Pressable className="bg-white border border-gray-300 py-4 rounded-2xl flex-row items-center justify-center">
              <Text className="text-gray-700 text-base font-medium ml-2">
                Continue with Google
              </Text>
            </Pressable>
            
            <Pressable className="bg-white border border-gray-300 py-4 rounded-2xl flex-row items-center justify-center">
              <Text className="text-gray-700 text-base font-medium ml-2">
                Continue with Apple
              </Text>
            </Pressable>
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-gray-600 text-base">
              Already have an account?{' '}
            </Text>
            <Pressable onPress={handleLogin}>
              <Text className="text-blue-600 text-base font-semibold">
                Sign In
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
