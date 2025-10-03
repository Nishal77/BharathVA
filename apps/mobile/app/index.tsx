import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, Pressable, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function HeroScreen() {
  const router = useRouter();

  // Load the Aclonica font
  const [fontsLoaded] = useFonts({
    Aclonica: require('../assets/fonts/Aclonica-Regular.ttf'),
  });

  const handleGetStarted = () => {
    router.push('/(auth)/register');
  };

  const handleLogin = () => {
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
    <View className="flex-1 relative bg-white">
      {/* Hero Image - 60% Height from Top */}
      <Image
        source={require('../assets/images/IndiaGate.png')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: width,
          height: height * 0.6,
        }}
        resizeMode="cover"
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
      
      {/* Content Container - White Section */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-8 pt-12 pb-8">
        {/* Main Subtitle */}
        <Text className="text-3xl font-bold text-black text-center mb-4 leading-tight">
          One Nation. Billion Voices. Infinite Possibilities.
        </Text>
        
        {/* Additional Subtitle */}
        <Text className="text-lg text-gray-600 text-center leading-relaxed mb-12">
        Where every Indian voice shapes the nation’s story.        </Text>
      
        {/* Get Started Button */}
        <Pressable
          onPress={handleGetStarted}
          className="bg-black py-4 px-8 rounded-3xl shadow-lg mb-6"
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          })}
        >
          <Text 
            className="text-white text-lg font-semibold text-center"
          >
            Get Started
          </Text>
        </Pressable>
        
        {/* Login Text */}
        <View className="flex-row justify-center items-center">
          <Text className="text-black text-base">Already have an account? </Text>
          <Pressable onPress={handleLogin}>
            <Text className="font-semibold text-blue-600 text-base">Login</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}