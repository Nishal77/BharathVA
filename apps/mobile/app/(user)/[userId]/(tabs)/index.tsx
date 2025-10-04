import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  View
} from 'react-native';
import HomeHeader from '../../../../components/HomeHeader';
import TweetCard from '../../../../components/tweet/TweetCard';
import { Sidebar } from '../../../../components/ui';
import { useSidebar } from '../../../../contexts/SidebarContext';
import { useTabStyles } from '../../../../hooks/useTabStyles';

const { width, height } = Dimensions.get('window');

// Constants
const ANIMATION_DURATION = 300;

export default function HomeScreen() {
  const { userId } = useLocalSearchParams();
  const { sidebarVisible, setSidebarVisible, sidebarWidth } = useSidebar();
  const slideAnim = useRef(new Animated.Value(-sidebarWidth)).current;
  const [activeTab, setActiveTab] = useState('For you');
  const [refreshing, setRefreshing] = useState(false);
  const tabStyles = useTabStyles();

  const tabs = ['For you', 'Following', 'Trending India', 'Local', 'Communities', 'Shorts/Video', 'Space(Live)'];

  // Sample tweet data based on the reference image - Professional layout
  const [sampleTweets, setSampleTweets] = useState([
    {
      id: '1',
      name: 'Neerja Thakkar',
      handle: 'neerjathakkar',
      time: '1d',
      avatar: 'https://picsum.photos/seed/profile/300/300?random=1',
      verified: false,
      content: "I've joined @GoogleDeepMind as a Student Researcher working on video models of animal motion in London",
      emojis: ['🐆', '🇬🇧'],
      media: {
        type: 'single' as const,
        items: [
          {
            id: '1',
            type: 'image' as const,
            image: 'https://picsum.photos/seed/google-office/800/600?random=1'
          }
        ]
      },
      replies: 24,
      retweets: 12,
      likes: 156,
      bookmarks: 8
    },
    {
      id: '2',
      name: 'Alex Chen',
      handle: 'alexchen_dev',
      time: '3h',
      avatar: 'https://picsum.photos/seed/alex/300/300?random=2',
      verified: true,
      content: "Just shipped a new feature for our React Native app! The performance improvements are incredible 🚀 Can't wait to see the user feedback.",
      emojis: ['🚀', '💻'],
      media: {
        type: 'single' as const,
        items: [
          {
            id: '2',
            type: 'image' as const,
            image: 'https://picsum.photos/seed/tech/800/600?random=2'
          }
        ]
      },
      replies: 42,
      retweets: 28,
      likes: 234,
      bookmarks: 15
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      handle: 'sarah_j',
      time: '6h',
      avatar: 'https://picsum.photos/seed/sarah/300/300?random=3',
      verified: false,
      content: "Beautiful sunset from my balcony today 🌅 Sometimes you just need to pause and appreciate the little moments in life.",
      emojis: ['🌅', '✨'],
      media: {
        type: 'single' as const,
        items: [
          {
            id: '3',
            type: 'image' as const,
            image: 'https://picsum.photos/seed/sunset/800/600?random=3'
          }
        ]
      },
      replies: 18,
      retweets: 35,
      likes: 189,
      bookmarks: 7
    },
    {
      id: '4',
      name: 'Marcus Rodriguez',
      handle: 'marcus_r',
      time: '12h',
      avatar: 'https://picsum.photos/seed/marcus/300/300?random=4',
      verified: false,
      content: "Coffee and code - the perfect combination ☕️ Working on some exciting AI projects this weekend. The future is here!",
      emojis: ['☕️', '🤖'],
      media: {
        type: 'single' as const,
        items: [
          {
            id: '4',
            type: 'image' as const,
            image: 'https://picsum.photos/seed/coffee/800/600?random=4'
          }
        ]
      },
      replies: 31,
      retweets: 19,
      likes: 167,
      bookmarks: 12
    }
  ]);

  const handleProfilePress = React.useCallback(() => {
    setSidebarVisible(true);
    
    // Animate sidebar sliding in
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [slideAnim, setSidebarVisible]);

  const handleCloseSidebar = React.useCallback(() => {
    // Animate sidebar sliding out
    Animated.timing(slideAnim, {
      toValue: -sidebarWidth,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setSidebarVisible(false);
    });
  }, [slideAnim, sidebarWidth, setSidebarVisible]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Simulate API call - add new tweet to the top
    setTimeout(() => {
      const newTweet = {
        id: Date.now().toString(),
        name: 'New User',
        handle: 'newuser_' + Math.floor(Math.random() * 1000),
        time: 'now',
        avatar: `https://picsum.photos/seed/new${Math.floor(Math.random() * 100)}/300/300`,
        verified: Math.random() > 0.7,
        content: "Fresh content just loaded! 🚀 This is a new tweet from the pull-to-refresh feature.",
        emojis: ['🚀', '✨'],
        media: {
          type: 'single' as const,
          items: [
            {
              id: Date.now().toString(),
              type: 'image' as const,
              image: `https://picsum.photos/seed/fresh${Math.floor(Math.random() * 100)}/800/600`
            }
          ]
        },
        replies: Math.floor(Math.random() * 50),
        retweets: Math.floor(Math.random() * 30),
        likes: Math.floor(Math.random() * 200),
        bookmarks: Math.floor(Math.random() * 20)
      };

      // Add new tweet to the beginning of the array
      setSampleTweets(prevTweets => [newTweet, ...prevTweets]);
      setRefreshing(false);
    }, 1500);
  }, []);


  return (
    <View style={{ flex: 1, backgroundColor: tabStyles.screen.backgroundColor }}>
      {/* Home Header Component */}
      <HomeHeader
        activeTab={activeTab}
        onTabPress={setActiveTab}
        onProfilePress={handleProfilePress}
        tabs={tabs}
      />
      
      {/* Main Content Container with Header Spacing */}
      <View style={{ flex: 1, paddingTop: 130, backgroundColor: tabStyles.screen.backgroundColor }}>

         {/* Tweet Feed */}
         <ScrollView 
           style={{ flex: 1, backgroundColor: tabStyles.content.backgroundColor }}
           showsVerticalScrollIndicator={false}
           contentContainerStyle={{ paddingTop: 32, paddingBottom: 100 }}
           refreshControl={
             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
           }
         >
          {sampleTweets.map((tweet) => (
            <TweetCard
              key={tweet.id}
              id={tweet.id}
              name={tweet.name}
              handle={tweet.handle}
              time={tweet.time}
              avatar={tweet.avatar}
              verified={tweet.verified}
              content={tweet.content}
              emojis={tweet.emojis}
              media={tweet.media}
              replies={tweet.replies}
              retweets={tweet.retweets}
              likes={tweet.likes}
              bookmarks={tweet.bookmarks}
              onPress={() => console.log('Tweet pressed:', tweet.id)}
              onReply={() => console.log('Reply to:', tweet.id)}
              onRetweet={() => console.log('Retweet:', tweet.id)}
              onLike={() => console.log('Like:', tweet.id)}
              onBookmark={() => console.log('Bookmark:', tweet.id)}
              onShare={() => console.log('Share:', tweet.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Backdrop when sidebar is open - Above main content, below sidebar */}
      {sidebarVisible && (
        <Pressable
          className="absolute inset-0 bg-black/40"
          style={{
            zIndex: 1000, // Above main content but below sidebar
            elevation: 1000, // For Android
          }}
          onPress={handleCloseSidebar}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar 
        sidebarVisible={sidebarVisible}
        setSidebarVisible={setSidebarVisible}
        sidebarWidth={sidebarWidth}
        slideAnim={slideAnim}
        userId={userId as string}
      />
    </View>
  );
}
