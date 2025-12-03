import React, { useState } from 'react';
import { ScrollView, useColorScheme } from 'react-native';
import CommunityCard from './components/CommunityCard';

interface CommunityPostData {
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
}

const mockCommunityPosts: CommunityPostData[] = [
  {
    id: '1',
    userName: 'Mark',
    userAvatar: 'https://i.pravatar.cc/150?img=12',
    likedText: 'Liked Channel 7 Live TV',
    mediaUrl: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&h=600&fit=crop&auto=format',
    isLive: true,
    title: 'Live tennis scores from all Grand Slams',
    audienceCount: 240,
    audienceAvatars: [
      'https://i.pravatar.cc/150?img=1',
      'https://i.pravatar.cc/150?img=2',
    ],
    isJoined: false,
    likes: 124,
  },
  {
    id: '2',
    userName: 'Sarah',
    userAvatar: 'https://i.pravatar.cc/150?img=15',
    likedText: 'Liked Sports Central',
    mediaUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop&auto=format',
    isLive: true,
    title: 'Cricket World Cup 2024 - Live Updates',
    audienceCount: 189,
    audienceAvatars: [
      'https://i.pravatar.cc/150?img=3',
      'https://i.pravatar.cc/150?img=4',
    ],
    isJoined: true,
    likes: 89,
  },
  {
    id: '3',
    userName: 'David',
    userAvatar: 'https://i.pravatar.cc/150?img=18',
    likedText: 'Liked Tech News Live',
    mediaUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&auto=format',
    isLive: false,
    title: 'Breaking: Latest tech innovations revealed',
    audienceCount: 456,
    audienceAvatars: [
      'https://i.pravatar.cc/150?img=5',
      'https://i.pravatar.cc/150?img=6',
    ],
    isJoined: false,
    likes: 203,
  },
  {
    id: '4',
    userName: 'Emma',
    userAvatar: 'https://i.pravatar.cc/150?img=20',
    likedText: 'Liked Music Live',
    mediaUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&auto=format',
    isLive: true,
    title: 'Live Concert: Summer Music Festival 2024',
    audienceCount: 1200,
    audienceAvatars: [
      'https://i.pravatar.cc/150?img=7',
      'https://i.pravatar.cc/150?img=8',
    ],
    isJoined: true,
    likes: 567,
  },
  {
    id: '5',
    userName: 'James',
    userAvatar: 'https://i.pravatar.cc/150?img=25',
    likedText: 'Liked News 24',
    mediaUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop&auto=format',
    isLive: true,
    title: 'Breaking News: Global updates and analysis',
    audienceCount: 890,
    audienceAvatars: [
      'https://i.pravatar.cc/150?img=9',
      'https://i.pravatar.cc/150?img=10',
    ],
    isJoined: false,
    likes: 312,
  },
];

export default function Communities() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [posts, setPosts] = useState(mockCommunityPosts);

  const handleJoin = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isJoined: !post.isJoined,
            }
          : post
      )
    );
  };

  const handleLike = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.likes + 1,
            }
          : post
      )
    );
  };

  const bgColor = isDark ? '#000000' : '#FFFFFF';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bgColor }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
    >
      {posts.map((post) => (
        <CommunityCard
          key={post.id}
          post={{
            id: post.id,
            userName: post.userName,
            userAvatar: post.userAvatar,
            likedText: post.likedText,
            mediaUrl: post.mediaUrl,
            isLive: post.isLive,
            title: post.title,
            audienceCount: post.audienceCount,
            audienceAvatars: post.audienceAvatars,
            isJoined: post.isJoined,
            likes: post.likes,
          }}
          onJoin={() => handleJoin(post.id)}
          onLike={() => handleLike(post.id)}
        />
      ))}
    </ScrollView>
  );
}


