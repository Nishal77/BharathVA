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
  onReply,
  onRetweet,
  onLike,
  onBookmark,
  onShare,
  onViewAnalytics,
}: TweetActionsProps) {

  return (
    <View className="flex-row items-center justify-between ml-[52px] mr-4">
      <CommentButton replies={replies} onPress={onReply} />
      <RetweetButton retweets={retweets} onPress={onRetweet} />
      <LikeButton likes={likes} onPress={onLike} />
      <BookmarkButton bookmarks={bookmarks} onPress={onBookmark} />
      <ViewCount onPress={onViewAnalytics} />
      <ShareButton onPress={onShare} />
    </View>
  );
}
