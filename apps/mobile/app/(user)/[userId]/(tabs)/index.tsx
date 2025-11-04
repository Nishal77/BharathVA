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
  Alert,
  useColorScheme
} from 'react-native';
import { Svg, Line } from 'react-native-svg';
import HomeHeader from '../../../../components/HomeHeader';
import MessagesScreen from '../../../../components/messages/MessagesScreen';
import FeedCard from '../../../../components/feed/FeedCard';
import { useTabStyles } from '../../../../hooks/useTabStyles';
import { getAllFeedsWithUserData, EnhancedFeedItem } from '../../../../services/api/feedService';

const { width, height } = Dimensions.get('window');

// Constants
const ANIMATION_DURATION = 300;

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

  // Real feed data from MongoDB
  const [feeds, setFeeds] = useState<EnhancedFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);

  const tabs = ['For you', 'Following', 'Local', 'Communities', 'Shorts/Video', 'Space(Live)'];

  // Custom Loader Component
  const CustomLoader = () => {
    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <Line
            x1="9"
            y1="1.75"
            x2="9"
            y2="4.25"
            fill="none"
            stroke={isDark ? '#FFFFFF' : '#000000'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <Line
            x1="14.127"
            y1="3.873"
            x2="12.359"
            y2="5.641"
            fill="none"
            opacity="0.88"
            stroke={isDark ? '#FFFFFF' : '#000000'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <Line
            x1="16.25"
            y1="9"
            x2="13.75"
            y2="9"
            fill="none"
            opacity="0.75"
            stroke={isDark ? '#FFFFFF' : '#000000'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <Line
            x1="14.127"
            y1="14.127"
            x2="12.359"
            y2="12.359"
            fill="none"
            opacity="0.63"
            stroke={isDark ? '#FFFFFF' : '#000000'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <Line
            x1="9"
            y1="16.25"
            x2="9"
            y2="13.75"
            fill="none"
            opacity="0.5"
            stroke={isDark ? '#FFFFFF' : '#000000'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <Line
            x1="3.873"
            y1="14.127"
            x2="5.641"
            y2="12.359"
            fill="none"
            opacity="0.38"
            stroke={isDark ? '#FFFFFF' : '#000000'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <Line
            x1="1.75"
            y1="9"
            x2="4.25"
            y2="9"
            fill="none"
            opacity="0.25"
            stroke={isDark ? '#FFFFFF' : '#000000'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <Line
            x1="3.873"
            y1="3.873"
            x2="5.641"
            y2="5.641"
            fill="none"
            opacity="0.13"
            stroke={isDark ? '#FFFFFF' : '#000000'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </Svg>
      </Animated.View>
    );
  };

  // Fetch feeds from MongoDB
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
        
        // Check if we have more data
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
      
      // Stop spinner animation
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }
  }, []);

  // Load feeds on component mount
  useEffect(() => {
    fetchFeeds(0, true);
  }, [fetchFeeds]);

  // Convert feed data to FeedCard format
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

    // Convert imageUrls to media format
    const media = feed.imageUrls && feed.imageUrls.length > 0 ? {
      type: feed.imageUrls.length === 1 ? 'single' : 'grid' as 'single' | 'grid',
      items: feed.imageUrls.map((url, index) => ({
        id: `${feed.id}_${index}`,
        type: 'image',
        url: url
      }))
    } : undefined;

    // Calculate if current user has liked this post
    // Use feed.userLiked from backend if available (most reliable)
    // Otherwise, check if current authenticated user's ID is in the likes array
    // Note: userId from useLocalSearchParams is the profile being viewed, NOT the authenticated user
    // We need to extract the authenticated user ID from the token or use feed.userLiked from backend
    const userLiked = feed.userLiked !== undefined 
      ? feed.userLiked 
      : false; // Default to false if backend doesn't provide userLiked (shouldn't happen with auth)

    const feedCardData = {
      id: feed.id,
      name: feed.userProfile?.fullName || 'Unknown User',
      handle: feed.userProfile?.username || 'unknown',
      time: timeAgo,
      avatar: feed.userProfile?.profileImageUrl || feed.userProfile?.profilePicture || null,
      verified: false,
      content: feed.message,
      emojis: [],
      media: media,
      replies: 0, // Real engagement data would come from backend
      retweets: 0,
      likes: feed.likesCount !== undefined ? feed.likesCount : (feed.likes?.length || 0),
      likedByUserIds: feed.likes || [], // Array of user IDs who liked the post
      userLiked: userLiked, // Whether current user has liked this post
      bookmarks: 0,
      views: 0
    };

    // Debug logging
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
    // Set initial position off-screen to the right
    messagesSlideAnim.setValue(width);
    setMessagesVisible(true);
    
    // Small delay to ensure modal is rendered before animation starts
    setTimeout(() => {
      // Animate messages sliding in from right with smooth easing
      Animated.timing(messagesSlideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }, 30);
  }, [messagesSlideAnim, width]);

  const handleCloseMessages = useCallback(() => {
    // Animate messages sliding out to right with smooth easing
    Animated.timing(messagesSlideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setMessagesVisible(false);
    });
  }, [messagesSlideAnim, width]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Start spinner animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
    
    fetchFeeds(0, true);
  }, [fetchFeeds, spinValue]);

  // Load more data for pagination
  const loadMoreData = useCallback(() => {
    if (!loading && hasMoreData) {
      fetchFeeds(currentPage + 1, false);
    }
  }, [loading, hasMoreData, currentPage, fetchFeeds]);


  return (
    <View style={{ flex: 1, backgroundColor: tabStyles.screen.backgroundColor }}>
      {/* Home Header Component */}
      <HomeHeader
        activeTab={activeTab}
        onTabPress={setActiveTab}
        onMessagesPress={handleMessagesPress}
        tabs={tabs}
      />
      
      {/* Main Content Container with Header Spacing */}
      <View style={{ flex: 1, paddingTop: 90, backgroundColor: tabStyles.screen.backgroundColor }}>

         {/* Feed from MongoDB */}
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
                />
              );
            })
          )}
          
          {/* Loading indicator for pagination */}
          {loading && feeds.length > 0 && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#1DA1F2" />
            </View>
          )}
        </ScrollView>
      </View>

      {/* Messages Modal */}
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
