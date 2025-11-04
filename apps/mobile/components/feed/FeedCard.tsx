import React from 'react';
import { View, useColorScheme } from 'react-native';
import FeedActionSection from './FeedActionSection';
import FeedContentSection from './FeedContentSection';
import FeedMediaSection from './FeedMediaSection';
import FeedProfileSection from './FeedProfileSection';
import FeedStatsSection from './FeedStatsSection';

interface FeedCardProps {
  id: string;
  name: string;
  handle: string;
  time: string;
  avatar?: string | null;
  verified?: boolean;
  content: string;
  emojis?: string[];
  media?: {
    type: 'grid' | 'single' | 'carousel';
    items: any[];
  };
  thread?: any[];
  replies?: number;
  retweets?: number;
  likes?: number;
  likedByUserIds?: string[]; // Array of user IDs who liked the post
  userLiked?: boolean; // Whether the current user has liked this post
  bookmarks?: number;
  views?: number;
  onPress?: () => void;
  onReply?: () => void;
  onRetweet?: () => void;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onProfilePress?: () => void;
  onFeedPress?: (feedId: string) => void;
}

export default function FeedCard({
  id,
  name,
  handle,
  time,
  avatar,
  verified = false,
  content,
  emojis,
  media,
  thread,
  replies = 0,
  retweets = 0,
  likes = 0,
  likedByUserIds = [],
  userLiked = false,
  bookmarks = 0,
  views = 0,
  onPress,
  onReply,
  onRetweet,
  onLike,
  onBookmark,
  onShare,
  onProfilePress,
  onFeedPress
}: FeedCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';


  return (
    <View style={{ 
      borderBottomWidth: 1, 
      position: 'relative', 
      borderBottomColor: isDark ? '#2B2B2B' : '#E5E5E5' 
    }}>
      {/* Two Column Layout */}
      <View style={{ 
        flexDirection: 'row', 
        paddingHorizontal: 16, 
        paddingVertical: 12 
      }}>
        {/* Left Column - Profile Picture and Vertical Line */}
        <FeedProfileSection 
          avatar={avatar} 
          onProfilePress={onProfilePress || (() => console.log('Profile clicked'))}
        />

        {/* Right Column - All Content */}
        <View style={{ flex: 1 }}>
          <FeedContentSection
            name={name}
            handle={handle}
            time={time}
            verified={verified}
            content={content}
            emojis={emojis}
          />

          {/* Media Section - Always shows random image */}
          <FeedMediaSection media={media} />

          <FeedActionSection
            feedId={id}
            onLike={onLike}
            onReply={onReply}
            onShare={onShare}
            onBookmark={onBookmark}
            onEmojiSelect={(emoji) => console.log('Emoji selected:', emoji)}
            likes={likes > 0 ? likes : undefined}
            likedByUserIds={likedByUserIds}
            userLiked={userLiked}
            comments={replies !== undefined ? replies : 0}
            shares={retweets > 0 ? retweets : undefined}
            onCommentAdded={() => {
              // Refresh feed list when comment is added
              if (onFeedPress) {
                onFeedPress(id);
              }
            }}
          />

          <FeedStatsSection
            replies={replies}
            likes={likes}
          />
        </View>
      </View>
    </View>
  );
}
