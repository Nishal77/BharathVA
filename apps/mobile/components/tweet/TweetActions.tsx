import React from 'react';
import { View } from 'react-native';
import BookmarkButton from './TweetActions/BookmarkButton';
import CommentButton from './TweetActions/CommentButton';
import LikeButton from './TweetActions/LikeButton';
import RetweetButton from './TweetActions/RetweetButton';
import ShareButton from './TweetActions/ShareButton';
import ViewCount from './TweetActions/ViewCount';

interface TweetActionsProps {
  replies?: number;
  retweets?: number;
  likes?: number;
  bookmarks?: number;
  views?: number;
  onReply?: () => void;
  onRetweet?: () => void;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onViewAnalytics?: () => void;
}

export default function TweetActions({
  replies = 0,
  retweets = 0,
  likes = 0,
  bookmarks = 0,
  views = 0,
  onReply,
  onRetweet,
  onLike,
  onBookmark,
  onShare,
  onViewAnalytics,
}: TweetActionsProps) {

  return (
    <View className="flex-row items-center justify-between" style={{ marginLeft: 60, marginRight: 12 }}>
      <CommentButton replies={replies} onPress={onReply} />
      <LikeButton likes={likes} onPress={onLike} />
      <RetweetButton retweets={retweets} onPress={onRetweet} />
      <BookmarkButton bookmarks={bookmarks} onPress={onBookmark} />
      <ViewCount views={views || 128} onPress={onViewAnalytics} />
      <ShareButton onPress={onShare} />
    </View>
  );
}
