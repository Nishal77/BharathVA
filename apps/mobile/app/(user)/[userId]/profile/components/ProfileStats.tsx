import React, { useEffect, useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { Image, Text, View, useColorScheme } from 'react-native';
import { getUserFeeds } from '../../../../../services/api/feedService';
import { getUserProfileById } from '../../../../../services/api/userService';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import webSocketService, { NotificationEvent, FeedEvent } from '../../../../../services/api/websocketService';
import { tokenManager } from '../../../../../services/api/authService';

interface ProfileStatsProps {
  postCount?: number;
  followersCount?: number;
  followingCount?: number;
  onPostCountChange?: (count: number) => void;
  onRefreshRequested?: () => void;
}

export interface ProfileStatsRef {
  refresh: () => Promise<void>;
  silentRefresh: () => Promise<void>;
  isAutoRefreshing: () => boolean;
}

const ProfileStats = forwardRef<ProfileStatsRef, ProfileStatsProps>(({ 
  postCount: externalPostCount, 
  followersCount: externalFollowersCount,
  followingCount: externalFollowingCount,
  onPostCountChange,
  onRefreshRequested
}, ref) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { userId } = useLocalSearchParams<{ userId: string }>();
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const numberColor = isDark ? '#F9FAFB' : '#111827';

  const [internalPostCount, setInternalPostCount] = useState<number>(0);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefreshing, setAutoRefreshing] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);
  
  const fetchingRef = useRef(false);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPeriodicRefreshRef = useRef<boolean>(false);

  // Use external counts if provided, otherwise use internal state
  const displayPostCount = externalPostCount !== undefined ? externalPostCount : internalPostCount;
  const displayFollowersCount = externalFollowersCount !== undefined ? externalFollowersCount : followersCount;
  const displayFollowingCount = externalFollowingCount !== undefined ? externalFollowingCount : followingCount;

  // Get current authenticated user ID
  const getCurrentUserId = useCallback(async () => {
    try {
      const userIdFromToken = await tokenManager.getUserIdFromToken();
      setCurrentUserId(userIdFromToken);
      
      if (userIdFromToken && userId) {
        const normalizeId = (id: string | null | undefined): string | null => {
          if (!id) return null;
          return id.replace(/-/g, '').toLowerCase();
        };
        
        const normalizedRouteUserId = normalizeId(userId);
        const normalizedLoggedInUserId = normalizeId(userIdFromToken);
        const isOwn = normalizedRouteUserId === normalizedLoggedInUserId;
        setIsOwnProfile(isOwn);
        
        console.log('📊 [ProfileStats] Profile ownership check:', {
          routeUserId: userId,
          loggedInUserId: userIdFromToken,
          isOwnProfile: isOwn
        });
      }
      
      return userIdFromToken;
    } catch (error) {
      console.warn('⚠️ [ProfileStats] Failed to get current user ID:', error);
      setCurrentUserId(null);
      setIsOwnProfile(false);
      return null;
    }
  }, [userId]);

  // Fetch user stats from API
  const fetchUserStats = useCallback(async (targetUserId?: string, isAutoRefresh: boolean = false, isPeriodic: boolean = false) => {
    // Allow auto-refresh even if already fetching (for background updates)
    if (fetchingRef.current && !isAutoRefresh) {
      console.log('⏭️ [ProfileStats] Skipping fetch - already fetching');
      return;
    }

    try {
      fetchingRef.current = true;
      isPeriodicRefreshRef.current = isPeriodic;
      
      // Only show main loading on initial load, not on auto-refresh or silent refresh
      if (!isAutoRefresh) {
        setLoading(true);
      } else if (isPeriodic) {
        // Only show auto-refresh indicator for periodic refreshes, not tab focus
        setAutoRefreshing(true);
      }
      // Tab focus refresh: isAutoRefresh=true but isPeriodic=false - completely silent
      
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        console.log('⚠️ [ProfileStats] No access token found');
        return;
      }

      // Get authenticated user ID
      const authenticatedUserId = await getCurrentUserId();
      if (!authenticatedUserId) {
        console.warn('⚠️ [ProfileStats] No authenticated user ID found');
        return;
      }

      // Determine which user ID to fetch
      // If targetUserId is provided, use it (for viewing other profiles)
      // Otherwise, use the route userId if it exists, or fall back to authenticatedUserId
      let userIdToFetch: string;
      
      if (targetUserId) {
        userIdToFetch = targetUserId;
      } else if (userId) {
        userIdToFetch = userId;
      } else {
        userIdToFetch = authenticatedUserId;
      }
      
      console.log('📊 [ProfileStats] Fetching stats for user:', userIdToFetch, isAutoRefresh ? '(auto-refresh)' : '(manual)');

      // Fetch user profile to get follower/following counts
      const profileResponse = await getUserProfileById(userIdToFetch);
      
      // Handle authentication errors - these should trigger token refresh automatically
      if (!profileResponse.success) {
        const errorCode = profileResponse.error?.code;
        
        // Auth errors (401/403) are handled by apiCall with token refresh
        // If still failing after refresh, log and continue (don't break the UI)
        if (errorCode === 'HTTP_401' || errorCode === 'HTTP_403') {
          console.warn('⚠️ [ProfileStats] Auth error after token refresh attempt:', errorCode);
          // Don't throw - allow UI to continue with existing data
          return;
        }
        
        // User not found - log but don't break UI
        if (errorCode === 'USER_NOT_FOUND') {
          console.warn('⚠️ [ProfileStats] User not found:', userIdToFetch);
          return;
        }
        
        // Other errors - log and continue
        console.warn('⚠️ [ProfileStats] Failed to fetch profile:', profileResponse.error?.message);
        return;
      }
      
      if (profileResponse.success && profileResponse.data) {
        const profile = profileResponse.data;
        const newFollowersCount = profile.followersCount || 0;
        const newFollowingCount = profile.followingCount || 0;
        
        console.log('📊 [ProfileStats] Updated counts:', {
          followers: newFollowersCount,
          following: newFollowingCount,
          posts: profile.postsCount
        });
        
        setFollowersCount(newFollowersCount);
        setFollowingCount(newFollowingCount);
        
        // Store NeonDB count temporarily, but MongoDB count will override it
        const neonDbPostCount = profile.postsCount;
        if (neonDbPostCount !== undefined) {
          console.log('📊 [ProfileStats] NeonDB post count:', neonDbPostCount);
        }
      }

      // CRITICAL: Always fetch actual post count from MongoDB (source of truth)
      // MongoDB has the real posts, NeonDB only has a cached count that may be out of sync
      if (externalPostCount === undefined) {
        try {
          console.log('📊 [ProfileStats] Fetching actual post count from MongoDB...');
          const response = await getUserFeeds(userIdToFetch, 0, 1000);
          
          // Handle auth errors gracefully
          if (!response.success) {
            const errorCode = response.error?.code;
            if (errorCode === 'HTTP_401' || errorCode === 'HTTP_403') {
              console.warn('⚠️ [ProfileStats] Auth error fetching feeds:', errorCode);
              // Fallback to NeonDB count if MongoDB fetch fails
              if (profileResponse.success && profileResponse.data && profileResponse.data.postsCount !== undefined) {
                setInternalPostCount(profileResponse.data.postsCount);
                if (onPostCountChange) {
                  onPostCountChange(profileResponse.data.postsCount);
                }
              }
              return;
            }
            console.warn('⚠️ [ProfileStats] Failed to fetch feeds:', response.error?.message);
            // Fallback to NeonDB count if MongoDB fetch fails
            if (profileResponse.success && profileResponse.data && profileResponse.data.postsCount !== undefined) {
              setInternalPostCount(profileResponse.data.postsCount);
              if (onPostCountChange) {
                onPostCountChange(profileResponse.data.postsCount);
              }
            }
            return;
          }
          
          if (response.success && response.data) {
            const feedItems = response.data.content || [];
            const userFeeds = feedItems.filter(feed => feed.userId === userIdToFetch);
            const mongoDbPostCount = userFeeds.length;
            
            console.log('📊 [ProfileStats] MongoDB post count (source of truth):', mongoDbPostCount);
            
            // Use MongoDB count as the authoritative source
            setInternalPostCount(mongoDbPostCount);
            
            if (onPostCountChange) {
              onPostCountChange(mongoDbPostCount);
            }
            
            // Log if there's a mismatch with NeonDB count (for debugging)
            if (profileResponse.success && profileResponse.data && profileResponse.data.postsCount !== undefined) {
              const neonDbCount = profileResponse.data.postsCount;
              if (neonDbCount !== mongoDbPostCount) {
                console.warn(`⚠️ [ProfileStats] Post count mismatch detected! MongoDB: ${mongoDbPostCount}, NeonDB: ${neonDbCount}`);
                console.warn('   Using MongoDB count as source of truth. NeonDB count will be synced automatically.');
              }
            }
          }
        } catch (feedError) {
          // Handle feed fetch errors gracefully
          console.warn('⚠️ [ProfileStats] Error fetching feeds:', feedError);
          // Fallback to NeonDB count if MongoDB fetch fails
          if (profileResponse.success && profileResponse.data && profileResponse.data.postsCount !== undefined) {
            setInternalPostCount(profileResponse.data.postsCount);
            if (onPostCountChange) {
              onPostCountChange(profileResponse.data.postsCount);
            }
          }
        }
      }
    } catch (error) {
      // Catch any unexpected errors and log them without breaking the UI
      console.error('❌ [ProfileStats] Unexpected error fetching stats:', error);
      // Don't re-throw - allow UI to continue with existing data
    } finally {
      setLoading(false);
      // Only clear auto-refreshing if it was a periodic refresh
      if (isPeriodicRefreshRef.current) {
        setAutoRefreshing(false);
      }
      fetchingRef.current = false;
      isPeriodicRefreshRef.current = false;
    }
  }, [externalPostCount, onPostCountChange, getCurrentUserId, userId]);

  // Setup WebSocket listeners for real-time updates
  useEffect(() => {
    if (!currentUserId || !userId) return;

    const handleFollowNotification = (event: NotificationEvent) => {
      // Handle both FOLLOW and UNFOLLOW notifications
      if ((event.notificationType === 'FOLLOW' || event.notificationType === 'UNFOLLOW') && event.recipientUserId === userId) {
        const isFollow = event.notificationType === 'FOLLOW';
        console.log(`📥 [ProfileStats] Real-time ${isFollow ? 'follow' : 'unfollow'} notification received, updating follower count`);
        
        setFollowersCount((prevCount) => {
          const newCount = isFollow 
            ? Math.max(0, (prevCount || 0) + 1)
            : Math.max(0, (prevCount || 0) - 1);
          console.log(`🔄 [ProfileStats] Updating follower count: ${prevCount} → ${newCount}`);
          return newCount;
        });
        
        // Refresh from API after a short delay to ensure accuracy
        // Silent refresh - no loading indicators
        setTimeout(() => {
          fetchUserStats(undefined, true, false);
        }, 1000);
      }
    };

    const handleFeedCreated = (event: FeedEvent) => {
      if (event.userId === userId) {
        console.log('📥 [ProfileStats] Real-time feed created, updating post count');
        
        setInternalPostCount((prevCount) => {
          const newCount = (prevCount || 0) + 1;
          console.log(`🔄 [ProfileStats] Updating post count: ${prevCount} → ${newCount}`);
          
          if (onPostCountChange) {
            onPostCountChange(newCount);
          }
          
          return newCount;
        });
      }
    };

    const handleFeedDeleted = (event: FeedEvent) => {
      if (event.userId === userId) {
        console.log('📥 [ProfileStats] Real-time feed deleted, updating post count');
        
        setInternalPostCount((prevCount) => {
          const newCount = Math.max(0, (prevCount || 0) - 1);
          console.log(`🔄 [ProfileStats] Updating post count: ${prevCount} → ${newCount}`);
          
          if (onPostCountChange) {
            onPostCountChange(newCount);
          }
          
          return newCount;
        });
      }
    };

    // Connect to WebSocket with callbacks
    webSocketService.connect({
      onNotificationCreated: handleFollowNotification,
      onFeedCreated: handleFeedCreated,
      onFeedDeleted: handleFeedDeleted,
      onConnectionEstablished: () => {
        console.log('✅ [ProfileStats] WebSocket connected');
      },
      onConnectionClosed: () => {
        console.log('⚠️ [ProfileStats] WebSocket disconnected');
      },
      onError: (error) => {
        console.error('❌ [ProfileStats] WebSocket error:', error);
      }
    });

    // Cleanup is handled by WebSocket service singleton
    return () => {
      // Note: We don't disconnect as WebSocket is shared across components
    };
  }, [currentUserId, userId, fetchUserStats, onPostCountChange]);

  // Expose refresh methods via ref
  useImperativeHandle(ref, () => ({
    refresh: async () => {
      if (!fetchingRef.current) {
        console.log('🔄 [ProfileStats] Manual refresh triggered');
        // Force refresh by passing undefined to use the current userId from route
        // isAutoRefresh=false means it will show loading state
        await fetchUserStats(undefined, false, false);
      }
    },
    silentRefresh: async () => {
      if (!fetchingRef.current) {
        // Silent refresh - no loading indicators, happens in background
        await fetchUserStats(undefined, true, false);
      }
    },
    isAutoRefreshing: () => autoRefreshing
  }), [fetchUserStats, autoRefreshing]);

  // Auto-refresh stats periodically for all profiles
  useEffect(() => {
    if (!userId) return;

    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up periodic refresh every 10 seconds for all profiles
    // More frequent for own profile (5s), less frequent for others (10s)
    const refreshInterval = isOwnProfile ? 5000 : 10000;
    
    refreshIntervalRef.current = setInterval(async () => {
      if (!fetchingRef.current && userId) {
        console.log(`🔄 [ProfileStats] Auto-refreshing stats (${isOwnProfile ? 'own' : 'other'} profile)...`);
        // Pass undefined to use current userId from route, true for isAutoRefresh, true for isPeriodic
        await fetchUserStats(undefined, true, true);
      }
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [userId, isOwnProfile, fetchUserStats]);

  // Silent background refresh when profile tab is focused
  // This happens automatically - user won't feel it (no loading indicators)
  useFocusEffect(
    useCallback(() => {
      if (userId && !fetchingRef.current) {
        // Silent refresh - no loading states, happens in background
        // isAutoRefresh=true but isPeriodic=false means completely silent
        const timeoutId = setTimeout(async () => {
          await fetchUserStats(undefined, true, false);
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }, [userId, fetchUserStats])
  );

  // Initialize user ID and fetch stats on mount
  useEffect(() => {
    const initialize = async () => {
      await getCurrentUserId();
      await fetchUserStats(userId || undefined);
    };
    
    initialize();
  }, [userId, getCurrentUserId, fetchUserStats]);

  // Update internal counts when external counts change
  useEffect(() => {
    if (externalPostCount !== undefined) {
      setInternalPostCount(externalPostCount);
    }
    if (externalFollowersCount !== undefined) {
      setFollowersCount(externalFollowersCount);
    }
    if (externalFollowingCount !== undefined) {
      setFollowingCount(externalFollowingCount);
    }
  }, [externalPostCount, externalFollowersCount, externalFollowingCount]);

  return (
    <View className="px-5 pt-1 pb-4 dark:bg-[#000000] bg-white">
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
                source={{ uri: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&q=80' }}
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
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' }}
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
                source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Followers Text */}
          <Text 
            className="text-base font-bold mr-2 text-black dark:text-[#E5E5E5]"          >
            {loading ? '---' : displayFollowersCount}
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
            {loading ? '---' : displayFollowingCount}
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
});

ProfileStats.displayName = 'ProfileStats';

export default ProfileStats;
