import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View
} from 'react-native';
import HomeHeader from '../../../../components/HomeHeader';
import MessagesScreen from '../../../../components/messages/MessagesScreen';
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
  const [messagesVisible, setMessagesVisible] = useState(false);
  const messagesSlideAnim = useRef(new Animated.Value(width)).current;
  const tabStyles = useTabStyles();

  const tabs = ['For you', 'Following', 'Local', 'Communities', 'Shorts/Video', 'Space(Live)'];

  // Sample tweet data with Indian names and content - No images
  const [sampleTweets, setSampleTweets] = useState([
    {
      id: '1',
      name: 'Priya Sharma',
      handle: 'priya_tech',
      time: '2h',
      avatar: 'https://picsum.photos/seed/priya/300/300?random=1',
      verified: true,
      content: "Building the next generation of fintech solutions from Bangalore! India's startup ecosystem is truly inspiring. #StartupIndia #TechForGood",
      emojis: ['🚀', '🇮🇳'],
      replies: 45,
      retweets: 28,
      likes: 234,
      bookmarks: 12,
      views: 128
    },
    {
      id: '2',
      name: 'Arjun Patel',
      handle: 'arjun_dev',
      time: '4h',
      avatar: 'https://picsum.photos/seed/arjun/300/300?random=2',
      verified: false,
      content: "Just witnessed the most beautiful sunrise over the Ganges in Varanasi. The spiritual energy here is unmatched. 🙏 #IncredibleIndia",
      emojis: ['🌅', '🙏'],
      replies: 32,
      retweets: 15,
      likes: 189,
      bookmarks: 8,
      views: 128
    },
    {
      id: '3',
      name: 'Kavya Reddy',
      handle: 'kavya_music',
      time: '6h',
      avatar: 'https://picsum.photos/seed/kavya/300/300?random=3',
      verified: false,
      content: "Performing at the Mysore Palace this evening! Classical music has such deep roots in our culture. Feeling blessed to be part of this tradition.",
      emojis: ['🎵', '🏛️'],
      replies: 28,
      retweets: 42,
      likes: 167,
      bookmarks: 15,
      views: 128
    },
    {
      id: '4',
      name: 'Rohit Kumar',
      handle: 'rohit_cricket',
      time: '8h',
      avatar: 'https://picsum.photos/seed/rohit/300/300?random=4',
      verified: true,
      content: "Another day of training at the National Cricket Academy! The passion for cricket in India is unmatched. Dreaming of representing the country one day! 🏏",
      emojis: ['🏏', '💪'],
      replies: 67,
      retweets: 89,
      likes: 456,
      bookmarks: 23,
      views: 128
    },
    {
      id: '5',
      name: 'Sneha Gupta',
      handle: 'sneha_art',
      time: '10h',
      avatar: 'https://picsum.photos/seed/sneha/300/300?random=5',
      verified: false,
      content: "Working on a new series inspired by the vibrant colors of Rajasthan. Indian art and culture are a constant source of inspiration for my work.",
      emojis: ['🎨', '🌈'],
      replies: 19,
      retweets: 31,
      likes: 145,
      bookmarks: 9,
      views: 128
    },
    {
      id: '6',
      name: 'Vikram Singh',
      handle: 'vikram_space',
      time: '12h',
      avatar: 'https://picsum.photos/seed/vikram/300/300?random=6',
      verified: true,
      content: "ISRO's achievements make every Indian proud! From Mars Mission to Chandrayaan, we're reaching for the stars. The future of space exploration is bright! 🚀",
      emojis: ['🚀', '🌕'],
      replies: 89,
      retweets: 156,
      likes: 789,
      bookmarks: 45,
      views: 128
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

    // Simulate API call - add new tweet to the top
    setTimeout(() => {
      const indianNames = [
        { name: 'Amit Kumar', handle: 'amit_tech', content: "Just finished building an AI chatbot for Indian languages! Making technology more accessible for everyone. #DigitalIndia #AI" },
        { name: 'Deepika Singh', handle: 'deepika_food', content: "Made the most delicious biryani today! Nothing beats the aroma of authentic Indian spices. Sharing the recipe with my followers soon! 🍛" },
        { name: 'Rajesh Verma', handle: 'rajesh_business', content: "Attending the Startup India event in Delhi today. The energy and innovation in our ecosystem is incredible! Proud to be part of this journey." },
        { name: 'Anjali Mehta', handle: 'anjali_yoga', content: "Morning yoga session overlooking the Himalayas. The peace and serenity here is unmatched. This is what inner peace feels like! 🧘‍♀️" },
        { name: 'Suresh Reddy', handle: 'suresh_education', content: "Teaching coding to underprivileged children in Hyderabad. Every child deserves access to quality education and technology. #EducationForAll" }
      ];
      
      const randomUser = indianNames[Math.floor(Math.random() * indianNames.length)];
      
      const newTweet = {
        id: Date.now().toString(),
        name: randomUser.name,
        handle: randomUser.handle,
        time: 'now',
        avatar: `https://picsum.photos/seed/${randomUser.handle}/300/300`,
        verified: Math.random() > 0.7,
        content: randomUser.content,
        emojis: ['🇮🇳', '✨'],
        replies: Math.floor(Math.random() * 50),
        retweets: Math.floor(Math.random() * 30),
        likes: Math.floor(Math.random() * 200),
        bookmarks: Math.floor(Math.random() * 20),
        views: 128
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
        onMessagesPress={handleMessagesPress}
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
              replies={tweet.replies}
              retweets={tweet.retweets}
              likes={tweet.likes}
              bookmarks={tweet.bookmarks}
              views={tweet.views}
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
