import React from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { useTabStyles } from '../../hooks/useTabStyles';
import TweetActions from './TweetActions';
import TweetContent from './TweetContent';
import TweetHeader from './TweetHeader';
import TweetMedia from './TweetMedia';
import TweetThread from './TweetThread';

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
  const tabStyles = useTabStyles();
  const { width } = Dimensions.get('window');
  
  // Calculate device-based margins
  const deviceMargin = width < 375 ? 12 : width < 414 ? 16 : 20; // Smaller margins for smaller devices

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: tabStyles.card.backgroundColor,
        paddingHorizontal: 28, // Increased external padding for better content spacing
        paddingVertical: 20, // Increased vertical padding
        marginHorizontal: deviceMargin, // Device-based external margin from screen edges
        marginBottom: 24, // Increased margin between cards for better visual separation
        borderRadius: 12, // Add subtle border radius
        opacity: pressed ? 0.98 : 1,
      })}
    >
      {/* Tweet Header */}
      <TweetHeader
        name={name}
        handle={handle}
        time={time}
        avatar={avatar}
        verified={verified}
      />

      {/* Tweet Content */}
      <TweetContent
        text={content}
        emojis={emojis}
      />

      {/* Tweet Media */}
      {media && (
        <TweetMedia
          type={media.type}
          items={media.items}
        />
      )}

      {/* Tweet Thread */}
      {thread && thread.length > 0 && (
        <TweetThread
          tweets={thread}
          onTweetPress={onTweetPress}
        />
      )}

      {/* Tweet Actions */}
      <View style={{ marginTop: 4, marginBottom: 8 }}>
        <TweetActions
          replies={replies}
          retweets={retweets}
          likes={likes}
          bookmarks={bookmarks}
          views={views}
          onReply={onReply}
          onRetweet={onRetweet}
          onLike={onLike}
          onBookmark={onBookmark}
          onShare={onShare}
        />
      </View>

      {/* Border below actions with proper spacing */}
      <View style={{
        borderBottomWidth: 1,
        borderBottomColor: tabStyles.border.card,
        marginTop: 4, // Reduced spacing since actions now have their own margins
        marginBottom: 8, // Spacing below border for cleaner separation
      }} />
    </Pressable>
  );
}
