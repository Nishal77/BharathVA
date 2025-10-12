import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Image, Pressable, Text, View, useColorScheme } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function HeroScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isAuthenticated, user } = useAuth();

  // Load the Aclonica font
  const [fontsLoaded] = useFonts({
    Aclonica: require('../assets/fonts/Aclonica-Regular.ttf'),
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ User already authenticated - redirecting to home');
      router.replace(`/(user)/${user.userId}/(tabs)`);
    }
  }, [isAuthenticated, user]);

  const handleGetStarted = () => {
    router.push('/(auth)/register');
  };

  const handleLogin = () => {
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
    <View className={`flex-1 relative ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Hero Image - 60% Height from Top */}
      <Image
        source={require('../assets/images/india.jpeg')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: width,
          height: height * 0.6,
        }}
        resizeMode="cover"
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
          top: height * 0.15,
          left: 0,
          width: width,
          height: height * 0.45,
        }}
      />
      
      {/* Main Title - Over Image */}
      <View className="absolute top-20 left-0 right-0 items-center px-8">
        <Text 
          className="text-xl font-extrabold text-black text-center leading-tight"
          style={{ fontFamily: 'Aclonica' }}
        >
          BharathVA
        </Text>
      </View>
      
      {/* Content Container - Theme-based Section */}
      <View 
        className={`absolute bottom-0 left-0 right-0 ${isDark ? 'bg-black' : 'bg-white'} px-8 pt-12`}
        style={{
          paddingBottom: height < 700 ? 48 : height < 800 ? 56 : 64,
        }}
      >
        {/* Main Subtitle */}
        <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'} text-center mb-4 leading-tight`}>
          One Nation. Billion Voices. Infinite Possibilities.
        </Text>
        
        {/* Additional Subtitle */}
        <Text className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} text-center leading-relaxed mb-12`}>
        Where every Indian voice shapes the nation's story.        </Text>
      
        {/* Get Started Button */}
        <Pressable
          onPress={handleGetStarted}
          className={`${isDark ? 'bg-white' : 'bg-black'} py-4 px-8 rounded-3xl shadow-lg mb-6`}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            shadowColor: isDark ? '#fff' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.2,
            shadowRadius: isDark ? 6 : 4,
            elevation: isDark ? 6 : 4,
          })}
        >
          <Text 
            className={`${isDark ? 'text-black' : 'text-white'} text-lg font-semibold text-center`}
          >
            Get Started
          </Text>
        </Pressable>
        
        {/* Login Text */}
        <View className="flex-row justify-center items-center">
          <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-base`}>Already have an account? </Text>
          <Pressable onPress={handleLogin}>
            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'} text-base`}>Login</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}