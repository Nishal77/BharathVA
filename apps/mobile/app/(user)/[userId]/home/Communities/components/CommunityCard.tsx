import React from 'react';
import { Pressable, Text, View, useColorScheme, ActivityIndicator, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import { MoreHorizontal, Heart } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CommunityCardProps {
  post: {
    id: string;
    userName: string;
    userAvatar?: string;
    likedText: string;
    mediaUrl: string;
    isLive?: boolean;
    title: string;
    audienceCount: number;
    audienceAvatars?: string[];
    isJoined?: boolean;
    likes: number;
  };
  onJoin?: () => void;
  onLike?: () => void;
  onPress?: () => void;
}

export default function CommunityCard({
  post,
  onJoin,
  onLike,
  onPress,
}: CommunityCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [fontsLoaded] = useFonts({
    'Chirp-Regular': require('../../../../../../assets/fonts/Chirp-Regular.ttf'),
    'Chirp-Medium': require('../../../../../../assets/fonts/Chirp-Medium.ttf'),
    'Chirp-Bold': require('../../../../../../assets/fonts/Chirp-Bold.ttf'),
  });

  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const cardBgColor = isDark ? '#0A0A0A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const iconColor = isDark ? '#9CA3AF' : '#6B7280';
  const liveBadgeColor = '#1E40AF';
  const joinButtonColor = isDark ? '#FFFFFF' : '#000000';
  const joinButtonTextColor = isDark ? '#000000' : '#FFFFFF';

  if (!fontsLoaded) {
    return (
      <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  const cardWidth = SCREEN_WIDTH - 32;
  const maxTextWidth = cardWidth - 80;

  return (
    <View className={`${isDark ? 'bg-black' : 'bg-white'} mb-4`}>
      <Pressable
        onPress={onPress}
        className={`${isDark ? 'bg-black' : 'bg-white'} pt-2`}
        style={({ pressed }) => ({
          opacity: pressed ? 0.95 : 1,
        })}
      >
        <View
          className={`${isDark ? 'bg-[#0A0A0A]' : 'bg-white'} mx-4 rounded-[20px] overflow-hidden border`}
          style={{
            width: cardWidth,
            maxWidth: '100%',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
        {/* Header Section */}
        <View className="flex-row items-start px-4 pt-4 pb-3">
          {/* Profile Picture */}
          <View className="mr-3">
            <View
              className={`w-12 h-12 rounded-full overflow-hidden ${isDark ? 'bg-[#1F2937]' : 'bg-gray-100'}`}
            >
              {post.userAvatar ? (
                <Image
                  source={{ uri: post.userAvatar }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <View className={`w-full h-full ${isDark ? 'bg-[#374151]' : 'bg-gray-300'} justify-center items-center`}>
                  <Text
                    className={`font-chirp-bold text-xl ${isDark ? 'text-white' : 'text-black'}`}
                  >
                    {post.userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Name and Liked Text */}
          <View className="flex-1 pt-0.5 min-w-0">
            <Text
              className={`font-chirp-bold text-[15px] mb-0.5 ${isDark ? 'text-white' : 'text-black'}`}
              style={{ letterSpacing: -0.2 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {post.userName}
            </Text>
            <Text
              className={`font-chirp-regular text-[13px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              style={{ letterSpacing: 0.1 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {post.likedText}
            </Text>
          </View>

          {/* Options Menu */}
          <Pressable
            className="p-1"
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <View className={`w-8 h-8 rounded-lg ${isDark ? 'bg-[#1F2937]' : 'bg-gray-100'} justify-center items-center`}>
              <MoreHorizontal size={16} color={iconColor} />
            </View>
          </Pressable>
        </View>

        {/* Media Container */}
        {post.mediaUrl && (
          <View className="px-4 mb-3 relative">
            <View
              className={`w-full rounded-2xl overflow-hidden ${isDark ? 'bg-[#1F2937]' : 'bg-gray-100'}`}
              style={{
                aspectRatio: 16 / 9,
              }}
            >
              <Image
                source={{ uri: post.mediaUrl }}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                contentFit="cover"
              />

              {/* LiveTV Badge */}
              {post.isLive && (
                <View className="absolute top-3 left-3 flex-row items-center bg-blue-800 px-2.5 py-1 rounded-2xl gap-1.5">
                  <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <Text
                    className="font-chirp-bold text-[11px] text-white"
                    style={{ letterSpacing: 0.2 }}
                  >
                    LiveTV
                  </Text>
                </View>
              )}

              {/* Play Button Overlay */}
              <View className="absolute inset-0 justify-center items-center">
                <View
                  className="w-16 h-16 rounded-full bg-white/95 justify-center items-center"
                  style={{
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <View
                    style={{
                      width: 0,
                      height: 0,
                      borderLeftWidth: 20,
                      borderTopWidth: 12,
                      borderBottomWidth: 12,
                      borderLeftColor: liveBadgeColor,
                      borderTopColor: 'transparent',
                      borderBottomColor: 'transparent',
                      marginLeft: 4,
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Title Text */}
        <View className="px-4 mb-4">
          <Text
            className={`font-chirp-bold text-lg ${isDark ? 'text-white' : 'text-black'}`}
            style={{
              lineHeight: 24,
              letterSpacing: -0.3,
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {post.title}
          </Text>
        </View>

        {/* Footer Section */}
        <View className="px-4 pb-4">
          <View className="flex-row items-center justify-between flex-wrap gap-2">
            {/* Audience Indicator */}
            <View className="flex-row items-center gap-2 flex-1 min-w-0">
              {post.audienceAvatars && post.audienceAvatars.length > 0 && (
                <View className="flex-row mr-1 flex-shrink-0">
                  {post.audienceAvatars.slice(0, 2).map((avatar, index) => (
                    <View
                      key={index}
                      className={`w-6 h-6 rounded-full border-2 overflow-hidden ${isDark ? 'bg-[#1F2937]' : 'bg-gray-100'}`}
                      style={{
                        borderColor: cardBgColor,
                        marginLeft: index > 0 ? -8 : 0,
                      }}
                    >
                      <Image
                        source={{ uri: avatar }}
                        className="w-full h-full"
                        contentFit="cover"
                      />
                    </View>
                  ))}
                </View>
              )}
              <Text
                className={`font-chirp-regular text-[13px] ${isDark ? 'text-gray-400' : 'text-gray-500'} flex-shrink`}
                style={{ letterSpacing: 0.1 }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {post.audienceCount} people are chatting about this.
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row items-center gap-2 flex-shrink-0">
              {/* Join Button */}
              <Pressable
                onPress={onJoin}
                className={`px-5 py-2 rounded-[20px] ${isDark ? 'bg-white' : 'bg-black'}`}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  className={`font-chirp-bold text-[13px] ${isDark ? 'text-black' : 'text-white'}`}
                  style={{ letterSpacing: 0.2 }}
                >
                  {post.isJoined ? 'Joined' : 'Join'}
                </Text>
              </Pressable>

              {/* Like Button */}
              <Pressable
                onPress={onLike}
                className={`w-10 h-10 rounded-full ${isDark ? 'bg-[#1F2937]' : 'bg-gray-100'} justify-center items-center`}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Heart size={18} color={iconColor} fill="none" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      </Pressable>
    </View>
  );
}

