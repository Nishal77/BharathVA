import React, { useState } from 'react';
import { ScrollView, useColorScheme, Pressable, View, Platform } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import UICard from './components/UICard';

interface PublicSafetyPostData {
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
}

const mockPublicSafetyPosts: PublicSafetyPostData[] = [
  {
    id: '1',
    name: 'Mumbai Police',
    username: 'mumbaipolice',
    avatar: 'https://picsum.photos/id/237/150/150',
    location: 'Mumbai',
    timeAgo: '2h',
    caption: 'Traffic Advisory: Heavy congestion expected on Western Express Highway due to ongoing road repairs. Please use alternate routes. Stay safe!',
    imageUrl: 'https://picsum.photos/id/1015/800/450',
    likes: 124,
    comments: 23,
    shares: 45,
    views: 12500,
    isLiked: false,
    responseAvatars: [
      'https://picsum.photos/id/64/150/150',
      'https://picsum.photos/id/65/150/150',
      'https://picsum.photos/id/66/150/150',
    ],
  },
  {
    id: '2',
    name: 'Delhi Traffic Police',
    username: 'delhitrafficpolice',
    avatar: 'https://picsum.photos/id/1025/150/150',
    location: 'Delhi',
    timeAgo: '5h',
    caption: 'Safety Alert: Please drive carefully during monsoon season. Reduced visibility and wet roads require extra caution. Follow @safetytips for more.',
    imageUrl: 'https://picsum.photos/id/1016/800/450',
    likes: 89,
    comments: 12,
    shares: 31,
    views: 8900,
    isLiked: true,
    responseAvatars: [
      'https://picsum.photos/id/67/150/150',
      'https://picsum.photos/id/68/150/150',
    ],
  },
  {
    id: '3',
    name: 'Bangalore City Police',
    username: 'blrcitypolice',
    avatar: 'https://picsum.photos/id/177/150/150',
    location: 'Bangalore',
    timeAgo: '1d',
    caption: 'Public Notice: New traffic regulations in effect from next week. Please review the updated guidelines and share with your network.',
    imageUrl: 'https://picsum.photos/id/1018/800/450',
    likes: 156,
    comments: 34,
    shares: 67,
    views: 18900,
    isLiked: false,
    responseAvatars: [
      'https://picsum.photos/id/69/150/150',
      'https://picsum.photos/id/70/150/150',
      'https://picsum.photos/id/71/150/150',
    ],
  },
  {
    id: '4',
    name: 'Chennai Police',
    username: 'chennaipolice',
    avatar: 'https://picsum.photos/id/1005/150/150',
    location: 'Chennai',
    timeAgo: '3h',
    caption: 'Emergency Alert: Heavy rainfall expected in coastal areas. Please avoid unnecessary travel and stay indoors. Contact @emergency for help.',
    imageUrl: 'https://picsum.photos/id/1019/800/450',
    likes: 203,
    comments: 45,
    shares: 89,
    views: 23400,
    isLiked: false,
    responseAvatars: [
      'https://picsum.photos/id/72/150/150',
      'https://picsum.photos/id/73/150/150',
      'https://picsum.photos/id/74/150/150',
    ],
  },
  {
    id: '5',
    name: 'Hyderabad Police',
    username: 'hyderabadpolice',
    avatar: 'https://picsum.photos/id/1011/150/150',
    location: 'Hyderabad',
    timeAgo: '6h',
    caption: 'Community Safety: Join us for the neighborhood watch program. Together we can make our city safer. Register at @communitysafety',
    imageUrl: 'https://picsum.photos/id/1020/800/450',
    likes: 178,
    comments: 28,
    shares: 56,
    views: 16700,
    isLiked: true,
    responseAvatars: [
      'https://picsum.photos/id/75/150/150',
      'https://picsum.photos/id/76/150/150',
    ],
  },
];

export default function PublicSafety() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [posts, setPosts] = useState(mockPublicSafetyPosts);

  const handleLike = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleComment = (postId: string) => {
    console.log('Comment pressed for post:', postId);
  };

  const handleShare = (postId: string) => {
    console.log('Share pressed for post:', postId);
  };

  const handleCompose = () => {
    console.log('Compose button pressed');
  };

  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const buttonBottom = Platform.OS === 'ios' ? 108 : 80;

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 32 }}
      >
        {posts.map((post) => (
          <UICard
            key={post.id}
            post={{
              id: post.id,
              name: post.name,
              username: post.username,
              avatar: post.avatar,
              location: post.location,
              timeAgo: post.timeAgo,
              caption: post.caption,
              imageUrl: post.imageUrl,
              imageUrls: post.imageUrls,
              likes: post.likes,
              comments: post.comments,
              shares: post.shares,
              views: post.views,
              isLiked: post.isLiked,
              responseAvatars: post.responseAvatars,
            }}
            onLike={() => handleLike(post.id)}
            onComment={() => handleComment(post.id)}
            onShare={() => handleShare(post.id)}
          />
        ))}
      </ScrollView>

      {/* Floating Action Button - Compose */}
      <View
        className="absolute right-5 w-14 h-14 z-[10000]"
        style={{
          bottom: buttonBottom,
        }}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={handleCompose}
          className="w-14 h-14 rounded-full bg-black items-center justify-center p-1"
          style={({ pressed }) => ({
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 20,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}
          accessibilityLabel="Compose new post"
          accessibilityRole="button"
        >
          <View className="w-full h-full items-center justify-center">
            <Svg
              width={24}
              height={24}
              viewBox="0 0 12 12"
            >
              <Line
                x1="10.75"
                y1="6"
                x2="1.25"
                y2="6"
                fill="none"
                stroke="#FFFFFF"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <Line
                x1="6"
                y1="10.75"
                x2="6"
                y2="1.25"
                fill="none"
                stroke="#FFFFFF"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </Svg>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

