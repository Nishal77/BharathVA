import React from 'react';
import { Pressable } from 'react-native';
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
  onPress,
  onReply,
  onRetweet,
  onLike,
  onBookmark,
  onShare,
  onTweetPress
}: TweetCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white border-b border-gray-100 px-4 py-4"
      style={({ pressed }) => ({
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
      <TweetActions
        replies={replies}
        retweets={retweets}
        likes={likes}
        bookmarks={bookmarks}
        onReply={onReply}
        onRetweet={onRetweet}
        onLike={onLike}
        onBookmark={onBookmark}
        onShare={onShare}
      />
    </Pressable>
  );
}
