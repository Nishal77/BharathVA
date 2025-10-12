import { useRouter } from 'expo-router';
import {
  Bookmark,
  Home,
  List,
  LogOut,
  Settings,
  Sun,
  User,
  UserCircle,
  Users
} from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Pressable,
  StatusBar,
  Text,
  View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const { height: windowHeight } = Dimensions.get('window');
const statusBarHeight = StatusBar.currentHeight || 0;
const fullScreenHeight = windowHeight + statusBarHeight;

// Constants
const ANIMATION_DURATION = 300;

// Sidebar menu items configuration
const SIDEBAR_MENU_ITEMS = [
  { id: 'profile', label: 'Profile', icon: UserCircle, color: '#1DA1F2', isActive: true },
  { id: 'lists', label: 'Lists', icon: List, color: '#374151' },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, color: '#374151' },
  { id: 'communities', label: 'Communities', icon: Users, color: '#374151' },
  { id: 'spaces', label: 'Spaces', icon: Home, color: '#374151' },
  { id: 'settings', label: 'Settings & Privacy', icon: Settings, color: '#374151' },
];

interface SidebarProps {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
  sidebarWidth: number;
  slideAnim: Animated.Value;
  userId?: string;
}

export default function Sidebar({
  sidebarVisible,
  setSidebarVisible,
  sidebarWidth,
  slideAnim,
  userId
}: SidebarProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Add pulse animation when sidebar becomes visible
  useEffect(() => {
    if (sidebarVisible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      ).start();
    }
  }, [sidebarVisible, pulseAnim]);

  const handleCloseSidebar = React.useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -sidebarWidth,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setSidebarVisible(false);
    });
  }, [slideAnim, sidebarWidth, setSidebarVisible]);

  const handleSidebarAction = React.useCallback((action: string) => {
    handleCloseSidebar();
    
    // Add navigation logic here
    switch (action) {
      case 'profile':
        // Navigate to profile
        break;
      case 'lists':
        // Navigate to lists
        break;
      case 'bookmarks':
        // Navigate to bookmarks
        break;
      case 'communities':
        // Navigate to communities
        break;
      case 'spaces':
        // Navigate to spaces
        break;
      case 'settings':
        // Navigate to settings & privacy
        break;
      case 'logout':
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Logout',
              style: 'destructive',
              onPress: async () => {
                console.log('🚪 User confirmed logout');
                await logout();
              },
            },
          ]
        );
        break;
    }
  }, [handleCloseSidebar, router, logout]);

  if (!sidebarVisible) {
    return null;
  }

  return (
    <Animated.View 
      style={{
        transform: [{ translateX: slideAnim }],
        width: sidebarWidth,
        height: fullScreenHeight,
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 999999, // Maximum z-index to appear above everything
        backgroundColor: '#FFFFFF', // Solid white background
        shadowColor: '#000',
        shadowOffset: { width: 8, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 32,
        elevation: 999999, // Maximum elevation for Android
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
        borderRightWidth: 1,
        borderRightColor: 'rgba(0, 0, 0, 0.05)',
      }}
    >
      <View className="flex-1 bg-white">
        {/* Sidebar Header */}
        <View 
          className="pb-4 px-4 border-b border-gray-100 bg-white"
          style={{
            paddingTop: statusBarHeight + 40, // Status bar + much more top padding for visibility
          }}
        >
          <View className="flex-row items-center justify-between mb-4" style={{ marginTop: 16 }}>
            <View className="flex-row items-center">
              <Animated.View 
                className="w-12 h-12 rounded-full items-center justify-center mr-3 bg-gray-200"
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <User size={20} color="#6B7280" strokeWidth={2} />
              </Animated.View>
              <View>
                <Text className="text-lg font-semibold text-gray-900" style={{ marginTop: 8 }}>
                  {userId ? `User ${userId}` : 'User'}
                </Text>
                <Text className="text-gray-500 text-xs" style={{ marginTop: 4 }}>
                  @bharathva_user
                </Text>
              </View>
            </View>
            <Pressable
              onPress={handleCloseSidebar}
              className="w-8 h-8 rounded-full items-center justify-center bg-gray-100"
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.9 : 1 }],
              })}
            >
              <Text className="text-gray-600 text-lg font-bold">×</Text>
            </Pressable>
          </View>
          
          {/* Stats */}
          <View className="flex-row justify-between rounded-2xl p-3 bg-gray-50">
            <View className="items-center flex-1">
              <Text className="text-lg font-bold text-gray-900">156</Text>
              <Text className="text-gray-500 text-xs">Following</Text>
            </View>
            <View className="w-px bg-gray-300 mx-2" />
            <View className="items-center flex-1">
              <Text className="text-lg font-bold text-gray-900">2.4K</Text>
              <Text className="text-gray-500 text-xs">Followers</Text>
            </View>
            <View className="w-px bg-gray-300 mx-2" />
            <View className="items-center flex-1">
              <Text className="text-lg font-bold text-gray-900">89</Text>
              <Text className="text-gray-500 text-xs">Posts</Text>
            </View>
          </View>
        </View>

        {/* Navigation Menu - Takes remaining space */}
        <View className="flex-1 px-4 py-8">
          <View className="space-y-2">
            {SIDEBAR_MENU_ITEMS.map((item) => {
              const IconComponent = item.icon;
              return (
                <Pressable 
                  key={item.id}
                  onPress={() => handleSidebarAction(item.id)}
                  className="flex-row items-center py-4 px-4 rounded-xl"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <View className="w-10 h-10 rounded-xl items-center justify-center mr-4 bg-gray-100">
                    <IconComponent 
                      size={20} 
                      color="#6B7280" 
                      strokeWidth={2} 
                    />
                  </View>
                  <Text className="font-semibold text-base text-gray-800 flex-1">
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Bottom Section - Fixed at Bottom */}
        <View 
          className="px-4 border-t border-gray-200 bg-white"
          style={{
            paddingTop: 20,
            paddingBottom: 20, // Better padding for bottom section
          }}
        >
          {/* Dark/Light Mode Toggle and Logout */}
          <View className="flex-row items-center space-x-2 mb-4">
            {/* Dark/Light Mode Toggle */}
            <Pressable 
              className="flex-1 flex-row items-center justify-center py-4 px-4 rounded-xl bg-gray-100"
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Sun size={20} color="#374151" strokeWidth={2} />
              <Text className="text-gray-700 font-semibold text-sm ml-2">Light</Text>
            </Pressable>

            {/* Logout Button */}
            <Pressable 
              onPress={() => handleSidebarAction('logout')}
              className="flex-1 flex-row items-center justify-center py-4 px-4 rounded-xl bg-red-50"
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <LogOut size={20} color="#DC2626" strokeWidth={2} />
              <Text className="text-red-700 font-semibold text-sm ml-2">
                Logout
              </Text>
            </Pressable>
          </View>
          
          {/* App Version */}
          <View className="items-center">
            <View className="rounded-full px-3 py-2 bg-gray-100">
              <Text className="text-gray-600 text-xs">
                BharathVA v1.0.0
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
