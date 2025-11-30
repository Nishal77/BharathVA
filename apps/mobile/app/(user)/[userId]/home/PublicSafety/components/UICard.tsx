import React, { useState } from 'react';
import { Pressable, Text, View, useColorScheme, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import { MoreHorizontal } from 'lucide-react-native';

interface UICardProps {
  post: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    location?: string;
    timeAgo: string;
    caption: string;
    imageUrl?: string;
    imageUrls?: string[];
    likes: number;
    comments: number;
    shares: number;
    views: number;
    isLiked: boolean;
    responseAvatars?: string[];
  };
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export default function UICard({ post }: UICardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [fontsLoaded] = useFonts({
    'Chirp-Regular': require('../../../../../../assets/fonts/Chirp-Regular.ttf'),
    'Chirp-Medium': require('../../../../../../assets/fonts/Chirp-Medium.ttf'),
    'Chirp-Bold': require('../../../../../../assets/fonts/Chirp-Bold.ttf'),
  });

  const [avatarError, setAvatarError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [responseAvatarErrors, setResponseAvatarErrors] = useState<Record<number, boolean>>({});

  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const cardBgColor = isDark ? '#0A0A0A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const iconColor = isDark ? '#9CA3AF' : '#6B7280';
  const mentionColor = '#10B981';

  const generateImageUrl = (seed: string, width: number, height: number): string => {
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageId = 1000 + (hash % 1000);
    return `https://picsum.photos/id/${imageId}/${width}/${height}`;
  };

  const getImageUrl = (): string => {
    if (post.imageUrl) return post.imageUrl;
    if (post.imageUrls && post.imageUrls.length > 0) return post.imageUrls[0];
    return generateImageUrl(`card-${post.id}`, 800, 450);
  };

  const getAvatarUrl = (): string => {
    if (post.avatar && !avatarError) return post.avatar;
    return generateImageUrl(`avatar-${post.username || post.id}`, 150, 150);
  };

  const getResponseAvatarUrl = (index: number, originalUrl?: string): string => {
    if (originalUrl && !responseAvatarErrors[index]) return originalUrl;
    return generateImageUrl(`response-${index}`, 150, 150);
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const parseCaption = (caption: string) => {
    const parts: Array<{ text: string; isMention: boolean }> = [];
    const mentionRegex = /@(\w+)/g;
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(caption)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: caption.substring(lastIndex, match.index), isMention: false });
      }
      parts.push({ text: match[0], isMention: true });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < caption.length) {
      parts.push({ text: caption.substring(lastIndex), isMention: false });
    }

    return parts.length > 0 ? parts : [{ text: caption, isMention: false }];
  };

  if (!fontsLoaded) {
    return (
      <View className="p-5 items-center justify-center" style={{ minHeight: 200 }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  const captionParts = parseCaption(post.caption);
  const cardImageUrl = getImageUrl();
  const profileAvatarUrl = getAvatarUrl();

  return (
    <View className="pt-1 pb-4 px-0" style={{ backgroundColor: bgColor }}>
      <View
        className="rounded-[20px] overflow-hidden border mx-3"
        style={{
          backgroundColor: cardBgColor,
          borderColor: isDark ? '#1F2937' : '#E5E7EB',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        {/* Header Section */}
        <View className="flex-row items-start px-4 pt-3 pb-3">
          {/* Profile Picture */}
          <View className="mr-3">
            <View className="w-12 h-12 rounded-full overflow-hidden">
              <Image
                source={{ uri: profileAvatarUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
                onError={() => {
                  if (!avatarError) {
                    setAvatarError(true);
                  }
                }}
                onLoad={() => {
                  setAvatarError(false);
                }}
              />
            </View>
          </View>

          {/* Name, Location, Time */}
          <View className="flex-1 pt-0.5">
            <Text
              className="font-chirp-bold text-[15px] mb-0.5"
              style={{ 
                color: textColor,
                letterSpacing: -0.2 
              }}
            >
              {post.name}
            </Text>
            <Text
              className="font-chirp-regular text-[13px]"
              style={{ 
                color: secondaryTextColor,
                letterSpacing: 0.1 
              }}
            >
              {post.location ? `Posted in ${post.location} - ${post.timeAgo}` : post.timeAgo}
            </Text>
          </View>

          {/* Options Menu */}
          <Pressable
            className="p-1"
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <MoreHorizontal size={18} color={iconColor} />
          </Pressable>
        </View>

        {/* Caption */}
        <View className="px-4 mb-3">
          <Text
            className="font-chirp-regular text-[15px] leading-[22px]"
            style={{ 
              color: textColor,
              letterSpacing: 0.1 
            }}
          >
            {captionParts.map((part, index) => (
              <Text
                key={index}
                style={{
                  color: part.isMention ? mentionColor : textColor,
                  fontFamily: part.isMention ? 'Chirp-Medium' : 'Chirp-Regular',
                }}
              >
                {part.text}
              </Text>
            ))}
          </Text>
        </View>

        {/* Single Image */}
        <View className="px-4 mb-3">
          <View className="w-full aspect-[16/9] rounded-xl overflow-hidden">
            <Image
              source={{ uri: cardImageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              priority="high"
              recyclingKey={post.id}
              onError={() => {
                if (!imageError) {
                  setImageError(true);
                }
              }}
              onLoad={() => {
                setImageError(false);
              }}
            />
          </View>
        </View>

        {/* Views and Engagement */}
        <View className="flex-row items-center px-4 pb-4 gap-2">
          {post.comments > 0 && (
            <>
              {/* Avatar Group */}
              {post.responseAvatars && post.responseAvatars.length > 0 && (
                <View className="flex-row items-center mr-1.5">
                  {post.responseAvatars.slice(0, 3).map((avatar, index) => {
                    const avatarUrl = getResponseAvatarUrl(index, avatar);
                    return (
                      <View
                        key={index}
                        className="w-[22px] h-[22px] rounded-full border-2 overflow-hidden"
                        style={{
                          borderColor: isDark ? '#030712' : '#FFFFFF',
                          marginLeft: index > 0 ? -7 : 0,
                          zIndex: 3 - index,
                          shadowColor: '#000000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.2,
                          shadowRadius: 2,
                          elevation: 2,
                        }}
                      >
                        <Image
                          source={{ uri: avatarUrl }}
                          style={{ width: '100%', height: '100%' }}
                          contentFit="cover"
                          transition={200}
                          cachePolicy="memory-disk"
                          onError={() => {
                            if (!responseAvatarErrors[index]) {
                              setResponseAvatarErrors(prev => ({ ...prev, [index]: true }));
                            }
                          }}
                          onLoad={() => {
                            setResponseAvatarErrors(prev => ({ ...prev, [index]: false }));
                          }}
                        />
                      </View>
                    );
                  })}
                </View>
              )}
              <Text
                className="font-chirp-regular text-[13px]"
                style={{ 
                  color: textColor,
                  letterSpacing: 0.1 
                }}
              >
                <Text
                  className="font-chirp-bold text-[13px]"
                  style={{ 
                    color: textColor,
                    letterSpacing: 0.1 
                  }}
                >
                  {formatNumber(post.comments)}
                </Text>
                <Text
                  className="font-chirp-regular text-[13px]"
                  style={{ 
                    color: textColor,
                    letterSpacing: 0.1 
                  }}
                >
                  {' '}keeping watch here
                </Text>
              </Text>
              <Text
                className="font-chirp-regular text-[13px] mx-1"
                style={{ color: textColor }}
              >
                ·
              </Text>
            </>
          )}
          <Text
            className="font-chirp-regular text-[13px]"
            style={{ 
              color: textColor,
              letterSpacing: 0.1 
            }}
          >
            <Text
              className="font-chirp-bold text-[13px]"
              style={{ 
                color: textColor,
                letterSpacing: 0.1 
              }}
            >
              {post.views >= 1000000
                ? `${(post.views / 1000000).toFixed(1)}M`
                : post.views >= 1000
                ? `${(post.views / 1000).toFixed(1)}K`
                : post.views.toString()}
            </Text>
            <Text
              className="font-chirp-regular text-[13px]"
              style={{ 
                color: textColor,
                letterSpacing: 0.1 
              }}
            >
              {' '}views
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
