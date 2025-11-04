import React, { useState, useEffect } from 'react';
import { Image, View, useColorScheme, Pressable, Text } from 'react-native';
import { Svg, Circle, Path } from 'react-native-svg';

interface FeedProfileSectionProps {
  avatar?: string | null;
  onProfilePress?: () => void;
}

export default function FeedProfileSection({ avatar, onProfilePress }: FeedProfileSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [imageError, setImageError] = useState(false);

  // Reset error state when avatar changes
  useEffect(() => {
    if (avatar) {
      setImageError(false);
    }
  }, [avatar]);

  const handleImageError = () => {
    console.log('Profile image from NeonDB failed to load');
    setImageError(true);
  };

  return (
    <View style={{ 
      width: 48, 
      alignItems: 'center', 
      paddingTop: 0, 
      position: 'relative', 
      marginRight: 12 
    }}>
      {/* Profile Picture */}
      <Pressable 
        onPress={onProfilePress}
        style={{ opacity: onProfilePress ? 1 : 1 }}
      >
        <View style={{ 
          width: 40, 
          height: 40, 
          borderRadius: 20, 
          overflow: 'hidden', 
          backgroundColor: isDark ? '#374151' : '#D1D5DB' 
        }}>
          {avatar && !imageError ? (
            // Show NeonDB image if available and not errored
            // Validate URL before attempting to load
            (() => {
              const isValidUrl = avatar && (
                avatar.startsWith('http://') || 
                avatar.startsWith('https://')
              );
              
              if (!isValidUrl) {
                console.log('⚠️  Invalid profile image URL format:', avatar);
                return (
                  <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Svg width={24} height={24} viewBox="0 0 24 24">
                      <Circle cx="12" cy="8" r="4" fill={isDark ? '#6B7280' : '#9CA3AF'} />
                      <Path
                        d="M12 12c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                        fill={isDark ? '#6B7280' : '#9CA3AF'}
                      />
                    </Svg>
                  </View>
                );
              }
              
              return (
            <Image
                  source={{ 
                    uri: avatar,
                    cache: 'default'
                  }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
                  onError={(error) => {
                    // React Native Image onError structure can vary
                    // Extract all possible error information
                    let errorDetails: any = null;
                    let errorMessage = 'Unknown image download error';
                    
                    try {
                      // Try different error object structures
                      // React Native ImageErrorEvent has nativeEvent property
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
                      
                      // Extract error message from various possible structures
                      if (typeof errorDetails === 'string') {
                        errorMessage = errorDetails;
                      } else if (errorDetails?.message) {
                        errorMessage = errorDetails.message;
                      } else if (errorDetails?.localizedDescription) {
                        errorMessage = errorDetails.localizedDescription;
                      } else if (errorDetails?.userInfo?.NSLocalizedDescription) {
                        errorMessage = errorDetails.userInfo.NSLocalizedDescription;
                      } else {
                        errorMessage = JSON.stringify(errorDetails) || 'Unknown image download error';
                      }
                    } catch (e) {
                      errorMessage = `Error parsing error object: ${e}`;
                    }
                    
                    // Check if error indicates image not found (404)
                    const is404Error = errorMessage?.includes('404') || 
                                      errorMessage?.includes('not found') ||
                                      errorMessage?.includes('Resource not found') ||
                                      (errorDetails as any)?.code === 404 ||
                                      (errorDetails as any)?.statusCode === 404;
                    
                    console.log('Profile image from NeonDB failed to load:', {
                      url: avatar,
                      error: errorMessage,
                      errorDetails: errorDetails,
                      errorType: typeof errorDetails,
                      fullErrorObject: error,
                      nativeEvent: error?.nativeEvent,
                      is404Error: is404Error,
                      issue: is404Error 
                        ? 'Image deleted from Cloudinary but URL still in database' 
                        : 'Unknown image load error'
                    });
                    
                    // If 404, this means image was deleted from Cloudinary
                    // The URL in NeonDB is stale and should be cleaned up
                    if (is404Error) {
                      console.warn('⚠️  Profile image not found in Cloudinary - URL is stale:', avatar);
                      console.warn('   → Consider cleaning up this URL from NeonDB database');
                    }
                    
                    // Set error state to show placeholder
                    handleImageError();
                  }}
                  onLoad={() => {
                    // Reset error state if image loads successfully
                    if (imageError) {
                      console.log('✅ Profile image loaded successfully:', avatar);
                      setImageError(false);
                    }
                  }}
                  onLoadStart={() => {
                    // Optional: Log when image starts loading
                    console.log('🔄 Starting to load profile image:', avatar);
                  }}
                />
              );
            })()
          ) : (
            // No NeonDB image or failed to load, show SVG placeholder
            <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Circle cx="12" cy="8" r="4" fill={isDark ? '#6B7280' : '#9CA3AF'} />
                <Path
                  d="M12 12c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  fill={isDark ? '#6B7280' : '#9CA3AF'}
                />
              </Svg>
            </View>
          )}
        </View>
      </Pressable>
      
      {/* Vertical Line - Connecting Main Profile to Follower Avatars */}
      <View
        style={{
          position: 'absolute',
          width: 1,
          backgroundColor: isDark ? '#2B2B2B' : 'rgba(0, 0, 0, 0.15)',
          left: 19, // Centered on the profile images
          top: 44, // Below the main profile image with small gap (40px height + 8px space)
          bottom: 40, // Above the follower avatars
        }}
      />
      
      {/* Three Follower Avatars in Horizontal Row Formation - Aligned with Stats */}
      {/* Left Avatar */}
      <View
        style={{
          position: 'absolute',
          left: 3, // Leftmost position
          bottom: 12, // Same spacing as pb-3 (12px) from stats text
        }}
      >
        <View style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: isDark ? '#374151' : '#FFFFFF'
        }}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&q=80' }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Center Avatar */}
      <View
        style={{
          position: 'absolute',
          left: 11, // Center position with slight overlap
          bottom: 12, // Same spacing as pb-3 (12px) from stats text
        }}
      >
        <View style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: isDark ? '#374151' : '#FFFFFF'
        }}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Right Avatar */}
      <View
        style={{
          position: 'absolute',
          left: 19, // Rightmost position with slight overlap
          bottom: 12, // Same spacing as pb-3 (12px) from stats text
        }}
      >
        <View style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: isDark ? '#374151' : '#FFFFFF'
        }}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
}
