import React, { useEffect, useState, useCallback } from 'react';
import { Image, Pressable, Text, View, useColorScheme, ActivityIndicator } from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';
import { useRouter, useFocusEffect } from 'expo-router';
import { profileService } from '../../../../../services/api/profileService';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function ProfileInfo() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState<boolean>(false);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  
  const borderColor = isDark ? '#374151' : '#D1D5DB';
  const buttonBg = isDark ? '#FFFFFF' : '#111827';
  const buttonText = isDark ? '#000000' : '#FFFFFF';

  const loadProfileImage = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!user) {
        setProfileImageUrl(null);
        setIsLoading(false);
        return;
      }
      
      const profile = await profileService.getCurrentUserProfile();
      const imageUrl = (profile as any)?.profileImageUrl || (profile as any)?.profile_image_url;
      
      // Validate URL before setting
      if (imageUrl && typeof imageUrl === 'string') {
        const trimmedUrl = imageUrl.trim();
        
        // Skip if this URL has already failed
        if (failedUrls.has(trimmedUrl)) {
          console.warn('⚠️ Skipping URL that previously failed to load:', trimmedUrl);
          setProfileImageUrl(null);
          setImageError(true);
          setIsLoading(false);
          return;
        }
        
        // Check if it's a valid URL
        if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
          // Convert http to https for security (especially for Cloudinary)
          let secureUrl = trimmedUrl.startsWith('http://') 
            ? trimmedUrl.replace('http://', 'https://')
            : trimmedUrl;
          
          // Ensure Cloudinary URLs use HTTPS
          if (secureUrl.includes('res.cloudinary.com')) {
            secureUrl = secureUrl.replace(/^http:\/\//, 'https://');
          }
          
          // Additional Cloudinary URL validation
          if (secureUrl.includes('res.cloudinary.com')) {
            // Check if URL has proper Cloudinary structure
            const cloudinaryPattern = /^https:\/\/res\.cloudinary\.com\/[^\/]+\/(image|video|raw)\/upload\/[^\/]+\/[^\/]+/;
            if (!cloudinaryPattern.test(secureUrl)) {
              console.warn('⚠️ Invalid Cloudinary URL format:', secureUrl);
              setFailedUrls(prev => new Set(prev).add(trimmedUrl));
              setProfileImageUrl(null);
              setImageError(true);
              setIsLoading(false);
              return;
            }
          }
          
          setProfileImageUrl(secureUrl);
          setImageError(false);
          console.log('✅ Profile image URL set:', secureUrl);
        } else {
          console.warn('⚠️ Invalid profile image URL format:', trimmedUrl);
          setProfileImageUrl(null);
          setImageError(true);
        }
      } else {
        setProfileImageUrl(null);
        setImageError(false);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load profile image:', error);
      setProfileImageUrl(null);
      setImageError(true);
      setIsLoading(false);
    }
  }, [user]);

  // Load profile image on mount
  useEffect(() => {
    loadProfileImage();
  }, [loadProfileImage]);

  // Refresh profile image when screen comes into focus (e.g., after editing)
  useFocusEffect(
    useCallback(() => {
      loadProfileImage();
    }, [loadProfileImage])
  );

  const handleEditProfile = () => {
    router.push('/(user)/[userId]/profile/edit');
  };

  // Placeholder component for when no image is available
  const ProfileImagePlaceholder = () => (
    <View className="w-full h-full bg-gray-200 dark:bg-gray-700 items-center justify-center">
      <Svg width={40} height={40} viewBox="0 0 24 24">
        <Circle cx="12" cy="8" r="4" fill={isDark ? '#6B7280' : '#9CA3AF'} />
        <Path
          d="M12 12c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          fill={isDark ? '#6B7280' : '#9CA3AF'}
        />
      </Svg>
    </View>
  );

  return (
    <View className="px-5 py-4 dark:bg-[#0A0A0A] bg-white">
      {/* Profile Section */}
      <View className="flex-row items-center">
        {/* Profile Picture */}
        <View className="mr-4">
          <View className="w-20 h-20 rounded-full overflow-hidden border-2" style={{ borderColor: borderColor }}>
            {isLoading ? (
              <View className="w-full h-full bg-gray-200 dark:bg-gray-700 items-center justify-center">
                <ActivityIndicator size="small" color={isDark ? '#9CA3AF' : '#6B7280'} />
              </View>
            ) : profileImageUrl && !imageError ? (
              (() => {
                // Validate URL before attempting to load
                const isValidUrl = profileImageUrl && 
                  (profileImageUrl.startsWith('http://') || profileImageUrl.startsWith('https://'));
                
                // Check if URL has already failed
                if (failedUrls.has(profileImageUrl)) {
                  return <ProfileImagePlaceholder />;
                }
                
                if (!isValidUrl) {
                  console.warn('⚠️ Invalid profile image URL format:', profileImageUrl);
                  setFailedUrls(prev => new Set(prev).add(profileImageUrl));
                  return <ProfileImagePlaceholder />;
                }
                
                return (
                  <Image
                    source={{ 
                      uri: profileImageUrl,
                      cache: 'default'
                    }}
                    className="w-full h-full"
                    resizeMode="cover"
                    onError={(error) => {
                      // React Native Image onError structure can vary
                      // Extract all possible error information
                      let errorDetails: any = null;
                      let errorMessage = 'Unknown image download error';
                      
                      // Try multiple ways to extract error information
                      try {
                        const nativeEvent = (error as any)?.nativeEvent;
                        if (nativeEvent) {
                          errorDetails = nativeEvent;
                          // Check if nested error exists (iOS structure)
                          if ((nativeEvent as any)?.error) {
                            errorDetails = (nativeEvent as any).error;
                          }
                        } else if ((error as any)?.error) {
                          errorDetails = (error as any).error;
                        } else {
                          errorDetails = error;
                        }
                        
                        errorMessage = errorDetails?.message || 
                                      errorDetails?.localizedDescription ||
                                      errorDetails?.userInfo?.NSLocalizedDescription ||
                                      (typeof errorDetails === 'string' ? errorDetails : 'Unknown image download error');
                      } catch (parseError) {
                        // If error parsing fails, use fallback
                        errorMessage = 'Unknown image download error';
                        errorDetails = error;
                      }
                      
                      // Check for 404 errors (image not found)
                      const is404Error = errorMessage?.toLowerCase().includes('404') ||
                                        errorMessage?.toLowerCase().includes('not found') ||
                                        errorMessage?.toLowerCase().includes('failed to load') ||
                                        errorMessage?.toLowerCase().includes('resource not found') ||
                                        (errorDetails as any)?.statusCode === 404 ||
                                        (errorDetails as any)?.code === 'ENOTFOUND' ||
                                        (errorDetails as any)?.code === 'HTTP_404';
                      
                      console.error('❌ Profile image failed to load:', {
                        url: profileImageUrl,
                        error: errorMessage,
                        errorDetails: errorDetails,
                        errorType: typeof errorDetails,
                        fullErrorObject: error,
                        nativeEvent: error?.nativeEvent,
                        is404Error: is404Error,
                        issue: is404Error 
                          ? 'Image deleted from Cloudinary but URL still in database (stale URL)' 
                          : 'Unknown image load error - may be network issue or invalid image format'
                      });
                      
                      // If 404, this means image was deleted from Cloudinary
                      if (is404Error) {
                        console.warn('⚠️ Profile image not found in Cloudinary - URL is stale:', profileImageUrl);
                        console.warn('   → The image was deleted from Cloudinary but URL still exists in database');
                        console.warn('   → Consider uploading a new profile image');
                      }
                      
                      // Mark this URL as failed to prevent retry loops
                      setFailedUrls(prev => new Set(prev).add(profileImageUrl));
                      setImageError(true);
                      // Don't clear profileImageUrl immediately - let the error state handle it
                    }}
                    onLoad={() => {
                      // Reset error state if image loads successfully
                      setImageError(false);
                      setFailedUrls(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(profileImageUrl);
                        return newSet;
                      });
                      console.log('✅ Profile image loaded successfully:', profileImageUrl);
                    }}
                    onLoadStart={() => {
                      // Log when image starts loading
                      console.log('🔄 Starting to load profile image:', profileImageUrl);
                    }}
                  />
                );
              })()
            ) : (
              <ProfileImagePlaceholder />
            )}
          </View>
        </View>

        {/* Action Buttons - Right Aligned */}
        <View className="flex-row items-center ml-auto">
          {/* Upload Button */}
          <Pressable 
            className="w-10 h-10 rounded-full items-center justify-center active:opacity-70 mr-3 border border-gray-300 dark:border-[#5F5F5F] dark:bg-[#171717]"
            // style={{ borderColor: borderColor }}
          >
            <Svg width={18} height={18} viewBox="0 0 48 48">
              <Path
                d="M 35.478516 5.9804688 A 2.0002 2.0002 0 0 0 34.085938 9.4140625 L 35.179688 10.507812 C 23.476587 10.680668 14 20.256715 14 32 A 2.0002 2.0002 0 1 0 18 32 C 18 22.427546 25.627423 14.702715 35.154297 14.517578 L 34.085938 15.585938 A 2.0002 2.0002 0 1 0 36.914062 18.414062 L 41.236328 14.091797 A 2.0002 2.0002 0 0 0 41.228516 10.900391 L 36.914062 6.5859375 A 2.0002 2.0002 0 0 0 35.478516 5.9804688 z M 12.5 6 C 8.9338464 6 6 8.9338464 6 12.5 L 6 35.5 C 6 39.066154 8.9338464 42 12.5 42 L 35.5 42 C 39.066154 42 42 39.066154 42 35.5 L 42 28 A 2.0002 2.0002 0 1 0 38 28 L 38 35.5 C 38 36.903846 36.903846 38 35.5 38 L 12.5 38 C 11.096154 38 10 36.903846 10 35.5 L 10 12.5 C 10 11.096154 11.096154 10 12.5 10 L 20 10 A 2.0002 2.0002 0 1 0 20 6 L 12.5 6 z"
                fill={isDark ? '#FFFFFF' : '#000000'}
              />
            </Svg>
          </Pressable>

          {/* Edit Profile Button */}
          <Pressable 
            className="rounded-full py-2 px-4 active:opacity-70"
            style={{ backgroundColor: buttonBg }}
            onPress={handleEditProfile}
          >
            <Text className="text-sm font-medium" style={{ color: buttonText }}>
              Edit Profile
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
