import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive calculations based on device dimensions
const isSmallDevice = height < 700;
const isLargeDevice = height > 800;

// Dynamic sizing based on device
const imageHeight = isSmallDevice ? 0.45 : isLargeDevice ? 0.5 : 0.48;
const overlayHeight = imageHeight;
const gradientStart = imageHeight - 0.15;
const contentMarginTop = isSmallDevice ? 0.30 : isLargeDevice ? 0.40 : 0.35;

interface UsernameProps {
  onBack: () => void;
  onContinue: (username: string) => void;
}

export default function Username({ 
  onBack, 
  onContinue 
}: UsernameProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  
  // Animation values for smooth transition
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Theme colors
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const lineColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';

  // Username suggestions
  const suggestions = [
    'explorer', 'wanderer', 'dreamer'
  ];

  const isFormValid = username.length >= 3;

  const handleUsernameChange = (text: string) => {
    // Remove @ symbol if user types it, and allow only alphanumeric and underscore
    const cleanText = text.replace('@', '').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    setUsername(cleanText);
    
    // Simulate availability check
    if (cleanText.length >= 3) {
      setIsAvailable(true); // In real app, check with API
    } else {
      setIsAvailable(null);
    }
  };

  const handleContinue = async () => {
    if (!isFormValid) return;
    
    setIsLoading(true);
    
    // Smooth exit animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      try {
        await onContinue(username);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const selectSuggestion = (suggestion: string) => {
    const randomNum = Math.floor(Math.random() * 9999);
    setUsername(`${suggestion}${randomNum}`);
    setIsAvailable(true);
  };

  return (
    <Animated.View 
      className="flex-1" 
      style={{ 
        backgroundColor: bgColor,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {/* Header Image - Responsive Height */}
      <Image
        source={require('../../../assets/images/MehrangarhFort.jpeg')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: height * imageHeight,
          width: '100%',
        }}
        resizeMode="cover"
      />
      
      {/* Enhanced Gradient Overlay for Better Readability */}
      <LinearGradient
        colors={isDark 
          ? ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)']
          : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.5)']
        }
        locations={[0, 0.5, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: height * overlayHeight,
        }}
      />
      
      {/* Gradient Fade Overlay - Responsive positioning */}
      <LinearGradient
        colors={isDark 
          ? ['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.95)', 'rgba(0,0,0,1)']
          : ['rgba(255,255,255,0)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.75)', 'rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']
        }
        locations={[0, 0.15, 0.3, 0.5, 0.7, 0.88, 1]}
        style={{
          position: 'absolute',
          top: height * gradientStart,
          left: 0,
          width: width,
          height: height * 0.15,
        }}
      />

      {/* Back Button */}
      <View className="flex-row items-center px-6 pt-12 pb-4 mt-4">
        <Pressable
          onPress={onBack}
          className="p-2 rounded-full"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <Image
            source={require('../../../assets/logo/arrow.png')}
            style={{
              width: 20,
              height: 20,
              tintColor: '#FFFFFF',
            }}
            contentFit="contain"
          />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Bottom Section - All Content - Responsive */}
          <View 
            className="px-6 pb-8" 
            style={{ 
              marginTop: height * contentMarginTop,
            }}
          >
            {/* Header Text - Enhanced Hierarchy */}
            <View className="items-center mb-8">
              <Text 
                className={`${isSmallDevice ? 'text-2xl' : isLargeDevice ? 'text-3xl' : 'text-3xl'} font-black text-center mb-4`}
                style={{ color: textColor }}
              >
                Choose Your Username
              </Text>
              <Text 
                className={`${isSmallDevice ? 'text-sm' : 'text-base'} text-center leading-6 px-4 font-medium`}
                style={{ color: secondaryTextColor }}
              >
                This will be your unique identity on the platform
              </Text>
              
              {/* India Brand Accent Line */}
              <View className="flex-row items-center mt-4">
                <View className="w-8 h-1 bg-orange-500 rounded-full mr-2" />
                <View className="w-8 h-1 bg-white rounded-full mr-2" />
                <View className="w-8 h-1 bg-green-500 rounded-full" />
              </View>
            </View>

            {/* Username Input with @ symbol - Responsive */}
            <View className="mb-6">
              <View className="flex-row items-center">
                <Text 
                  className={`${isSmallDevice ? 'text-lg' : 'text-xl'} font-semibold mr-2`}
                  style={{ color: textColor }}
                >
                  @
                </Text>
                <View className="flex-1">
                  <TextInput
                    value={username}
                    onChangeText={handleUsernameChange}
                    placeholder="username"
                    placeholderTextColor={secondaryTextColor}
                    autoCapitalize="none"
                    autoCorrect={false}
                    className={`${isSmallDevice ? 'text-lg' : 'text-xl'} font-medium pb-2`}
                    style={{
                      color: textColor,
                      borderBottomWidth: 1,
                      borderBottomColor: isAvailable === true 
                        ? '#10B981' 
                        : isAvailable === false 
                          ? '#EF4444' 
                          : lineColor,
                    }}
                  />
                </View>
              </View>
              
              {/* Enhanced Availability Indicator with Micro-interactions */}
              {username.length >= 3 && isAvailable === true && (
                <View className="flex-row items-center mt-3">
                  <View className="w-5 h-5 bg-green-500 rounded-full items-center justify-center mr-2">
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                  <Text 
                    className="text-sm font-semibold"
                    style={{ color: '#10B981' }}
                  >
                    Username is available
                  </Text>
                </View>
              )}
              {username.length > 0 && username.length < 3 && (
                <View className="flex-row items-center mt-3">
                  <View className="w-5 h-5 bg-red-500 rounded-full items-center justify-center mr-2">
                    <Text className="text-white text-xs font-bold">!</Text>
                  </View>
                  <Text 
                    className="text-sm font-semibold"
                    style={{ color: '#EF4444' }}
                  >
                    Username must be at least 3 characters
                  </Text>
                </View>
              )}
              {username.length >= 3 && isAvailable === false && (
                <View className="flex-row items-center mt-3">
                  <View className="w-5 h-5 bg-red-500 rounded-full items-center justify-center mr-2">
                    <Text className="text-white text-xs font-bold">✗</Text>
                  </View>
                  <Text 
                    className="text-sm font-semibold"
                    style={{ color: '#EF4444' }}
                  >
                    Username is already taken
                  </Text>
                </View>
              )}
            </View>

            {/* Suggestions */}
            <View className="mb-8">
              <Text 
                className={`${isSmallDevice ? 'text-xs' : 'text-sm'} font-medium mb-3`}
                style={{ color: secondaryTextColor }}
              >
                Suggestions for you:
              </Text>
              <View className="flex-row gap-3">
                {suggestions.map((suggestion, index) => (
                  <Pressable
                    key={index}
                    onPress={() => selectSuggestion(suggestion)}
                    className="py-2"
                  >
                    <Text 
                      className="text-sm font-medium"
                      style={{ color: '#3B82F6' }}
                    >
                      @{suggestion}{Math.floor(Math.random() * 9999)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Enhanced Continue Button with Brand Gradient */}
            <Pressable
              onPress={handleContinue}
              disabled={!isFormValid || isLoading}
              className={`rounded-xl ${isSmallDevice ? 'py-4' : 'py-5'} mb-6 shadow-lg`}
              style={{
                backgroundColor: isFormValid && !isLoading 
                  ? (isDark ? '#FFFFFF' : '#000000') 
                  : '#9CA3AF',
                opacity: (!isFormValid || isLoading) ? 0.5 : 1,
                shadowColor: isFormValid && !isLoading ? '#000000' : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center justify-center">
                <Text 
                  className={`${isSmallDevice ? 'text-sm' : 'text-base'} font-bold text-center mr-2`}
                  style={{ 
                    color: isFormValid && !isLoading 
                      ? (isDark ? '#000000' : '#FFFFFF') 
                      : '#FFFFFF' 
                  }}
                >
                  {isLoading ? 'Checking...' : 'Continue'}
                </Text>
                {isFormValid && !isLoading && (
                  <View className="w-6 h-6 bg-orange-500 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">→</Text>
                  </View>
                )}
              </View>
            </Pressable>

            {/* Info Text */}
            <Text 
              className="text-sm text-center leading-5"
              style={{ color: secondaryTextColor }}
            >
              You can change your username anytime from your profile settings.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

