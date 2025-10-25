import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View, useColorScheme, RefreshControl, ScrollView } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { getUserFeeds, FeedItem, deletePost } from '../../../../../services/api/feedService';
import { authService } from '../../../../../services/api/authService';
import { webSocketService, FeedEvent } from '../../../../../services/api/websocketService';
import FeedItemComponent from '../../../../../components/feed/FeedItem';
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
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [postCount, setPostCount] = useState<number>(0);

  // Setup WebSocket connection for real-time feed updates
  const setupWebSocketConnection = useCallback(() => {
    webSocketService.connect({
      onFeedCreated: (event: FeedEvent) => {
        if (currentUserId && event.userId === currentUserId) {
          fetchFeeds(currentUserId);
          setPostCount(prevCount => prevCount + 1);
        }
      },
      
      onFeedDeleted: (event: FeedEvent) => {
        if (event.feedId) {
          setFeeds(prevFeeds => prevFeeds.filter(feed => feed.id !== event.feedId));
          setPostCount(prevCount => Math.max(0, prevCount - 1));
        }
      },
      
      onFeedUpdated: (event: FeedEvent) => {
        if (currentUserId && event.userId === currentUserId) {
          fetchFeeds(currentUserId);
        }
      },
      
      onConnectionEstablished: () => {},
      onConnectionClosed: () => {},
      onError: (error: any) => {
        console.error('WebSocket error:', error);
      }
    });
  }, [currentUserId]);

  useEffect(() => {
    initializeUser();
    
    // Setup WebSocket connection for real-time updates
    setupWebSocketConnection();
    
    // Cleanup WebSocket connection on unmount
    return () => {
      webSocketService.disconnect();
    };
  }, [userId, setupWebSocketConnection]);

  // Auto-refresh feed when profile tab is focused
  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        const timeoutId = setTimeout(() => {
          fetchFeeds(currentUserId);
          fetchUserData(currentUserId);
          
          if (!webSocketService.isWebSocketConnected()) {
            setupWebSocketConnection();
          }
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }, [currentUserId, setupWebSocketConnection])
  );


  const initializeUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const loggedInUserId = await getCurrentLoggedInUserId();
      
      if (!loggedInUserId) {
        setError('No authenticated user found. Please login.');
        setLoading(false);
        return;
      }
      
      if (userId && userId !== loggedInUserId) {
        setError('Access denied. You can only view your own profile.');
        setLoading(false);
        return;
      }
      
      setCurrentUserId(loggedInUserId);
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
      if (!token) return null;
      
      const payload = decodeJWT(token);
      if (!payload) return null;
      
      return payload.userId || payload.sub;
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
      const userProfile = await authService.getUserProfile(authenticatedUserId);
      
      if (userProfile && userProfile.fullName) {
        setUserData(userProfile);
      } else {
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
      
      const response = await getUserFeeds(authenticatedUserId, 0, 20);
      
      if (response.success && response.data) {
        const feedItems = response.data.content || [];
        const userFeeds = feedItems.filter(feed => feed.userId === authenticatedUserId);
        
        setFeeds(userFeeds);
        setPostCount(userFeeds.length);
      } else {
        setError(response.error?.message || 'Failed to fetch feeds');
        setFeeds([]);
        setPostCount(0);
      }
    } catch (error) {
      console.error('Error fetching feeds:', error);
      setError('An unexpected error occurred while fetching feeds');
      setFeeds([]);
      setPostCount(0);
    } finally {
      setLoading(false);
    }
  };


  const handleRefresh = async () => {
    if (currentUserId) {
      setRefreshing(true);
      try {
        await Promise.all([
          fetchFeeds(currentUserId),
          fetchUserData(currentUserId)
        ]);
      } finally {
        setRefreshing(false);
      }
    } else {
      initializeUser();
    }
  };

  const onRefresh = useCallback(() => {
    handleRefresh();
  }, [currentUserId]);

  // Handle post deletion
  const handleDeletePost = async (feedId: string) => {
    try {
      console.log('🗑️ Deleting post:', feedId);
      
      const response = await deletePost(feedId);
      
      if (response.success) {
        console.log('✅ Post deleted successfully from database');
        
        // Update local state immediately for better UX
        setFeeds(prevFeeds => prevFeeds.filter(feed => feed.id !== feedId));
        setPostCount(prevCount => Math.max(0, prevCount - 1));
        
        // Show success message
        Alert.alert('Success', 'Post deleted successfully!');
      } else {
        console.error('❌ Failed to delete post:', response.error);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to delete post. Please try again.';
        
        if (response.error?.code === 'HTTP_401') {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.error?.code === 'HTTP_403') {
          errorMessage = 'You are not authorized to delete this post.';
        } else if (response.error?.code === 'HTTP_404') {
          errorMessage = 'Post not found. It may have already been deleted.';
          // If post was not found, remove it from local state anyway
          setFeeds(prevFeeds => prevFeeds.filter(feed => feed.id !== feedId));
          setPostCount(prevCount => Math.max(0, prevCount - 1));
        } else if (response.error?.code === 'HTTP_500') {
          errorMessage = 'Server error. Please try again later.';
        } else if (response.error?.message) {
          errorMessage = response.error.message;
        }
        
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('❌ Unexpected error deleting post:', error);
      Alert.alert('Error', 'An unexpected error occurred while deleting the post. Please check your internet connection and try again.');
    }
  };

  // Handle post editing
  const handleEditPost = (feed: FeedItem) => {
    Alert.alert('Edit Post', 'Edit functionality will be implemented soon!');
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
      <ScrollView 
        style={{ backgroundColor: bgColor, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={textColor}
            colors={[textColor]}
          />
        }
        contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text className="text-center mb-4" style={{ color: '#EF4444' }}>
          Error: {error}
        </Text>
        <Pressable 
          onPress={handleRefresh}
          className="px-4 py-2 bg-blue-500 rounded-lg"
        >
          <Text className="text-white font-medium">Retry</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (feeds.length === 0) {
    return (
      <ScrollView 
        style={{ backgroundColor: bgColor, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={textColor}
            colors={[textColor]}
          />
        }
        contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text className="text-center" style={{ color: secondaryTextColor }}>
          No posts yet. Start sharing your thoughts!
        </Text>
        <Pressable 
          onPress={handleRefresh}
          className="mt-4 px-4 py-2 bg-blue-500 rounded-lg"
        >
          <Text className="text-white font-medium">Refresh</Text>
        </Pressable>
      </ScrollView>
    );
  }


  return (
    <ScrollView 
      style={{ backgroundColor: bgColor, paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={textColor}
          colors={[textColor]}
        />
      }
    >
      {feeds.map((feed, index) => (
        <FeedItemComponent
          key={feed.id}
          feed={feed}
          userData={userData}
          onImageError={() => {}}
          onDeletePost={handleDeletePost}
          onEditPost={handleEditPost}
        />
      ))}
    </ScrollView>
  );
}