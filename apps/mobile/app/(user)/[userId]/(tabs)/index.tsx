import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  useColorScheme
} from 'react-native';
import HomeHeader from '../home/components/HomeHeader';
import LocalPulse from '../home/LocalPulse';
import PublicSafety from '../home/PublicSafety';
import Communities from '../home/Communities';
import MessagesScreen from '../../../../components/messages/MessagesScreen';
import FeedCard from '../../../../components/feed/FeedCard';
import { useTabStyles } from '../../../../hooks/useTabStyles';
import { getAllFeedsWithUserData, EnhancedFeedItem } from '../../../../services/api/feedService';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const { userId } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('For you');
  const [refreshing, setRefreshing] = useState(false);
  const [messagesVisible, setMessagesVisible] = useState(false);
  const messagesSlideAnim = useRef(new Animated.Value(width)).current;
  const tabStyles = useTabStyles();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const spinValue = useRef(new Animated.Value(0)).current;

  const [feeds, setFeeds] = useState<EnhancedFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);

  const tabs = ['For you', 'Following', 'Local', 'Communities', 'Shorts/Video', 'Space(Live)'];

  const fetchFeeds = useCallback(async (page: number = 0, isRefresh: boolean = false) => {
    try {
      console.log('🔄 Fetching feeds from MongoDB...', { page, isRefresh });
      
      const response = await getAllFeedsWithUserData(page, 20);
      
      if (response.success && response.data) {
        const newFeeds = response.data;
        console.log('✅ Feeds fetched successfully', { count: newFeeds.length });
        
        if (isRefresh) {
          setFeeds(newFeeds);
        } else {
          setFeeds(prevFeeds => [...prevFeeds, ...newFeeds]);
        }
        
        setHasMoreData(newFeeds.length === 20);
        setCurrentPage(page);
        setError(null);
      } else {
        console.error('❌ Failed to fetch feeds', response.error);
        setError(response.error?.message || 'Failed to fetch feeds');
      }
    } catch (err) {
      console.error('❌ Error fetching feeds', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
      
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }
  }, []);

  useEffect(() => {
    fetchFeeds(0, true);
  }, [fetchFeeds]);

  const convertToFeedCardFormat = (feed: EnhancedFeedItem) => {
    const createdAt = new Date(feed.createdAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
    
    let timeAgo = '';
    if (diffInHours < 1) {
      timeAgo = 'now';
    } else if (diffInHours < 24) {
      timeAgo = `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      timeAgo = `${diffInDays}d`;
    }

    const media = feed.imageUrls && feed.imageUrls.length > 0 ? {
      type: feed.imageUrls.length === 1 ? 'single' : 'grid' as 'single' | 'grid',
      items: feed.imageUrls.map((url, index) => ({
        id: `${feed.id}_${index}`,
        type: 'image',
        url: url
      }))
    } : undefined;

    const userLiked = feed.userLiked !== undefined 
      ? feed.userLiked 
      : false;

    const dbCommentsArray = feed.comments && Array.isArray(feed.comments) ? feed.comments : [];
    const commentsCount = dbCommentsArray.length;
    
    if (feed.commentsCount !== undefined && feed.commentsCount !== dbCommentsArray.length) {
      console.warn('⚠️ Comment count mismatch - using database array length as source of truth:', {
        feedId: feed.id,
        commentsCountField: feed.commentsCount,
        databaseArrayLength: dbCommentsArray.length,
        finalCount: commentsCount
      });
    }

    const isDeletedUser = feed.userProfile?.fullName === '[Deleted User]' || 
                          feed.userProfile?.username?.startsWith('[deleted_') ||
                          (feed.userProfile as any)?.isDeleted === true;
    
    const feedCardData = {
      id: feed.id,
      name: isDeletedUser 
        ? '[Deleted User]' 
        : (feed.userProfile?.fullName || 'Unknown User'),
      handle: isDeletedUser 
        ? `[deleted_${feed.userId.substring(0, 8)}]` 
        : (feed.userProfile?.username || 'unknown'),
      time: timeAgo,
      avatar: isDeletedUser 
        ? null 
        : (feed.userProfile?.profileImageUrl || feed.userProfile?.profilePicture || null),
      verified: false,
      content: feed.message,
      emojis: [],
      media: media,
      replies: commentsCount,
      retweets: 0,
      likes: feed.likesCount !== undefined ? feed.likesCount : (feed.likes?.length || 0),
      likedByUserIds: feed.likes || [],
      userLiked: userLiked,
      bookmarks: 0,
      views: 0
    };

    console.log('🔄 Converting feed to FeedCard format:', {
      feedId: feed.id,
      userId: feed.userId,
      userLiked: feed.userLiked,
      userLikedFromBackend: feed.userLiked,
      likesArray: feed.likes,
      likesCount: feed.likesCount,
      calculatedUserLiked: userLiked,
      finalUserLiked: feedCardData.userLiked,
      userProfile: feed.userProfile,
      profileImageUrl: feed.userProfile?.profileImageUrl,
      profilePicture: feed.userProfile?.profilePicture,
      finalAvatar: feedCardData.avatar,
      finalName: feedCardData.name,
      finalHandle: feedCardData.handle
    });

    return feedCardData;
  };

  const handleMessagesPress = useCallback(() => {
    messagesSlideAnim.setValue(width);
    setMessagesVisible(true);
    
    setTimeout(() => {
      Animated.timing(messagesSlideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }, 30);
  }, [messagesSlideAnim, width]);

  const handleCloseMessages = useCallback(() => {
    Animated.timing(messagesSlideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setMessagesVisible(false);
    });
  }, [messagesSlideAnim, width]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
    
    fetchFeeds(0, true);
  }, [fetchFeeds, spinValue]);

  const loadMoreData = useCallback(() => {
    if (!loading && hasMoreData) {
      fetchFeeds(currentPage + 1, false);
    }
  }, [loading, hasMoreData, currentPage, fetchFeeds]);

  return (
    <View style={{ flex: 1, backgroundColor: tabStyles.screen.backgroundColor }}>
      <HomeHeader
        activeTab={activeTab}
        onTabPress={setActiveTab}
        onMessagesPress={handleMessagesPress}
        tabs={tabs}
      />
      
      <View style={{ flex: 1, paddingTop: 130, backgroundColor: tabStyles.screen.backgroundColor }}>
        {activeTab === 'Local Pulse' ? (
          <LocalPulse />
        ) : activeTab === 'Public Safety' ? (
          <PublicSafety />
        ) : activeTab === 'Communities' ? (
          <Communities />
        ) : (
         <ScrollView 
           style={{ flex: 1, backgroundColor: tabStyles.content.backgroundColor }}
           showsVerticalScrollIndicator={false}
           contentContainerStyle={{ paddingTop: 32, paddingBottom: 100 }}
           refreshControl={
             <RefreshControl 
               refreshing={refreshing} 
               onRefresh={onRefresh}
               tintColor={isDark ? '#FFFFFF' : '#000000'}
               colors={[isDark ? '#FFFFFF' : '#000000']}
             />
           }
           onScroll={({ nativeEvent }) => {
             const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
             const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
             if (isCloseToBottom) {
               loadMoreData();
             }
           }}
           scrollEventThrottle={400}
         >
          {loading && feeds.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
              <ActivityIndicator size="large" color="#1DA1F2" />
              <Text style={{ marginTop: 16, fontSize: 16, color: '#657786' }}>
                Loading feeds from BharathVA...
              </Text>
            </View>
          ) : error ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
              <Text style={{ fontSize: 16, color: '#E0245E', textAlign: 'center', marginBottom: 16 }}>
                {error}
              </Text>
              <Pressable
                onPress={() => fetchFeeds(0, true)}
                style={{
                  backgroundColor: '#1DA1F2',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Retry</Text>
              </Pressable>
            </View>
          ) : feeds.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
              <Text style={{ fontSize: 16, color: '#657786', textAlign: 'center' }}>
                No feeds available yet. Be the first to post!
              </Text>
            </View>
          ) : (
            feeds.map((feed) => {
              const feedCardData = convertToFeedCardFormat(feed);
              return (
            <FeedCard
                  key={feed.id}
                  id={feedCardData.id}
                  name={feedCardData.name}
                  handle={feedCardData.handle}
                  time={feedCardData.time}
                  avatar={feedCardData.avatar}
                  verified={feedCardData.verified}
                  content={feedCardData.content}
                  emojis={feedCardData.emojis}
                  media={feedCardData.media}
                  replies={feedCardData.replies}
                  retweets={feedCardData.retweets}
                  likes={feedCardData.likes}
                  likedByUserIds={feedCardData.likedByUserIds}
                  userLiked={feedCardData.userLiked}
                  bookmarks={feedCardData.bookmarks}
                  views={feedCardData.views}
                  onPress={() => console.log('Feed pressed:', feed.id)}
                  onReply={() => console.log('Reply to:', feed.id)}
                  onRetweet={() => console.log('Retweet:', feed.id)}
                  onLike={() => console.log('Like:', feed.id)}
                  onBookmark={() => console.log('Bookmark:', feed.id)}
                  onShare={() => console.log('Share:', feed.id)}
                  onFeedPress={(feedId) => {
                    console.log('Feed comment added, refreshing feed:', feedId);
                    fetchFeeds(0, true);
                  }}
                />
              );
            })
          )}
          
          {loading && feeds.length > 0 && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#1DA1F2" />
            </View>
          )}
        </ScrollView>
        )}
      </View>

      <Modal
        visible={messagesVisible}
        animationType="none"
        presentationStyle="overFullScreen"
        onRequestClose={handleCloseMessages}
        transparent={true}
        statusBarTranslucent={true}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
        }}>
          <Animated.View
            style={{
              flex: 1,
              transform: [{ translateX: messagesSlideAnim }],
              backgroundColor: 'white',
              shadowColor: '#000',
              shadowOffset: { width: -5, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <MessagesScreen onClose={handleCloseMessages} />
            <Pressable
              style={({ pressed }) => ({
                position: 'absolute',
                top: 50,
                left: 20,
                zIndex: 1000,
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: 25,
                width: 50,
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              })}
              onPress={handleCloseMessages}
            >
              <Text style={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: 18,
                textAlign: 'center',
              }}>✕</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
