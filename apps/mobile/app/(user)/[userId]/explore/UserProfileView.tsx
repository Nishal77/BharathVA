import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTabStyles } from '../../../../hooks/useTabStyles';
import { getUserProfileById, UserProfile } from '../../../../services/api/userService';
import { followUser, unfollowUser, getFollowStatus } from '../../../../services/api/followService';
import { tokenManager } from '../../../../services/api/authService';
import webSocketService, { NotificationEvent } from '../../../../services/api/websocketService';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import ProfileTabs from './components/ProfileTabs';

const { width } = Dimensions.get('window');

const SettingsIcon = ({ color = '#1c1f21', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 18 18">
    <Line x1="13.25" y1="5.25" x2="16.25" y2="5.25" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <Line x1="1.75" y1="5.25" x2="8.75" y2="5.25" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <Circle cx="11" cy="5.25" r="2.25" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <Line x1="4.75" y1="12.75" x2="1.75" y2="12.75" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <Line x1="16.25" y1="12.75" x2="9.25" y2="12.75" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <Circle cx="7" cy="12.75" r="2.25" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </Svg>
);

const SendIcon = ({ color = '#1c1f21', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 18 18">
    <Line x1="15.813" y1="2.187" x2="7.657" y2="10.343" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <Path d="M15.947,2.73l-4.154,12.923c-.142,.443-.743,.509-.977,.106l-3.159-5.416L2.241,7.184c-.402-.235-.337-.835,.106-.977L15.27,2.053c.417-.134,.811,.26,.677,.677Z" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </Svg>
);

interface UserProfileViewProps {
  userId?: string;
}

export default function UserProfileView({ userId: propUserId }: UserProfileViewProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string; profileUserId?: string; [key: string]: any }>();
  
  const userId = useMemo(() => {
    if (propUserId) return propUserId;
    const profileUserId = params.profileUserId;
    const routeUserId = params.userId;
    
    if (profileUserId) {
      if (typeof profileUserId === 'string' && profileUserId !== '[userId]') return profileUserId;
      if (Array.isArray(profileUserId) && profileUserId[0] && profileUserId[0] !== '[userId]') return profileUserId[0];
    }
    
    if (routeUserId) {
      if (typeof routeUserId === 'string' && routeUserId !== '[userId]') return routeUserId;
      if (Array.isArray(routeUserId) && routeUserId[0] && routeUserId[0] !== '[userId]') return routeUserId[0];
    }
    
    return '';
  }, [propUserId, params.profileUserId, params.userId]);
  
  const tabStyles = useTabStyles();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('Feed');
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchingRef = useRef(false);
  const lastFetchedUserIdRef = useRef<string>('');

  const fetchProfile = useCallback(async (targetUserId: string, isRefresh: boolean = false) => {
    if (fetchingRef.current && !isRefresh) {
      console.log('Skipping fetch - already fetching:', targetUserId);
      return;
    }
    
    if (lastFetchedUserIdRef.current === targetUserId && !isRefresh) {
      console.log('Skipping fetch - already fetched this userId:', targetUserId);
      return;
    }
    
    fetchingRef.current = true;
    
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);
      console.log('Fetching profile for userId:', targetUserId, isRefresh ? '(refresh)' : '(initial)');
      const response = await getUserProfileById(targetUserId);
      if (response.success && response.data) {
        setProfile(response.data);
        lastFetchedUserIdRef.current = targetUserId;
        console.log('Profile fetched successfully:', response.data.username);
        
        try {
          const followStatusResponse = await getFollowStatus(targetUserId);
          if (followStatusResponse.success && followStatusResponse.data) {
            setIsFollowing(followStatusResponse.data.isFollowing);
          } else {
            setIsFollowing((response.data as any).isFollowing || false);
          }
        } catch (followError) {
          console.warn('Failed to fetch follow status, using profile data:', followError);
          setIsFollowing((response.data as any).isFollowing || false);
        }
      } else {
        setError(response.error?.message || 'Failed to load profile');
        console.error('Failed to fetch profile:', response.error);
        if (!isRefresh) {
          lastFetchedUserIdRef.current = '';
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading the profile';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
      if (!isRefresh) {
        lastFetchedUserIdRef.current = '';
      }
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const userIdFromToken = await tokenManager.getUserIdFromToken();
        setCurrentUserId(userIdFromToken);
        if (userIdFromToken && userId && userIdFromToken === userId) {
          setIsOwnProfile(true);
        } else {
          setIsOwnProfile(false);
        }
      } catch (error) {
        console.warn('Failed to get current user ID:', error);
        setCurrentUserId(null);
        setIsOwnProfile(false);
      }
    };
    
    getCurrentUserId();
  }, [userId]);

  useEffect(() => {
    console.log('UserProfileView effect - userId:', userId, 'propUserId:', propUserId, 'profileUserId:', params.profileUserId);
    
    if (!userId || userId.trim() === '' || userId === '[userId]') {
      console.warn('UserProfileView - Invalid userId, showing error');
      setError('User ID is required');
      setLoading(false);
      lastFetchedUserIdRef.current = '';
      fetchingRef.current = false;
      setProfile(null);
      return;
    }
    
    if (lastFetchedUserIdRef.current !== userId) {
      lastFetchedUserIdRef.current = '';
      fetchingRef.current = false;
      setProfile(null);
    }
    
    fetchProfile(userId, false);
    
    return () => {
      fetchingRef.current = false;
    };
  }, [userId, fetchProfile]);

  const onRefresh = useCallback(async () => {
    if (!userId || refreshing || fetchingRef.current) {
      return;
    }
    
    console.log('Pull-to-refresh triggered for userId:', userId);
    setRefreshing(true);
    
    try {
      // Reset the last fetched userId to force a fresh fetch
      lastFetchedUserIdRef.current = '';
      
      // Fetch fresh profile data
      await fetchProfile(userId, true);
      
      // Also refresh follow status
      try {
        const followStatusResponse = await getFollowStatus(userId);
        if (followStatusResponse.success && followStatusResponse.data) {
          setIsFollowing(followStatusResponse.data.isFollowing);
        }
      } catch (followError) {
        console.warn('Failed to refresh follow status during pull-to-refresh:', followError);
      }
      
      console.log('Pull-to-refresh completed successfully');
    } catch (error) {
      console.error('Error refreshing profile during pull-to-refresh:', error);
      setError('Failed to refresh profile. Please try again.');
    } finally {
      // Ensure refreshing state is cleared
      setRefreshing(false);
    }
  }, [userId, fetchProfile, refreshing]);

  // Auto-refresh when screen comes into focus (when visiting profile)
  useFocusEffect(
    useCallback(() => {
      if (userId && !fetchingRef.current) {
        console.log('UserProfileView focused - refreshing profile for userId:', userId);
        // Small delay to ensure smooth transition
        const timeoutId = setTimeout(async () => {
          await fetchProfile(userId, true);
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }, [userId, fetchProfile])
  );

  useEffect(() => {
    if (!isOwnProfile || !userId) return;

    const handleFollowNotification = (event: NotificationEvent) => {
      if (event.notificationType === 'FOLLOW' && event.recipientUserId === userId && profile) {
        console.log('📥 Real-time follow notification received, updating follower count');
        
        setProfile((prevProfile) => {
          if (!prevProfile) return prevProfile;
          
          const currentCount = prevProfile.followersCount || 0;
          const newCount = Math.max(0, currentCount + 1);
          
          console.log(`🔄 Updating follower count: ${currentCount} → ${newCount}`);
          
          return {
            ...prevProfile,
            followersCount: newCount,
          };
        });
        
        setTimeout(async () => {
          try {
            const refreshResponse = await getUserProfileById(userId);
            if (refreshResponse.success && refreshResponse.data) {
              setProfile(refreshResponse.data);
            }
          } catch (error) {
            console.warn('Failed to refresh profile after follow notification:', error);
          }
        }, 1000);
      }
    };

    const handleUnfollowNotification = (event: NotificationEvent) => {
      if (event.notificationType === 'UNFOLLOW' && event.recipientUserId === userId && profile) {
        console.log('📥 Real-time unfollow notification received, updating follower count');
        
        setProfile((prevProfile) => {
          if (!prevProfile) return prevProfile;
          
          const currentCount = prevProfile.followersCount || 0;
          const newCount = Math.max(0, currentCount - 1);
          
          console.log(`🔄 Updating follower count: ${currentCount} → ${newCount}`);
          
          return {
            ...prevProfile,
            followersCount: newCount,
          };
        });
        
        setTimeout(async () => {
          try {
            const refreshResponse = await getUserProfileById(userId);
            if (refreshResponse.success && refreshResponse.data) {
              setProfile(refreshResponse.data);
            }
          } catch (error) {
            console.warn('Failed to refresh profile after unfollow notification:', error);
          }
        }, 1000);
      }
    };

    webSocketService.connect({
      onNotificationCreated: handleFollowNotification,
    });

    const refreshInterval = setInterval(async () => {
      if (isOwnProfile && userId && !fetchingRef.current) {
        try {
          const refreshResponse = await getUserProfileById(userId);
          if (refreshResponse.success && refreshResponse.data) {
            setProfile((prevProfile) => {
              if (!prevProfile) return refreshResponse.data!;
              
              return {
                ...prevProfile,
                followersCount: refreshResponse.data!.followersCount,
                followingCount: refreshResponse.data!.followingCount,
                postsCount: refreshResponse.data!.postsCount,
              };
            });
          }
        } catch (error) {
          console.warn('Periodic profile refresh failed:', error);
        }
      }
    }, 5000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [isOwnProfile, userId, profile]);

  const handleBack = () => {
    router.back();
  };

  const handleConnectPress = async () => {
    if (!userId || !profile) return;
    
    if (isOwnProfile) {
      console.warn('Cannot follow yourself - skipping follow action');
      return;
    }
    
    if (isFollowing) {
      setShowDropdown(!showDropdown);
    } else {
      setIsFollowLoading(true);
      
      const previousFollowersCount = profile.followersCount || 0;
      
      try {
        const response = await followUser(userId);
        if (response.success && response.data) {
          setIsFollowing(true);
          setShowDropdown(false);
          
          if (response.data && profile) {
            const updatedProfile = { ...profile };
            
            if (response.data.followingFollowersCount !== undefined) {
              updatedProfile.followersCount = response.data.followingFollowersCount;
            }
            
            setProfile(updatedProfile);
            
            setTimeout(async () => {
              try {
                const refreshResponse = await getUserProfileById(userId);
                if (refreshResponse.success && refreshResponse.data) {
                  setProfile(refreshResponse.data);
                  
                  const followStatusResponse = await getFollowStatus(userId);
                  if (followStatusResponse.success && followStatusResponse.data) {
                    setIsFollowing(followStatusResponse.data.isFollowing);
                  }
                }
              } catch (refreshError) {
                console.warn('Failed to refresh profile after follow:', refreshError);
              }
            }, 300);
          }
        } else {
          if (response.error?.message === 'Cannot follow yourself') {
            console.warn('Attempted to follow yourself - this should not happen');
            setIsOwnProfile(true);
          } else {
            console.error('Failed to follow user:', response.error);
            setProfile({
              ...profile,
              followersCount: previousFollowersCount,
            });
          }
        }
      } catch (err) {
        console.error('Error following user:', err);
        setProfile({
          ...profile,
          followersCount: previousFollowersCount,
        });
      } finally {
        setIsFollowLoading(false);
      }
    }
  };

  const handleUnfollow = async () => {
    if (!userId || !profile) return;
    
    setIsFollowLoading(true);
    
    const previousFollowersCount = profile.followersCount || 0;
    
    try {
      const response = await unfollowUser(userId);
      if (response.success && response.data) {
        setIsFollowing(false);
        setShowDropdown(false);
        
        if (response.data && profile) {
          const updatedProfile = { ...profile };
          
          if (response.data.followingFollowersCount !== undefined) {
            updatedProfile.followersCount = response.data.followingFollowersCount;
          }
          
          setProfile(updatedProfile);
          
          setTimeout(async () => {
            try {
              const refreshResponse = await getUserProfileById(userId);
              if (refreshResponse.success && refreshResponse.data) {
                setProfile(refreshResponse.data);
                
                const followStatusResponse = await getFollowStatus(userId);
                if (followStatusResponse.success && followStatusResponse.data) {
                  setIsFollowing(followStatusResponse.data.isFollowing);
                }
              }
            } catch (refreshError) {
              console.warn('Failed to refresh profile after unfollow:', refreshError);
            }
          }, 300);
        }
      } else {
        console.error('Failed to unfollow user:', response.error);
        setProfile({
          ...profile,
          followersCount: previousFollowersCount,
        });
      }
    } catch (err) {
      console.error('Error unfollowing user:', err);
      setProfile({
        ...profile,
        followersCount: previousFollowersCount,
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const formatNumber = (num?: number): string => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    return trimmed.length > 0 && (trimmed.startsWith('http://') || trimmed.startsWith('https://'));
  };

  const normalizeImageUrl = (url: string | null | undefined): string | null => {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.startsWith('http://res.cloudinary.com')) {
      return trimmed.replace('http://', 'https://');
    }
    if (trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return trimmed.replace('http://', 'https://');
    }
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return trimmed;
    }
    return null;
  };

  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    buttonBg: isDark ? '#1F2937' : '#000000',
    buttonText: isDark ? '#FFFFFF' : '#FFFFFF',
    connectedButtonBg: isDark ? '#374151' : '#E5E7EB',
    connectedButtonText: isDark ? '#FFFFFF' : '#000000',
    followingButton: isDark ? '#FFFFFF' : '#000000',
    followingButtonText: isDark ? '#000000' : '#FFFFFF',
    sendButtonBg: isDark ? '#1F2937' : '#000000',
    sendButtonBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    headerBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  };

  const displayUsername = profile?.username ? `@${profile.username}` : profile?.fullName || 'Loading...';

  if (loading && !profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
              {displayUsername}
            </Text>
          </View>
          <Pressable style={styles.iconButton}>
            <SettingsIcon color={colors.text} size={18} />
          </Pressable>
        </View>
        <View style={styles.refreshLoaderContainer}>
          <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#000000'} />
        </View>
      </View>
    );
  }

  if (error || !profile) {
    const errorDisplayName = profile?.username ? `@${profile.username}` : profile?.fullName || 'User';
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
              {errorDisplayName}
            </Text>
          </View>
          <Pressable style={styles.iconButton}>
            <SettingsIcon color={colors.text} size={18} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error || 'Profile not found'}</Text>
          <Pressable onPress={() => userId && fetchProfile(userId)} style={[styles.retryButton, { backgroundColor: colors.buttonBg }]}>
            <Text style={[styles.retryButtonText, { color: colors.text }]}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const profileImageUrl = normalizeImageUrl(profile.profileImageUrl || profile.profilePicture);
  const hasValidImage = isValidImageUrl(profileImageUrl);

  const headerUsername = profile?.username ? `@${profile.username}` : profile?.fullName || 'User';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
            {headerUsername}
          </Text>
        </View>
        <Pressable style={styles.iconButton}>
          <SettingsIcon color={colors.text} size={18} />
        </Pressable>
      </View>
      
      {(loading || refreshing) && (
        <View style={[
          styles.refreshLoaderContainer, 
          { 
            backgroundColor: colors.background,
          }
        ]}>
          <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#000000'} />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            tintColor="transparent"
            colors={[]}
            progressBackgroundColor="transparent"
          />
        }
        scrollEnabled={true}
        bounces={true}
      >
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {hasValidImage ? (
                <Image 
                  source={{ uri: profileImageUrl! }} 
                  style={[
                    styles.avatar, 
                    { 
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                    }
                  ]} 
                  resizeMode="cover" 
                />
            ) : (
                <View style={[
                  styles.avatar, 
                  { 
                    backgroundColor: isDark ? '#374151' : '#D1D5DB',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                  }
                ]}>
                  <Svg width={80} height={80} viewBox="0 0 24 24">
                  <Circle cx="12" cy="8" r="4" fill={isDark ? '#6B7280' : '#9CA3AF'} />
                  <Path
                    d="M12 12c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    fill={isDark ? '#6B7280' : '#9CA3AF'}
                  />
                </Svg>
              </View>
            )}
          </View>

            <View style={styles.actionButtonsContainer}>
              {!isOwnProfile && (
                <View style={styles.connectButtonWrapper}>
                  <Pressable
                    onPress={handleConnectPress}
                    disabled={isFollowLoading}
                    style={[
                      styles.connectButton,
                      {
                        backgroundColor: isFollowing ? colors.connectedButtonBg : colors.buttonBg,
                        opacity: isFollowLoading ? 0.6 : 1,
                      },
                    ]}
                  >
                    {isFollowLoading ? (
                      <ActivityIndicator size="small" color={isFollowing ? colors.connectedButtonText : colors.buttonText} />
                    ) : (
                      <Text
                        style={[
                          styles.connectButtonText,
                          {
                            color: isFollowing ? colors.connectedButtonText : colors.buttonText,
                          },
                        ]}
                      >
                        {isFollowing ? 'Connected' : 'Connect'}
                      </Text>
                    )}
                  </Pressable>
                  {showDropdown && (
                    <View style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <Pressable
                        onPress={handleUnfollow}
                        style={styles.dropdownItem}
                      >
                        <Text style={[styles.dropdownText, { color: colors.text }]}>Unfollow</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
              <Pressable
                style={[
                  styles.sendButton,
                  {
                    borderColor: colors.sendButtonBorder,
                    backgroundColor: colors.sendButtonBg,
                  },
                ]}
              >
                <SendIcon color={colors.buttonText} size={16} />
              </Pressable>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.fullName, { color: colors.text }]}>
              {profile.fullName || profile.username || 'User'}
            </Text>

            <View style={styles.usernameRow}>
              <Text style={[styles.username, { color: colors.textSecondary }]}>
                @{profile.username || 'username'}
              </Text>
              {(profile as any).location ? (
                <>
                  <Text style={[styles.separator, { color: colors.textSecondary }]}> · </Text>
                  <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.location, { color: colors.textSecondary }]}>
                    {(profile as any).location}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.separator, { color: colors.textSecondary }]}> · </Text>
                  <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.location, { color: colors.textSecondary }]}>
                    India
                  </Text>
                </>
              )}
            </View>

            {profile.bio && (
              <Text style={[styles.bio, { color: colors.text }]}>{profile.bio}</Text>
            )}

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statText, { color: colors.text }]}>
                  <Text style={[styles.statNumber, { color: colors.text }]}>
                    {formatNumber(profile.followersCount || 0)}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}> Followers</Text>
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statText, { color: colors.text }]}>
                  <Text style={[styles.statNumber, { color: colors.text }]}>
                    {formatNumber(profile.followingCount || 0)}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}> Following</Text>
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statText, { color: colors.text }]}>
                  <Text style={[styles.statNumber, { color: colors.text }]}>
                    {formatNumber(profile.postsCount || 0)}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}> Posts</Text>
                </Text>
              </View>
            </View>

            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateContent}>
                <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                  No {activeTab === 'Feed' ? 'Posts' : activeTab} Yet
                </Text>
                <Text style={[styles.emptyStateMessage, { color: colors.textSecondary }]}>
                  {activeTab === 'Feed' 
                    ? 'When this user shares posts, they will appear here.'
                    : activeTab === 'Media'
                    ? 'No media posts to display yet.'
                    : activeTab === 'Video'
                    ? 'No videos to display yet.'
                    : 'No replies to display yet.'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 60,
    paddingBottom: 12,
    minHeight: 56,
  },
  iconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1D5DB',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    alignItems: 'flex-start',
  },
  fullName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  username: {
    fontSize: 15,
    fontWeight: '400',
  },
  separator: {
    fontSize: 15,
    fontWeight: '400',
    marginHorizontal: 4,
  },
  location: {
    fontSize: 15,
    fontWeight: '400',
    marginLeft: 4,
  },
  bio: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 24,
    letterSpacing: -0.2,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: '400',
  },
  statDivider: {
    width: 1,
    height: 18,
    marginHorizontal: 16,
    alignSelf: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  connectButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    minWidth: 95,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  connectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  connectButtonWrapper: {
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '500',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyStateContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
    paddingHorizontal: 24,
  },
  emptyStateContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyStateMessage: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 32,
    letterSpacing: -0.2,
  },
  refreshLoaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

