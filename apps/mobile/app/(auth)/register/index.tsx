import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, useColorScheme } from 'react-native';
import CreatePassword from './CreatePassword';
import Details from './details';
import OTPVerification from './OTPVerification';
import SignInAsSupport from './SignInAsSupport';
import Username from './Username';
import VideoIntro from './VideoIntro';

export default function RegisterMain() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [currentStep, setCurrentStep] = useState('signInAsSupport');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userCountryCode, setUserCountryCode] = useState('+91');
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';

  const handleGoogleSignIn = () => {
    // Handle Google sign in
    console.log('Google sign in pressed');
  };

  const handleAppleSignIn = () => {
    // Handle Apple sign in
    console.log('Apple sign in pressed');
  };

  const handleEmailSubmit = (email: string) => {
    // Handle email submission and navigate to details
    setUserEmail(email);
    setCurrentStep('details');
    console.log('Email submitted:', email);
  };

  const handleSignIn = () => {
    // Handle sign in
    console.log('Sign in pressed');
  };

  const handleBackToEmail = () => {
    setCurrentStep('signInAsSupport');
  };

  const handleDetailsComplete = (details: {
    name: string;
    phone: string;
    dateOfBirth: string;
    countryCode: string;
  }) => {
    // Store phone details and move to OTP step
    setUserPhone(details.phone);
    setUserCountryCode(details.countryCode);
    setCurrentStep('otp');
    console.log('Moving to OTP step:', { email: userEmail, ...details });
  };

  const handleOTPVerify = (otp: string) => {
    // Handle OTP verification and move to password creation
    console.log('OTP verified:', otp);
    setCurrentStep('password');
  };

  const handleCreatePassword = (password: string, confirmPassword: string) => {
    // Handle password creation and move to username selection
    console.log('Password created:', { password, confirmPassword });
    setCurrentStep('username');
  };

  const handleUsernameComplete = (username: string) => {
    // Handle username selection and navigate to home page
    console.log('Username selected:', username);
    console.log('Registration completed! Navigating to home page...');
    // Navigate to home page with a default userId
    router.push('/(user)/user123/(tabs)');
  };

  const handleVideoSkip = () => {
    // Handle video skip and navigate to home page
    console.log('Video skipped, navigating to home page');
    router.push('/(user)/user123/(tabs)');
  };

  const handleResendOTP = () => {
    // Handle OTP resend
    console.log('Resending OTP to:', userCountryCode, userPhone);
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
      {renderCurrentStep()}
    </View>
  );
}
