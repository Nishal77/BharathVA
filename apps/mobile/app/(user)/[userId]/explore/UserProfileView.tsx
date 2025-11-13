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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTabStyles } from '../../../../hooks/useTabStyles';
import { getUserProfileById, UserProfile } from '../../../../services/api/userService';
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
  
  const fetchingRef = useRef(false);
  const lastFetchedUserIdRef = useRef<string>('');

  const fetchProfile = useCallback(async (targetUserId: string) => {
    if (fetchingRef.current) {
      console.log('Skipping fetch - already fetching:', targetUserId);
      return;
    }
    
    if (lastFetchedUserIdRef.current === targetUserId) {
      console.log('Skipping fetch - already fetched this userId:', targetUserId);
      return;
    }
    
    fetchingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching profile for userId:', targetUserId);
      const response = await getUserProfileById(targetUserId);
      if (response.success && response.data) {
        setProfile(response.data);
        lastFetchedUserIdRef.current = targetUserId;
        console.log('Profile fetched successfully:', response.data.username);
      } else {
        setError(response.error?.message || 'Failed to load profile');
        console.error('Failed to fetch profile:', response.error);
        lastFetchedUserIdRef.current = '';
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading the profile';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
      lastFetchedUserIdRef.current = '';
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

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
    
    fetchProfile(userId);
    
    return () => {
      fetchingRef.current = false;
    };
  }, [userId, fetchProfile]);

  const handleBack = () => {
    router.back();
  };

  const handleConnectPress = () => {
    if (isFollowing) {
      setShowDropdown(!showDropdown);
    } else {
      setIsFollowing(true);
      setShowDropdown(false);
    }
  };

  const handleUnfollow = () => {
    setIsFollowing(false);
    setShowDropdown(false);
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

  if (loading) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text} />
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
              <View style={styles.connectButtonWrapper}>
            <Pressable
                  onPress={handleConnectPress}
              style={[
                    styles.connectButton,
                {
                      backgroundColor: isFollowing ? colors.connectedButtonBg : colors.buttonBg,
                },
              ]}
            >
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
});

