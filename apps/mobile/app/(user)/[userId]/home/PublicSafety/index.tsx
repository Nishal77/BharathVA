import React, { useState } from 'react';
import { ScrollView, useColorScheme } from 'react-native';
import FeedCard from '../../../../../components/feed/FeedCard';
import PublicSafetyStats from './components/PublicSafetyStats';
import PublicSafetyActions from './components/PublicSafetyActions';

interface PublicSafetyPostData {
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
  isLiked: boolean;
}

const mockPublicSafetyPosts: PublicSafetyPostData[] = [
  {
    id: '1',
    policeAccountName: 'Mumbai Police',
    policeAccountHandle: 'mumbaipolice',
    policeAvatar: 'https://i.pravatar.cc/150?img=12',
    timeAgo: '2h',
    caption: 'Traffic Advisory: Heavy congestion expected on Western Express Highway due to ongoing road repairs. Please use alternate routes.',
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&auto=format',
    likes: 124,
    comments: 23,
    shares: 45,
    views: 12500,
    isLiked: false,
  },
  {
    id: '2',
    policeAccountName: 'Delhi Traffic Police',
    policeAccountHandle: 'delhitrafficpolice',
    policeAvatar: 'https://i.pravatar.cc/150?img=15',
    timeAgo: '5h',
    caption: 'Safety Alert: Please drive carefully during monsoon season. Reduced visibility and wet roads require extra caution.',
    imageUrl: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&h=600&fit=crop&auto=format',
    likes: 89,
    comments: 12,
    shares: 31,
    views: 8900,
    isLiked: true,
  },
  {
    id: '3',
    policeAccountName: 'Bangalore City Police',
    policeAccountHandle: 'blrcitypolice',
    policeAvatar: 'https://i.pravatar.cc/150?img=18',
    timeAgo: '1d',
    caption: 'Public Notice: New traffic regulations in effect from next week. Please review the updated guidelines.',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&auto=format',
    likes: 156,
    comments: 34,
    shares: 67,
    views: 18900,
    isLiked: false,
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

  const bgColor = isDark ? '#000000' : '#FFFFFF';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bgColor }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
    >
      {posts.map((post) => (
        <FeedCard
          key={post.id}
          id={post.id}
          name={post.policeAccountName}
          handle={post.policeAccountHandle}
          time={post.timeAgo}
          avatar={post.policeAvatar}
          verified={false}
          content={post.caption}
          media={{
            type: 'single',
            items: [
              {
                id: `${post.id}_image`,
                type: 'image',
                url: post.imageUrl,
              },
            ],
          }}
          replies={post.comments}
          retweets={post.shares}
          likes={post.likes}
          userLiked={post.isLiked}
          views={post.views}
          onLike={() => handleLike(post.id)}
          onReply={() => handleComment(post.id)}
          onShare={() => handleShare(post.id)}
          showStats={false}
          customActions={
            <PublicSafetyActions
              comments={post.comments}
              likes={post.likes}
              shares={post.shares}
              isLiked={post.isLiked}
              onComment={() => handleComment(post.id)}
              onLike={() => handleLike(post.id)}
              onShare={() => handleShare(post.id)}
            />
          }
          customStats={
            <PublicSafetyStats
              responses={post.comments + post.shares}
              views={post.views}
            />
          }
        />
      ))}
    </ScrollView>
  );
}

