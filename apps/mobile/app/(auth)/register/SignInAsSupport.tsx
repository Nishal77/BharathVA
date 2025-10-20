import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, Pressable, Text, TextInput, View, useColorScheme, Alert } from 'react-native';
import { runNetworkTests } from '../../../services/api/networkTest';

const { height, width } = Dimensions.get('window');

interface SignInAsSupportProps {
  onGoogleSignIn: () => void;
  onAppleSignIn: () => void;
  onEmailSubmit: (email: string) => void;
  onSignIn: () => void;
}

export default function SignInAsSupport({ 
  onGoogleSignIn, 
  onAppleSignIn, 
  onEmailSubmit, 
  onSignIn 
}: SignInAsSupportProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [email, setEmail] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? 'rgba(255, 255, 255, 0.87)' : '#000000';
  const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.4)' : '#6B7280';
  const borderColor = isDark ? '#FFFFFF0D' : '#E5E7EB';
  const inputBgColor = isDark ? '#151515' : '#F9FAFB';

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      await runNetworkTests();
      Alert.alert(
        '✅ Network Tests Complete',
        'Check the console logs for detailed test results.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        '❌ Network Test Error',
        'Failed to run network tests. Check console for details.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {/* Header Image - 40% Height */}
      <Image
        source={require('../../../assets/images/indiaflag.jpeg')}
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
      
      {/* Theme-based Image Overlay - Dark overlay in light mode, light overlay in dark mode */}
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
      
      {/* Gradient Fade Overlay - Creates smooth fade effect at bottom of image */}
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

      {/* Main Container */}
      <View className="flex-1 justify-center px-6" style={{ marginTop: height * 0.35 }}>
        {/* Header Section */}
        <View className="items-center mb-12">
          <Text 
            className="text-3xl font-bold text-center mb-3"
            style={{ color: textColor }}
          >
            Let's Get You In.
          </Text>
          <Text 
            className="text-base text-center leading-6"
            style={{ color: secondaryTextColor }}
          >
            Every Thought Matters. Every Voice Counts
          </Text>
        </View>
        {/* Sign up with Google */}
        <Pressable
          onPress={onGoogleSignIn}
          className="mb-3"
          style={({ pressed }) => ({
            opacity: pressed ? 0.95 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <View 
            className="rounded-xl px-4 py-3 flex-row items-center justify-center"
            style={{ 
              backgroundColor: inputBgColor,
              borderWidth: 1,
              borderColor: borderColor,
            }}
          >
            {/* Google Logo */}
            <Image
              source={require('../../../assets/logo/Google.png')}
              style={{ width: 20, height: 20, marginRight: 10 }}
              contentFit="contain"
            />
            
            <Text 
              className="text-base font-medium"
              style={{ color: textColor }}
            >
              Sign up with Google
            </Text>
          </View>
        </Pressable>

        {/* Sign up with Apple */}
        <Pressable
          onPress={onAppleSignIn}
          className="mb-3"
          style={({ pressed }) => ({
            opacity: pressed ? 0.95 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <View 
            className="rounded-xl px-4 py-3 flex-row items-center justify-center"
            style={{ 
              backgroundColor: inputBgColor,
              borderWidth: 1,
              borderColor: borderColor,
            }}
          >
            {/* Apple Logo */}
            <Image
              source={require('../../../assets/logo/Apple.png')}
              style={{ width: 20, height: 20, marginRight: 10 }}
              contentFit="contain"
            />
            
            <Text 
              className="text-base font-medium"
              style={{ color: textColor }}
            >
              Sign up with Apple
            </Text>
          </View>
        </Pressable>

        {/* OR Divider */}
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px" style={{ backgroundColor: borderColor }} />
          <Text 
            className="text-xs mx-4 font-medium"
            style={{ color: secondaryTextColor, fontSize: 12 }}
          >
            OR
          </Text>
          <View className="flex-1 h-px" style={{ backgroundColor: borderColor }} />
        </View>

        {/* Email Input Section */}
        <View className="mb-4">
          {/* Email Label */}
          <Text 
            className="text-base font-medium mb-2"
            style={{ color: textColor }}
          >
            Email
          </Text>
          
          {/* Email Input */}
          <View 
            className="rounded-xl px-4 py-3"
            style={{ 
              backgroundColor: inputBgColor,
              borderWidth: 1,
              borderColor: borderColor,
            }}
          >
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={secondaryTextColor}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="text-base"
              style={{ color: textColor }}
              onSubmitEditing={() => {
                if (email.trim()) {
                  onEmailSubmit(email.trim());
                }
              }}
              returnKeyType="next"
            />
          </View>
          
          {/* Next Button */}
          <Pressable
            onPress={() => {
              if (email.trim()) {
                onEmailSubmit(email.trim());
              }
            }}
            disabled={!email.trim()}
            className="rounded-xl py-3 mt-3 bg-white/90"
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text 
              className="text-base font-semibold text-center text-black"
            >
              Next
            </Text>
          </Pressable>
        </View>

        {/* Terms and Privacy */}
        {/* <Text 
          className="text-xs text-center leading-5 mb-8 px-4"
          style={{ color: secondaryTextColor }}
        >
          By signing up, you agree to the{' '}
          <Text className="text-blue-500 font-medium">Terms of Service</Text>
          {' '}and{' '}
          <Text className="text-blue-500 font-medium">Privacy Policy</Text>
          , including{' '}
          <Text className="text-blue-500 font-medium">Cookie Use</Text>
          .
        </Text> */}
        <Text
  className="text-xs text-center leading-5 mb-8 px-4"
  style={{ color: secondaryTextColor }}
>
  By joining <Text className="font-semibold text-blue-500">BharathVa</Text>, you agree to our{' '}
  <Text className="text-blue-500 font-medium">Terms</Text> and{' '}
  <Text className="text-blue-500 font-medium">Privacy Policy</Text>.{' '}
  Your trust and voice are protected under{' '}
  <Text className="text-blue-500 font-medium">Secure Data & Cookie Policy</Text>.
</Text>

        {/* Test Connection Button - Development Only */}
        {__DEV__ && (
          <View className="items-center mb-4">
            <Pressable
              onPress={handleTestConnection}
              disabled={isTestingConnection}
              className="px-4 py-2 rounded-lg border border-blue-500"
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                backgroundColor: isTestingConnection ? '#9CA3AF' : 'transparent',
              })}
            >
              <Text 
                className="text-sm font-medium"
                style={{ color: isTestingConnection ? '#FFFFFF' : '#3B82F6' }}
              >
                {isTestingConnection ? 'Testing...' : '🔍 Test API Connection'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Already have an account */}
        <View className="items-center">
          <View className="flex-row items-center">
            <Text 
              className="text-base font-medium mr-2"
              style={{ color: textColor }}
            >
              Already have an account?
            </Text>
            
            <Pressable
              onPress={onSignIn}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text 
                className="text-base font-semibold"
                style={{ color: '#3B82F6' }}
              >
                Sign in
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
