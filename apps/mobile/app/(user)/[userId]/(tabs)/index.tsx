import { useLocalSearchParams } from 'expo-router';
import {
  Bell,
  MessageCircle,
  Search
} from 'lucide-react-native';
import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  Text,
  View
} from 'react-native';
import { Sidebar } from '../../../../components/ui';
import { useSidebar } from '../../../../contexts/SidebarContext';

const { width, height } = Dimensions.get('window');

// Constants
const ANIMATION_DURATION = 300;

export default function HomeScreen() {
  const { userId } = useLocalSearchParams();
  const { sidebarVisible, setSidebarVisible, sidebarWidth } = useSidebar();
  const slideAnim = useRef(new Animated.Value(-sidebarWidth)).current;

  const handleProfilePress = React.useCallback(() => {
    setSidebarVisible(true);
    
    // Animate sidebar sliding in
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [slideAnim, setSidebarVisible]);

  const handleCloseSidebar = React.useCallback(() => {
    // Animate sidebar sliding out
    Animated.timing(slideAnim, {
      toValue: -sidebarWidth,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setSidebarVisible(false);
    });
  }, [slideAnim, sidebarWidth, setSidebarVisible]);


  return (
    <View className="flex-1 bg-gray-50">
      {/* Main Content Container - No transforms, pure overlay */}
      <View className="flex-1">
        {/* Header with Profile Button and India Image */}
        <View className="pt-12 px-6 border-b border-gray-200 flex-row items-center justify-between">
          {/* Profile Button - Left */}
          <Pressable
            onPress={handleProfilePress}
            className="w-12 h-12 bg-white rounded-full items-center justify-center overflow-hidden"
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
            accessibilityLabel="Open profile menu"
            accessibilityRole="button"
          >
            <View className="w-12 h-12 rounded-full overflow-hidden">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=256&h=256&facepad=2' }}
                className="w-12 h-12"
                resizeMode="cover"
                accessibilityLabel="Profile picture"
              />
            </View>
          </Pressable>

          {/* India Image - Center */}
          <View className="w-20 h-20 rounded-full overflow-hidden justify-center items-center">
            <Image
              source={require('../../../../assets/images/india.png')}
              className="w-16 h-16"
              resizeMode="contain"
              accessibilityLabel="BharathVA logo"
            />
          </View>

          {/* Empty space for balance - Right */}
          <View className="w-12 h-12" />
        </View>

        {/* Main Content Area */}
        <View className="flex-1 p-4 sm:p-6">
          {/* Hero Section */}
          <View className="items-center mb-6 sm:mb-8">
            <Text className="text-2xl sm:text-3xl font-bold text-black text-center mb-3 sm:mb-4 leading-tight px-2">
              One Nation. Billion Voices.
            </Text>
            <Text className="text-base sm:text-lg text-gray-600 text-center leading-relaxed max-w-sm sm:max-w-md px-2">
              Join the conversation that shapes our democracy. Your voice matters in building a better India.
            </Text>
          </View>

          {/* Content Cards */}
          <View className="space-y-3 sm:space-y-4">
            {/* Quick Actions */}
            <View className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
              <Text className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">Quick Actions</Text>
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <View className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                    <MessageCircle size={20} color="#3B82F6" strokeWidth={2} />
                  </View>
                  <Text className="text-xs sm:text-sm font-medium text-gray-700 text-center">Messages</Text>
                </View>
                <View className="items-center flex-1">
                  <View className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                    <Bell size={20} color="#10B981" strokeWidth={2} />
                  </View>
                  <Text className="text-xs sm:text-sm font-medium text-gray-700 text-center">Notifications</Text>
                </View>
                <View className="items-center flex-1">
                  <View className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
                    <Search size={20} color="#8B5CF6" strokeWidth={2} />
                  </View>
                  <Text className="text-xs sm:text-sm font-medium text-gray-700 text-center">Search</Text>
                </View>
              </View>
            </View>

            {/* Recent Activity */}
            <View className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
              <Text className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">Recent Activity</Text>
              <View className="space-y-2 sm:space-y-3">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full mr-2 sm:mr-3" />
                  <View className="flex-1">
                    <Text className="text-xs sm:text-sm font-medium text-gray-900">New discussion started</Text>
                    <Text className="text-xs text-gray-500">2 hours ago</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <View className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full mr-2 sm:mr-3" />
                  <View className="flex-1">
                    <Text className="text-xs sm:text-sm font-medium text-gray-900">Policy update shared</Text>
                    <Text className="text-xs text-gray-500">5 hours ago</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <View className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full mr-2 sm:mr-3" />
                  <View className="flex-1">
                    <Text className="text-xs sm:text-sm font-medium text-gray-900">Community poll created</Text>
                    <Text className="text-xs text-gray-500">1 day ago</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Statistics */}
            <View className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 sm:p-6">
              <Text className="text-white text-lg sm:text-xl font-bold mb-3 sm:mb-4">Your Impact</Text>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-white text-xl sm:text-2xl font-bold">24</Text>
                  <Text className="text-blue-100 text-xs sm:text-sm">Posts</Text>
                </View>
                <View className="items-center">
                  <Text className="text-white text-xl sm:text-2xl font-bold">156</Text>
                  <Text className="text-blue-100 text-xs sm:text-sm">Comments</Text>
                </View>
                <View className="items-center">
                  <Text className="text-white text-xl sm:text-2xl font-bold">8</Text>
                  <Text className="text-blue-100 text-xs sm:text-sm">Votes</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Backdrop when sidebar is open - Above main content, below sidebar */}
      {sidebarVisible && (
        <Pressable
          className="absolute inset-0 bg-black/40"
          style={{
            zIndex: 1000, // Above main content but below sidebar
            elevation: 1000, // For Android
          }}
          onPress={handleCloseSidebar}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar 
        sidebarVisible={sidebarVisible}
        setSidebarVisible={setSidebarVisible}
        sidebarWidth={sidebarWidth}
        slideAnim={slideAnim}
        userId={userId as string}
      />
    </View>
  );
}
