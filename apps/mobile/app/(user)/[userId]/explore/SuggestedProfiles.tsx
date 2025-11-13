import { Image } from 'expo-image';
import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, Text, View, Dimensions, ActivityIndicator } from 'react-native';
import { Svg, Circle, Path } from 'react-native-svg';
import { useFonts } from 'expo-font';
import { useTabStyles } from '../../../../hooks/useTabStyles';
import { followUser, unfollowUser } from '../../../../services/api/followService';
import { getSuggestedUsers, UserProfile } from '../../../../services/api/userService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SuggestedProfile {
  id: string;
  name: string;
  username: string;
  location: string;
  profileImage: string | null; // null indicates use default placeholder
  isOnline?: boolean;
  statusColor?: string;
}

interface SuggestedProfilesProps {
  onProfilePress?: (profile: SuggestedProfile) => void;
}

export default function SuggestedProfiles({ onProfilePress }: SuggestedProfilesProps) {
  const tabStyles = useTabStyles();
  const [followedProfiles, setFollowedProfiles] = useState<Set<string>>(new Set());
  const [loadingProfiles, setLoadingProfiles] = useState<Set<string>>(new Set());
  const [suggestedProfiles, setSuggestedProfiles] = useState<SuggestedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(new Set());

  const [fontsLoaded] = useFonts({
    'Satoshi-Medium': require('../../../../assets/fonts/Satoshi-Medium.otf'),
  });

  const isDark = tabStyles.screen.backgroundColor === '#000000';

  /**
   * Validates profile image URL from Neon DB
   * Returns null if URL is invalid or empty
   */
  const validateProfileImageUrl = useCallback((url: string | null | undefined): string | null => {
    if (!url) return null;
    
    const trimmedUrl = String(url).trim();
    if (!trimmedUrl) return null;
    
    // Must be a valid HTTP/HTTPS URL
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return null;
    }
    
    // Convert HTTP to HTTPS for Cloudinary URLs
    if (trimmedUrl.startsWith('http://res.cloudinary.com')) {
      return trimmedUrl.replace('http://', 'https://');
    }
    
    // Convert other HTTP URLs to HTTPS
    if (trimmedUrl.startsWith('http://')) {
      return trimmedUrl.replace('http://', 'https://');
    }
    
    return trimmedUrl;
  }, []);

  /**
   * Default profile image placeholder component
   * Shows a simple avatar icon when no profile image is available
   */
  const ProfileImagePlaceholder = useCallback(() => {
    const fillColor = isDark ? '#6B7280' : '#9CA3AF';
    
    return (
      <View className="w-full h-full items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }}>
        <Svg width={28} height={28} viewBox="0 0 24 24">
          <Circle cx="12" cy="8" r="4" fill={fillColor} />
          <Path
            d="M12 12c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            fill={fillColor}
          />
        </Svg>
      </View>
    );
  }, [isDark]);

  /**
   * Maps UserProfile from API to SuggestedProfile for UI display
   * Handles missing data gracefully with sensible defaults
   */
  const mapUserProfileToSuggested = useCallback((user: UserProfile): SuggestedProfile => {
    const fullName = user.fullName?.trim() || '';
    const username = user.username?.trim() || '';
    
    const displayName = fullName || username || 'User';
    const displayUsername = username ? `@${username}` : '';
    
    // Validate profile image URL from Neon DB
    const profileImageUrl = validateProfileImageUrl(
      user.profileImageUrl || user.profilePicture
    );
    
    return {
      id: user.id || '',
      name: displayName,
      username: displayUsername,
      location: 'India',
      profileImage: profileImageUrl || null, // null indicates use default placeholder
      isOnline: Math.random() > 0.7,
      statusColor: Math.random() > 0.5 ? '#10B981' : '#FF9933',
    };
  }, [validateProfileImageUrl]);

  const fetchSuggestedUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Always fetch exactly 2 random profiles
      const PROFILE_LIMIT = 2;
      const response = await getSuggestedUsers(PROFILE_LIMIT);
      
      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Map profiles and ensure we only display up to 2 profiles
        const profiles: SuggestedProfile[] = response.data
          .slice(0, PROFILE_LIMIT)
          .map(mapUserProfileToSuggested);
        
        setSuggestedProfiles(profiles);
      } else {
        const errorMessage = response.error?.message || 'No suggested users available';
        setError(errorMessage);
        setSuggestedProfiles([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load suggested users';
      console.error('[SuggestedProfiles] Error fetching suggested users:', err);
      setError(errorMessage);
      setSuggestedProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [mapUserProfileToSuggested]);

  useEffect(() => {
    fetchSuggestedUsers();
  }, [fetchSuggestedUsers]);

  const handleProfilePress = (profile: SuggestedProfile) => {
    onProfilePress?.(profile);
    console.log('Profile pressed:', profile.name);
  };

  const handleFollowPress = async (profileId: string, event: any) => {
    event.stopPropagation();
    
    const isCurrentlyFollowing = followedProfiles.has(profileId);
    
    setLoadingProfiles((prev) => new Set(prev).add(profileId));
    
    try {
      if (isCurrentlyFollowing) {
        const response = await unfollowUser(profileId);
        if (response.success) {
          setFollowedProfiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(profileId);
            return newSet;
          });
        } else {
          console.error('Failed to unfollow user:', response.error);
        }
      } else {
        const response = await followUser(profileId);
        if (response.success) {
          setFollowedProfiles((prev) => {
            const newSet = new Set(prev);
            newSet.add(profileId);
            return newSet;
          });
        } else {
          console.error('Failed to follow user:', response.error);
        }
      }
    } catch (err) {
      console.error('Error in follow/unfollow:', err);
    } finally {
      setLoadingProfiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(profileId);
        return newSet;
      });
    }
  };

  const isFollowing = (profileId: string) => followedProfiles.has(profileId);

  if (loading) {
    return (
      <View className="px-4 py-5" style={{ backgroundColor: tabStyles.screen.backgroundColor }}>
        <View className="mb-5 ml-1">
          <Text 
            className="text-[22px] font-normal leading-7 -tracking-[0.3px] mb-1"
            style={{ color: tabStyles.text.primary, fontFamily: fontsLoaded ? 'Satoshi-Medium' : undefined }}
          >
           Suggested Connections
          </Text>
        </View>
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#000000'} />
        </View>
      </View>
    );
  }

  if (error || suggestedProfiles.length === 0) {
    return (
      <View className="px-4 py-5" style={{ backgroundColor: tabStyles.screen.backgroundColor }}>
        <View className="mb-5 ml-1">
          <Text 
            className="text-[22px] font-normal leading-7 -tracking-[0.3px] mb-1"
            style={{ color: tabStyles.text.primary, fontFamily: fontsLoaded ? 'Satoshi-Medium' : undefined }}
          >
           Suggested Connections
          </Text>
        </View>
        {error && (
          <View className="items-center justify-center py-4">
            <Text className="text-sm" style={{ color: tabStyles.text.secondary }}>
              {error}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="px-4 py-5" style={{ backgroundColor: tabStyles.screen.backgroundColor }}>
      <View className="mb-5 ml-1">
        <Text 
          className="text-[22px] font-normal leading-7 -tracking-[0.3px] mb-1"
          style={{ color: tabStyles.text.primary, fontFamily: fontsLoaded ? 'Satoshi-Medium' : undefined }}
        >
         Suggested Connections
        </Text>
      </View>
      
      {suggestedProfiles.map((profile, index) => {
        const following = isFollowing(profile.id);
        
        return (
        <Pressable
            key={profile.id}
            onPress={() => handleProfilePress(profile)}
            className={`flex-row items-center py-4 px-1 ml-1 ${index < suggestedProfiles.length - 1 ? 'mb-2' : ''}`}
          style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
          })}
        >
            <View className="flex-row items-center flex-1">
              <View className="relative mr-3.5">
                <View 
                  className="w-14 h-14 rounded-full overflow-hidden border"
                style={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  }}
                >
                  {profile.profileImage && !failedImageUrls.has(profile.profileImage) ? (
                    <Image
                      source={{ uri: profile.profileImage }}
                      style={{ width: 56, height: 56 }}
                      contentFit="cover"
                      placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
                      onError={(error) => {
                        // Image failed to load, mark it as failed and show placeholder
                        console.warn('[SuggestedProfiles] Failed to load profile image:', profile.profileImage, error);
                        setFailedImageUrls(prev => new Set(prev).add(profile.profileImage!));
                      }}
                    />
                  ) : (
                    <ProfileImagePlaceholder />
                  )}
                </View>
                {profile.isOnline && profile.statusColor && (
                  <View 
                    className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px]"
                    style={{
                      backgroundColor: profile.statusColor,
                    borderColor: tabStyles.screen.backgroundColor,
                    }} 
                    />
                )}
                  </View>
                  
              <View className="flex-1 pr-3">
                <View className="flex-row items-center mb-1">
                  <Text 
                    className="text-[15px] font-bold -tracking-[0.2px] mr-1.5"
                    style={{ color: tabStyles.text.primary }}
                  >
                    {profile.name}
                  </Text>
                </View>
                <Text 
                  className="text-[13px] font-normal -tracking-[0.1px]"
                  style={{ color: tabStyles.text.secondary }}
                >
                  {profile.username}
                </Text>
              </View>
            </View>
            
            <Pressable
              onPress={(e) => handleFollowPress(profile.id, e)}
              disabled={loadingProfiles.has(profile.id)}
              className={`flex-row items-center justify-center flex-shrink-0 rounded-[22px] px-6 py-2.5 w-[110px] ${
                following 
                  ? (isDark ? 'bg-transparent border border-white' : 'bg-transparent border border-[#E5E5E5]')
                  : (isDark ? 'bg-white' : 'bg-black')
              }`}
              style={({ pressed }) => ({
                opacity: pressed || loadingProfiles.has(profile.id) ? 0.6 : 1,
                paddingHorizontal: Math.max(24, SCREEN_WIDTH * 0.045),
                paddingVertical: Math.max(11, SCREEN_WIDTH * 0.027),
                minWidth: Math.max(125, SCREEN_WIDTH * 0.29),
                backgroundColor: following 
                  ? 'transparent' 
                  : (isDark ? '#FFFFFF' : '#000000'),
                borderWidth: following ? 1.5 : 0,
                borderColor: following 
                  ? (isDark ? '#FFFFFF' : '#000000')
                  : 'transparent',
              })}
            >
              {loadingProfiles.has(profile.id) ? (
                <ActivityIndicator 
                  size="small" 
                  color={following ? (isDark ? '#FFFFFF' : '#000000') : (isDark ? '#000000' : '#FFFFFF')} 
                />
              ) : (
                <Text 
                  className={`text-sm font-semibold tracking-[0.1px] ${
                    following 
                      ? (isDark ? 'text-white' : 'text-black')
                      : (isDark ? 'text-black' : 'text-white')
                  }`}
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                  minimumFontScale={0.85}
                >
                  {following ? 'Connected' : 'Connect'}
                </Text>
              )}
            </Pressable>
          </Pressable>
        );
      })}
      
      <Pressable
        className="mt-5 ml-1 items-center py-2.5"
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text className="text-sm font-semibold tracking-[0.1px] text-blue-500">
          View All
                  </Text>
        </Pressable>
    </View>
  );
}
