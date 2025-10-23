import { Bookmark, Heart, MessageCircle, MoreHorizontal, Share } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, Text, View, useColorScheme } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getUserFeeds, FeedItem } from '../../../../../services/api/feedService';
import { authService } from '../../../../../services/api/authService';
import * as SecureStore from 'expo-secure-store';

export default function Feed() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { userId } = useLocalSearchParams<{ userId: string }>();
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    initializeUser();
  }, [userId]);

  const initializeUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current logged-in user ID from token
      const loggedInUserId = await getCurrentLoggedInUserId();
      console.log('Current logged-in user ID:', loggedInUserId);
      
      if (!loggedInUserId) {
        setError('No authenticated user found. Please login.');
        setLoading(false);
        return;
      }
      
      // Verify that URL userId matches logged-in user ID
      if (userId && userId !== loggedInUserId) {
        console.warn('URL userId does not match logged-in user ID');
        setError('Access denied. You can only view your own profile.');
        setLoading(false);
        return;
      }
      
      setCurrentUserId(loggedInUserId);
      
      // Use the logged-in user ID for fetching data
      await fetchFeeds(loggedInUserId);
      await fetchUserData(loggedInUserId);
      
    } catch (error) {
      console.error('Error initializing user:', error);
      setError('Failed to initialize user data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLoggedInUserId = async (): Promise<string | null> => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        console.log('No access token found');
        return null;
      }
      
      // Decode JWT token to extract user ID
      const payload = decodeJWT(token);
      if (!payload) {
        console.log('Failed to decode JWT token');
        return null;
      }
      
      const userId = payload.userId || payload.sub;
      console.log('Extracted user ID from token:', userId);
      return userId;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  };

  const decodeJWT = (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      return null;
    }
  };

  const fetchUserData = async (authenticatedUserId: string) => {
    try {
      console.log('Fetching user data for authenticated userId:', authenticatedUserId);
      const userProfile = await authService.getUserProfile(authenticatedUserId);
      console.log('User profile received:', userProfile);
      
      if (userProfile && userProfile.fullName) {
        setUserData(userProfile);
      } else {
        console.warn('User profile data incomplete:', userProfile);
        setUserData(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    }
  };

  const fetchFeeds = async (authenticatedUserId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching feeds for authenticated userId:', authenticatedUserId);
      const response = await getUserFeeds(authenticatedUserId, 0, 20);
      console.log('Feed response received:', response);
      
      if (response.success && response.data) {
        const feedItems = response.data.content || [];
        console.log('Setting feeds:', feedItems.length, 'items for user:', authenticatedUserId);
        
        // Double-check that all feeds belong to the authenticated user
        const userFeeds = feedItems.filter(feed => feed.userId === authenticatedUserId);
        console.log('Filtered feeds for authenticated user:', userFeeds.length, 'items');
        
        setFeeds(userFeeds);
      } else {
        console.error('Failed to fetch feeds:', response.error);
        setError(response.error?.message || 'Failed to fetch feeds');
        setFeeds([]);
      }
    } catch (error) {
      console.error('Error fetching feeds:', error);
      setError('An unexpected error occurred while fetching feeds');
      setFeeds([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  const getImageUrl = (imageId: string) => {
    // Use the gateway URL for real images
    return `http://192.168.0.225:8080/api/feed/images/${imageId}`;
  };

  const handleRefresh = () => {
    if (currentUserId) {
      fetchFeeds(currentUserId);
      fetchUserData(currentUserId);
    } else {
      initializeUser();
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: bgColor, paddingBottom: 100 }}>
        <ActivityIndicator size="large" color={textColor} />
        <Text className="mt-4" style={{ color: secondaryTextColor }}>Loading feeds...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: bgColor, paddingBottom: 100 }}>
        <Text className="text-center mb-4" style={{ color: '#EF4444' }}>
          Error: {error}
        </Text>
        <Pressable 
          onPress={handleRefresh}
          className="px-4 py-2 bg-blue-500 rounded-lg"
        >
          <Text className="text-white font-medium">Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (feeds.length === 0) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: bgColor, paddingBottom: 100 }}>
        <Text className="text-center" style={{ color: secondaryTextColor }}>
          No posts yet. Start sharing your thoughts!
        </Text>
        <Pressable 
          onPress={handleRefresh}
          className="mt-4 px-4 py-2 bg-blue-500 rounded-lg"
        >
          <Text className="text-white font-medium">Refresh</Text>
        </Pressable>
      </View>
    );
  }

  console.log('Rendering feeds:', feeds.length, 'feeds');

  return (
    <View style={{ backgroundColor: bgColor, paddingBottom: 100 }}>
      {feeds.map((feed, index) => (
        <View key={feed.id} className="border-b relative" style={{ borderBottomColor: borderColor }}>
          {/* Two Column Layout */}
          <View className="flex-row px-4 py-3">
            {/* Left Column - Profile Picture and Vertical Line */}
            <View className="w-12 items-center pt-0 relative mr-3">
              {/* Profile Picture */}
              <View className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                <Image
                  source={{ 
                    uri: userData?.profilePicture || 
                         'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' 
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              
              {/* Vertical Line - Connecting Main Profile to Top Avatar */}
              <View
                className={`absolute w-px ${isDark ? 'bg-white/20' : 'bg-black/15'}`}
                style={{
                  left: 19, // Centered on the profile images
                  top: 44, // Below the main profile image with small gap (40px height + 8px space)
                  bottom: 40, // Above the top small avatar (20px from bottom + 20px avatar height)
                }}
              />
              
              {/* Three Images in Horizontal Row Formation - Aligned with Stats */}
              {/* Left Image */}
              <View
                className="absolute"
                style={{
                  left: 3, // Leftmost position
                  bottom: 12, // Same spacing as pb-3 (12px) from stats text
                }}
              >
                <View className="w-5 h-5 rounded-full overflow-hidden border-1 border-white">
                  <Image
                    source={{ uri: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}` }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* Center Image */}
              <View
                className="absolute"
                style={{
                  left: 11, // Center position with slight overlap
                  bottom: 12, // Same spacing as pb-3 (12px) from stats text
                }}
              >
                <View className="w-5 h-5 rounded-full overflow-hidden border-1 border-white">
                  <Image
                    source={{ uri: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}` }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* Right Image */}
              <View
                className="absolute"
                style={{
                  left: 19, // Rightmost position with slight overlap
                  bottom: 12, // Same spacing as pb-3 (12px) from stats text
                }}
              >
                <View className="w-5 h-5 rounded-full overflow-hidden border-1 border-white">
                  <Image
                    source={{ uri: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}` }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>

            {/* Right Column - All Content */}
            <View className="flex-1">
              {/* Header Row - Name, @Username, Time, 3 Dots */}
              <View className="flex-row items-center justify-between pr-2">
                <View className="flex-row items-center flex-1">
                  <Text 
                    className="text-base font-bold mr-1"
                    style={{ color: textColor }}
                  >
                    {userData?.fullName || 'User'}
                  </Text>
                  <Text 
                    className="text-sm mr-2"
                    style={{ color: secondaryTextColor }}
                  >
                    @{userData?.username || 'username'}
                  </Text>
                  <Text 
                    className="text-sm"
                    style={{ color: secondaryTextColor }}
                  >
                    · {formatTimeAgo(feed.createdAt)}
                  </Text>
                </View>
                <Pressable className="p-1">
                  <MoreHorizontal size={20} color={secondaryTextColor} />
                </Pressable>
              </View>

              {/* Caption */}
              <View className="mb-3">
                <Text 
                  className="text-base leading-5"
                  style={{ color: textColor }}
                >
                  {feed.message}
                </Text>
              </View>

              {/* Main Image - Display if feed has images */}
              {feed.imageIds && feed.imageIds.length > 0 && (
                <View className="aspect-square rounded-xl overflow-hidden mb-3">
                  <Image
                    source={{ uri: getImageUrl(feed.imageIds[0]) }}
                    className="w-full h-full"
                    resizeMode="cover"
                    onError={(error) => {
                      console.log('Image load error:', error);
                    }}
                  />
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center space-x-4">
                  <Pressable className="p-1">
                    <Heart size={24} color={textColor} strokeWidth={1.5} />
                  </Pressable>
                  <Pressable className="p-1">
                    <MessageCircle size={24} color={textColor} strokeWidth={1.5} />
                  </Pressable>
                  <Pressable className="p-1">
                    <Share size={24} color={textColor} strokeWidth={1.5} />
                  </Pressable>
                </View>
                
                <Pressable className="p-1">
                  <Bookmark size={24} color={textColor} strokeWidth={1.5} />
                </Pressable>
              </View>

              {/* Engagement Stats - Aligned with Bottom of Triangle */}
              <View className="pb-3">
                <View className="flex-row items-end">
                  <Text 
                    className="text-sm mr-4"
                    style={{ color: secondaryTextColor }}
                  >
                    0 replies
                  </Text>
                  <Text 
                    className="text-sm"
                    style={{ color: secondaryTextColor }}
                  >
                    0 likes
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}