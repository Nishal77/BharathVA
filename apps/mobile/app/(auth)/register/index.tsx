import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, useColorScheme, Alert, ActivityIndicator } from 'react-native';
import CreatePassword from './CreatePassword';
import Details from './details';
import OTPVerification from './OTPVerification';
import SignInAsSupport from './SignInAsSupport';
import Username from './Username';
import VideoIntro from './VideoIntro';
import { authService, ApiError } from '../../../services/api/authService';

export default function RegisterMain() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [currentStep, setCurrentStep] = useState('signInAsSupport');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userCountryCode, setUserCountryCode] = useState('+91');
  const [sessionToken, setSessionToken] = useState('');
  const [userDetails, setUserDetails] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';

  const handleGoogleSignIn = () => {
    // Handle Google sign in
    console.log('Google sign in pressed');
    Alert.alert('Coming Soon', 'Google Sign In will be available soon!');
  };

  const handleAppleSignIn = () => {
    // Handle Apple sign in
    console.log('Apple sign in pressed');
    Alert.alert('Coming Soon', 'Apple Sign In will be available soon!');
  };

  const handleEmailSubmit = (email: string) => {
    // Just save email and move to details page (no API call yet)
    console.log('Email entered:', email);
    setUserEmail(email);
    setCurrentStep('details');
  };

  const handleSignIn = () => {
    // Handle sign in
    console.log('Sign in pressed');
  };

  const handleBackToEmail = () => {
    setCurrentStep('signInAsSupport');
  };

  const handleDetailsComplete = async (details: {
    name: string;
    phone: string;
    dateOfBirth: string;
    countryCode: string;
  }) => {
    try {
      setLoading(true);
      console.log('Details completed:', details);
      
      // Store details locally
      setUserPhone(details.phone);
      setUserCountryCode(details.countryCode);
      setUserDetails(details);
      
      // NOW register email with backend (this sends OTP)
      console.log('Registering email with backend:', userEmail);
      const response = await authService.registerEmail(userEmail);
      
      console.log('Email registration response:', response);
      
      // Save session token
      setSessionToken(response.sessionToken!);
      
      // Move to OTP verification step
      setCurrentStep('otp');
      
      Alert.alert(
        'Details Saved! 📧',
        `An OTP has been sent to ${userEmail}. Please check your email inbox.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof ApiError) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    try {
      setLoading(true);
      console.log('Verifying OTP:', otp);
      
      // Verify OTP with backend
      const verifyResponse = await authService.verifyOtp(sessionToken, otp);
      console.log('OTP verification response:', verifyResponse);
      
      // Now submit user details to backend
      console.log('Submitting user details to backend:', userDetails);
      const detailsResponse = await authService.submitDetails(
        sessionToken,
        userDetails.name,
        userDetails.phone,
        userDetails.countryCode,
        userDetails.dateOfBirth
      );
      console.log('Details submission response:', detailsResponse);
      
      // Move to password step
      setCurrentStep('password');
      
      Alert.alert('Success! ✅', 'Email verified and details saved!');
    } catch (error) {
      console.error('OTP verification error:', error);
      
      if (error instanceof ApiError) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePassword = async (password: string, confirmPassword: string) => {
    try {
      setLoading(true);
      console.log('Creating password');
      
      // Call backend API
      const response = await authService.createPassword(
        sessionToken,
        password,
        confirmPassword
      );
      
      console.log('Password creation response:', response);
      
      // Move to username step
      setCurrentStep('username');
      
      Alert.alert('Success', 'Password created successfully!');
    } catch (error) {
      console.error('Password creation error:', error);
      
      if (error instanceof ApiError) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to create password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameComplete = async (username: string) => {
    try {
      setLoading(true);
      console.log('Creating username:', username);
      
      // Call backend API
      const response = await authService.createUsername(sessionToken, username);
      
      console.log('Username creation response:', response);
      
      // Clear session token (no longer needed)
      setSessionToken('');
      
      // Show success message
      Alert.alert(
        'Registration Complete! 🎉',
        `Welcome to BharathVA, @${username}! Check your email for a welcome message.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigate to home page - you can update this with actual user ID from response
              router.push('/(user)/user123/(tabs)');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Username creation error:', error);
      
      if (error instanceof ApiError) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to create username. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSkip = () => {
    // Handle video skip and navigate to home page
    console.log('Video skipped, navigating to home page');
    router.push('/(user)/user123/(tabs)');
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      console.log('Resending OTP');
      
      // Call backend API
      const response = await authService.resendOtp(sessionToken);
      
      console.log('Resend OTP response:', response);
      
      Alert.alert('Success', 'New OTP sent to your email!');
    } catch (error) {
      console.error('Resend OTP error:', error);
      
      if (error instanceof ApiError) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'signInAsSupport':
        return (
          <SignInAsSupport 
            onGoogleSignIn={handleGoogleSignIn}
            onAppleSignIn={handleAppleSignIn}
            onEmailSubmit={handleEmailSubmit}
            onSignIn={handleSignIn}
          />
        );
      case 'details':
        return (
          <Details 
            email={userEmail}
            onBack={handleBackToEmail}
            onComplete={handleDetailsComplete}
          />
        );
      case 'otp':
        return (
          <OTPVerification 
            email={userEmail}
            onBack={() => setCurrentStep('details')}
            onVerify={handleOTPVerify}
            onResend={handleResendOTP}
          />
        );
      case 'password':
        return (
          <CreatePassword 
            onBack={() => setCurrentStep('otp')}
            onCreatePassword={handleCreatePassword}
          />
        );
      case 'username':
        return (
          <Username 
            onBack={() => setCurrentStep('password')}
            onContinue={handleUsernameComplete}
          />
        );
      case 'video':
        return (
          <VideoIntro 
            onSkip={handleVideoSkip}
          />
        );
      default:
        return (
          <SignInAsSupport 
            onGoogleSignIn={handleGoogleSignIn}
            onAppleSignIn={handleAppleSignIn}
            onEmailSubmit={handleEmailSubmit}
            onSignIn={handleSignIn}
          />
        );
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {loading && (
        <View 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}
      {renderCurrentStep()}
    </View>
  );
}
