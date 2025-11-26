import React from 'react';
import { Pressable, Text, View, useColorScheme, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import { MessageCircle, Heart, Share2, MoreHorizontal } from 'lucide-react-native';

interface PublicSafetyPostProps {
  post: {
    id: string;
    policeAccountName: string;
    policeAccountHandle: string;
    policeAvatar?: string;
    timeAgo: string;
    caption: string;
    imageUrl: string;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    likedByUser?: string;
    likedByAvatar?: string;
    isLiked: boolean;
  };
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

export default function PublicSafetyPost({
  post,
  onLike,
  onComment,
  onShare,
}: PublicSafetyPostProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [fontsLoaded] = useFonts({
    'Chirp-Regular': require('../../../../../../assets/fonts/Chirp-Regular.ttf'),
    'Chirp-Medium': require('../../../../../../assets/fonts/Chirp-Medium.ttf'),
    'Chirp-Bold': require('../../../../../../assets/fonts/Chirp-Bold.ttf'),
  });

  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB';
  const iconColor = isDark ? '#9CA3AF' : '#6B7280';
  const likedColor = '#EF4444';

  const formatViews = (views: number): string => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k views`;
    }
    return `${views} views`;
  };

  if (!fontsLoaded) {
    return (
      <View style={{ padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: bgColor,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
        paddingVertical: 16,
        paddingHorizontal: 16,
      }}
    >
      {/* Header Section */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        {/* Profile Picture */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 12,
            overflow: 'hidden',
            backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
          }}
        >
          {post.policeAvatar ? (
            <Image
              source={{ uri: post.policeAvatar }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: isDark ? '#374151' : '#D1D5DB',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontFamily: 'Chirp-Bold', color: textColor, fontSize: 18 }}>
                {post.policeAccountName.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        {/* Name, Handle, Time */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text
              style={{
                fontFamily: 'Chirp-Bold',
                fontSize: 15,
                color: textColor,
                marginRight: 6,
                letterSpacing: -0.2,
              }}
            >
              {post.policeAccountName}
            </Text>
            <Text
              style={{
                fontFamily: 'Chirp-Regular',
                fontSize: 14,
                color: secondaryTextColor,
                marginRight: 4,
                letterSpacing: 0.1,
              }}
            >
              @{post.policeAccountHandle}
            </Text>
            <Text
              style={{
                fontFamily: 'Chirp-Regular',
                fontSize: 14,
                color: secondaryTextColor,
                letterSpacing: 0.1,
              }}
            >
              · {post.timeAgo}
            </Text>
          </View>
        </View>

        {/* Options Menu */}
        <Pressable
          style={({ pressed }) => ({
            padding: 8,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <MoreHorizontal size={20} color={iconColor} />
        </Pressable>
      </View>

      {/* Caption */}
      <View style={{ marginBottom: 12 }}>
        <Text
          style={{
            fontFamily: 'Chirp-Regular',
            fontSize: 15,
            lineHeight: 22,
            color: textColor,
            letterSpacing: 0.1,
          }}
        >
          {post.caption}
        </Text>
      </View>

      {/* Main Image */}
      <View
        style={{
          width: '100%',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 12,
          backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
        }}
      >
        <Image
          source={{ uri: post.imageUrl }}
          style={{
            width: '100%',
            aspectRatio: 16 / 9,
          }}
          contentFit="cover"
        />
      </View>

      {/* Action Icons */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 24,
          marginBottom: 8,
        }}
      >
        {/* Comment */}
        <Pressable
          onPress={onComment}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <MessageCircle size={20} color={iconColor} />
          {post.comments > 0 && (
            <Text
              style={{
                fontFamily: 'Chirp-Regular',
                fontSize: 14,
                color: secondaryTextColor,
                letterSpacing: 0.1,
              }}
            >
              {post.comments}
            </Text>
          )}
        </Pressable>

        {/* Like */}
        <Pressable
          onPress={onLike}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Heart
            size={20}
            color={post.isLiked ? likedColor : iconColor}
            fill={post.isLiked ? likedColor : 'none'}
          />
          {post.likes > 0 && (
            <Text
              style={{
                fontFamily: 'Chirp-Regular',
                fontSize: 14,
                color: secondaryTextColor,
                letterSpacing: 0.1,
              }}
            >
              {post.likes}
            </Text>
          )}
        </Pressable>

        {/* Share */}
        <Pressable
          onPress={onShare}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Share2 size={20} color={iconColor} />
          {post.shares > 0 && (
            <Text
              style={{
                fontFamily: 'Chirp-Regular',
                fontSize: 14,
                color: secondaryTextColor,
                letterSpacing: 0.1,
              }}
            >
              {post.shares}
            </Text>
          )}
        </Pressable>
      </View>

      {/* Views */}
      <Text
        style={{
          fontFamily: 'Chirp-Regular',
          fontSize: 13,
          color: secondaryTextColor,
          marginTop: 4,
          letterSpacing: 0.1,
        }}
      >
        {formatViews(post.views)}
      </Text>
    </View>
  );
}

