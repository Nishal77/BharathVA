import React from 'react';
import { View, useColorScheme } from 'react-native';
import TweetActionSection from './TweetActionSection';
import TweetContentSection from './TweetContentSection';
import TweetMediaSection from './TweetMediaSection';
import TweetProfileSection from './TweetProfileSection';
import TweetStatsSection from './TweetStatsSection';

interface TweetCardProps {
  id: string;
  name: string;
  handle: string;
  time: string;
  avatar: string;
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
  bookmarks?: number;
  views?: number;
  onPress?: () => void;
  onReply?: () => void;
  onRetweet?: () => void;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onTweetPress?: (tweetId: string) => void;
}

export default function TweetCard({
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
  bookmarks = 0,
  views = 0,
  onPress,
  onReply,
  onRetweet,
  onLike,
  onBookmark,
  onShare,
  onTweetPress
}: TweetCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  return (
    <View className="border-b relative" style={{ borderBottomColor: borderColor }}>
      {/* Two Column Layout */}
      <View className="flex-row px-4 py-3">
        {/* Left Column - Profile Picture and Vertical Line */}
        <TweetProfileSection avatar={avatar} />

        {/* Right Column - All Content */}
        <View className="flex-1">
          <TweetContentSection
            name={name}
            handle={handle}
            time={time}
            verified={verified}
            content={content}
            emojis={emojis}
          />

          {/* Media Section - Always shows random image */}
          <TweetMediaSection media={media} />

          <TweetActionSection
            onLike={onLike}
            onReply={onReply}
            onShare={onShare}
            onBookmark={onBookmark}
          />

          <TweetStatsSection
            replies={replies}
            likes={likes}
          />
        </View>
      </View>
    </View>
  );
}