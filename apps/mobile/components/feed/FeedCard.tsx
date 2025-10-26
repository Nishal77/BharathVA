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
  bookmarks = 0,
  views = 0,
  onPress,
  onReply,
  onRetweet,
  onLike,
  onBookmark,
  onShare,
  onFeedPress
}: FeedCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';


  return (
    <View className="border-b relative dark:border-[#2B2B2B] border-[#E5E5E5]">
      {/* Two Column Layout */}
      <View className="flex-row px-4 py-3">
        {/* Left Column - Profile Picture and Vertical Line */}
        <FeedProfileSection avatar={avatar} />

        {/* Right Column - All Content */}
        <View className="flex-1">
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
            onLike={onLike}
            onReply={onReply}
            onShare={onShare}
            onBookmark={onBookmark}
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
