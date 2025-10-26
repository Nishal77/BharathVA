import React, { useEffect, useState } from 'react';
import { Image, Text, View, useColorScheme } from 'react-native';
import { getUserFeeds } from '../../../../../services/api/feedService';
import { useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

interface ProfileStatsProps {
  postCount?: number;
  onPostCountChange?: (count: number) => void;
}

export default function ProfileStats({ postCount: externalPostCount, onPostCountChange }: ProfileStatsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { userId } = useLocalSearchParams<{ userId: string }>();
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const numberColor = isDark ? '#F9FAFB' : '#111827';

  const [internalPostCount, setInternalPostCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Use external post count if provided, otherwise use internal state
  const displayPostCount = externalPostCount !== undefined ? externalPostCount : internalPostCount;

  // Fetch post count from API
  const fetchPostCount = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        console.log('No access token found for post count');
        return;
      }

      // Decode JWT to get user ID
      const payload = decodeJWT(token);
      if (!payload) {
        console.log('Failed to decode JWT token for post count');
        return;
      }

      const authenticatedUserId = payload.userId || payload.sub;
      console.log('Fetching post count for user:', authenticatedUserId);

      // Get user feeds to count posts
      const response = await getUserFeeds(authenticatedUserId, 0, 1000); // Get a large number to count all
      if (response.success && response.data) {
        const feedItems = response.data.content || [];
        const userFeeds = feedItems.filter(feed => feed.userId === authenticatedUserId);
        const count = userFeeds.length;
        
        console.log('📊 Fetched post count:', count);
        setInternalPostCount(count);
        
        // Notify parent component if callback provided
        if (onPostCountChange) {
          onPostCountChange(count);
        }
      }
    } catch (error) {
      console.error('Error fetching post count:', error);
    } finally {
      setLoading(false);
    }
  };

  // JWT decode function
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

  // Fetch post count on component mount
  useEffect(() => {
    if (!externalPostCount) {
      fetchPostCount();
    }
  }, [userId]);

  // Update internal count when external count changes
  useEffect(() => {
    if (externalPostCount !== undefined) {
      setInternalPostCount(externalPostCount);
    }
  }, [externalPostCount]);

  return (
    <View className="px-5 pt-1 pb-4 dark:bg-[#000000] bg-white" >
      <View className="flex-row items-center">
        {/* Followers Count with Avatars */}
        <View className="flex-row items-center">
          {/* Avatar Stack */}
          <View className="flex-row items-center mr-2">
            {/* First Avatar (back) */}
            <View 
              className="w-6 h-6 rounded-full overflow-hidden"
            >
              <Image
                source={{ uri: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg` }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            
            {/* Second Avatar (middle) */}
            <View 
              className="w-6 h-6 rounded-full overflow-hidden"
              style={{ 
                marginLeft: -8
              }}
            >
              <Image
                source={{ uri: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg` }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            {/* Third Avatar (front) */}
            <View 
              className="w-6 h-6 rounded-full overflow-hidden"
              style={{ 
                marginLeft: -8
              }}
            >
              <Image
                source={{ uri: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg` }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Followers Text */}
          <Text 
            className="text-base font-bold mr-2 text-black dark:text-[#E5E5E5]"          >
            26
          </Text>
          <Text className="text-base text-gray-500 dark:text-[#71767B]"
          >
            followers
          </Text>
        </View>

        {/* Vertical Separator */}
        <View 
          className="w-px h-6 mx-4 bg-gray-300 dark:bg-white/20"
        />

        {/* Following Count */}
        <View className="flex-row items-center">
          <Text  className="text-base font-bold mr-2 text-black dark:text-[#E5E5E5]"          >
            9
          </Text>
          <Text 
            className="text-base text-gray-500 dark:text-[#71767B]"
          >
            Following
          </Text>
        </View>

        {/* Vertical Separator */}
        <View 
           className="w-px h-6 mx-4 bg-gray-300 dark:bg-white/20"
        />

        {/* Posts Count */}
        <View className="flex-row items-center">
          <Text className="text-base font-bold mr-2 text-black dark:text-[#E5E5E5]">
            {loading ? '---' : displayPostCount}
          </Text>
          <Text 
           className="text-base text-gray-500 dark:text-[#71767B]"
            // style={{ color: labelColor }}
          >
            Posts
          </Text>
        </View>
      </View>
    </View>
  );
}
