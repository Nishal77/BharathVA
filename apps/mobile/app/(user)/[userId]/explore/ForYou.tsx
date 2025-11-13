import React, { useState, useEffect } from "react";
import { View, ScrollView, Dimensions, Text, Image, Pressable, StyleSheet, useColorScheme, ActivityIndicator, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from 'expo-font';
import { useTabStyles } from '../../../../hooks/useTabStyles';
import TodaysNew from './TodaysNew';
import { newsService, NewsItem } from '../../../../services/api/newsService';
import NewsDetailScreen from '../../../../components/NewsDetailScreen';
import { getRelativeTime } from '../../../../utils/timeUtils';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.68;
const CARD_MARGIN = 16;
const CARD_IMAGE_HEIGHT = CARD_WIDTH * 0.60;

interface CardData {
  id: string;
  image: string;
  category: string;
  title: string;
  author: string;
  authorAvatar: string;
  date: string;
  trendingNumber?: number;
  sourceAvatars: string[];
  sourceCount: number;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1 ? 'Just Now' : `${diffMinutes} Minutes Ago`;
      }
      return diffHours === 1 ? '1 Hour Ago' : `${diffHours} Hours Ago`;
    } else if (diffDays === 1) {
      return '1 Day Ago';
    } else if (diffDays < 7) {
      return `${diffDays} Days Ago`;
    } else {
      const diffWeeks = Math.floor(diffDays / 7);
      return diffWeeks === 1 ? '1 Week Ago' : `${diffWeeks} Weeks Ago`;
    }
  } catch (error) {
    return 'Recently';
  }
};

const transformNewsToCardData = (newsItems: NewsItem[]): CardData[] => {
  return newsItems.map((item, index) => {
    // Bulletproof image URL with multiple fallbacks
    let imageUrl = item.imageUrl || '';
    
    // Validate and sanitize image URL
    if (!imageUrl || imageUrl.trim() === '') {
      // Source-specific fallback images
      const source = (item.source || '').toLowerCase();
      if (source.includes('india today')) {
        imageUrl = 'https://akm-img-a-in.tosshub.com/sites/all/themes/itg/logo.png';
      } else if (source.includes('indian express')) {
        imageUrl = 'https://indianexpress.com/wp-content/themes/indianexpress/images/indian-express-logo-n.svg';
      } else if (source.includes('ndtv')) {
        imageUrl = 'https://drop.ndtv.com/homepage/images/ndtvlogo_new.png';
      } else if (source.includes('times of india')) {
        imageUrl = 'https://static.toiimg.com/photo/msid-97054851.cms';
      } else {
        imageUrl = 'https://via.placeholder.com/800x600/FF6B35/FFFFFF?text=BharathVA+News';
      }
    }
    
    // Ensure HTTPS
    if (imageUrl.startsWith('http://')) {
      imageUrl = imageUrl.replace('http://', 'https://');
    }
    
    return {
    id: item.id.toString(),
      image: imageUrl,
    category: item.category || item.source || 'News',
    title: item.title,
      author: item.author || item.source || 'BharathVA',
    authorAvatar: getSourceLogo(item.source || item.author),
      date: getRelativeTime(item.publishedAt), // Real-time timestamp
    trendingNumber: index < 10 ? index + 1 : undefined,
    sourceAvatars: getRandomAvatarUrls(),
    sourceCount: Math.floor(Math.random() * (50 - 3 + 1)) + 3, // Random number between 3 and 50
    };
  });
};

const getSourceLogo = (source?: string): string => {
  if (!source) {
    return 'https://via.placeholder.com/100/FF6B35/FFFFFF?text=BV';
  }
  
  const sourceLower = source.toLowerCase();
  
  // Real news source logos/profile images
  if (sourceLower.includes('india today') || sourceLower.includes('indiatoday')) {
    return 'https://akm-img-a-in.tosshub.com/sites/all/themes/itg/logo.png';
  } else if (sourceLower.includes('indian express') || sourceLower.includes('indianexpress')) {
    return 'https://indianexpress.com/wp-content/themes/indianexpress/images/indian-express-logo-n.svg';
  } else if (sourceLower.includes('ndtv')) {
    return 'https://drop.ndtv.com/homepage/images/ndtvlogo_new.png';
  } else if (sourceLower.includes('times of india') || sourceLower.includes('toi')) {
    return 'https://static.toiimg.com/photo/msid-97054851.cms';
  } else if (sourceLower.includes('hindustan times') || sourceLower.includes('hindustantimes')) {
    return 'https://www.hindustantimes.com/resizer/2x/ht-logo.png';
  } else if (sourceLower.includes('the hindu')) {
    return 'https://www.thehindu.com/static/theme/default/base/img/logo.png';
  } else if (sourceLower.includes('business standard')) {
    return 'https://www.business-standard.com/assets/img/bs_logo.png';
  } else if (sourceLower.includes('mint')) {
    return 'https://www.livemint.com/lm-img/logo.png';
  } else if (sourceLower.includes('firstpost')) {
    return 'https://www.firstpost.com/wp-content/themes/firstpost/images/firstpost-logo.png';
  } else if (sourceLower.includes('news18')) {
    return 'https://www.news18.com/images/news18-logo.png';
  } else {
    // Default BharathVA logo for unknown sources
    return 'https://via.placeholder.com/100/FF6B35/FFFFFF?text=BV';
  }
};

const getRandomAvatarUrls = (): string[] => {
  const avatars = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
    'https://i.pravatar.cc/150?img=5',
    'https://i.pravatar.cc/150?img=6',
    'https://i.pravatar.cc/150?img=7',
    'https://i.pravatar.cc/150?img=8',
    'https://i.pravatar.cc/150?img=9',
    'https://i.pravatar.cc/150?img=10',
    'https://i.pravatar.cc/150?img=11',
    'https://i.pravatar.cc/150?img=12',
    'https://i.pravatar.cc/150?img=13',
    'https://i.pravatar.cc/150?img=14',
    'https://i.pravatar.cc/150?img=15',
  ];
  
  const shuffled = [...avatars].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
};

interface ForYouProps {
  onVideoPress?: () => void;
}

export default function ForYou({ onVideoPress }: ForYouProps) {
  const tabStyles = useTabStyles();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    'Satoshi-Regular': require('../../../../assets/fonts/Satoshi-Regular.otf'),
    'Satoshi-Medium': require('../../../../assets/fonts/Satoshi-Medium.otf'),
  });

  useEffect(() => {
    fetchNews();
    
    const refreshInterval = setInterval(() => {
      fetchNews();
    }, 15 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await newsService.getTrendingNews(0, 10);
      
      if (response && response.content && response.content.length > 0) {
        const transformedCards = transformNewsToCardData(response.content.slice(0, 10));
        // Source logos are already set by getSourceLogo function in transformNewsToCardData
        setCards(transformedCards);
      } else {
        setError('No news available');
      }
    } catch (err: any) {
      console.error('Error fetching news:', err);
      setError(err.message || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const handleMoreOptions = (id: string) => {
    console.log('More options for card:', id);
  };

  const handleCardPress = (id: string) => {
    setSelectedNewsId(parseInt(id));
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setSelectedNewsId(null);
    }, 300);
  };

  const renderCard = (card: CardData) => (
    <Pressable
      key={card.id}
      onPress={() => handleCardPress(card.id)}
      style={[
        styles.card,
        {
          backgroundColor: tabStyles.screen.backgroundColor,
          borderColor: isDark ? '#2B2B2B' : '#E5E5E5',
          shadowColor: isDark ? '#000' : '#000',
        },
      ]}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: card.image }}
          style={styles.cardImage}
          resizeMode="cover"
          onError={(e) => {
            console.log('Image load error, fallback already applied:', card.image);
          }}
        />
      </View>

      {/* Content Section */}
      <View style={[styles.cardContent, { backgroundColor: tabStyles.screen.backgroundColor }]}>
        {/* Date Row */}
        <View style={styles.trendingRow}>
          {card.trendingNumber && (
            <View style={styles.trendingContainer}>
              <Ionicons name="flame" size={14} color="#FF6B35" />
              <Text style={styles.trendingText}>Trending No.{card.trendingNumber}</Text>
            </View>
          )}
          <Text style={[styles.dateText, { color: tabStyles.text.inactive }]}>
            {card.date}
          </Text>
        </View>

        {/* Title */}
        <Text
          style={[
            styles.cardTitle,
            { color: tabStyles.text.active },
          ]}
          numberOfLines={3}
        >
          {card.title}
        </Text>

        {/* Source Row - Fixed at Bottom */}
        <View style={styles.authorRow}>
          <View style={styles.authorLeft}>
            <View style={styles.avatarGroup}>
              {card.sourceAvatars.map((avatarUrl, index) => (
                <View
                  key={index}
                  style={[
                    styles.sourceAvatarContainer,
                    { marginLeft: index > 0 ? -5 : 0 }
                  ]}
                >
              <Image
                    source={{ uri: avatarUrl }}
                    style={styles.sourceAvatar}
                onError={() => {
                      console.log('Avatar failed to load:', avatarUrl);
                }}
              />
                </View>
              ))}
            </View>
            <Text
              style={[
                styles.sourcesText,
                { color: tabStyles.text.inactive },
              ]}
            >
              {card.sourceCount} sources
            </Text>
          </View>
          <Pressable
            onPress={() => handleMoreOptions(card.id)}
            style={styles.moreButton}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={18}
              color={tabStyles.text.inactive}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: tabStyles.screen.backgroundColor, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={tabStyles.text.active} />
        <Text style={{ marginTop: 16, color: tabStyles.text.inactive, fontFamily: 'Satoshi-Regular' }}>Loading news...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: tabStyles.screen.backgroundColor, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Ionicons name="alert-circle-outline" size={48} color={tabStyles.text.inactive} />
        <Text style={{ marginTop: 16, color: tabStyles.text.inactive, textAlign: 'center', fontFamily: 'Satoshi-Regular' }}>{error}</Text>
        <Pressable
          onPress={fetchNews}
          style={{
            marginTop: 16,
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: '#FF6B35',
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontFamily: 'Satoshi-Regular' }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: tabStyles.screen.backgroundColor }}>
      {/* Horizontal Scrolling Cards */}
      {cards.length > 0 && (
        <View style={{ paddingTop: 20 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingBottom: 24,
            }}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + CARD_MARGIN}
            snapToAlignment="start"
          >
            {cards.map(renderCard)}
          </ScrollView>
        </View>
      )}

      {/* Today's News Section */}
      <TodaysNew />

      {/* News Detail Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        {selectedNewsId && (
          <NewsDetailScreen 
            newsId={selectedNewsId} 
            onClose={handleCloseModal} 
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    // shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  imageContainer: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    padding: 8,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  cardContent: {
    padding: 18,
    minHeight: 140,
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  trendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B35',
    fontFamily: 'Satoshi-Regular',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'Satoshi-Regular',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 12,
    letterSpacing: -0.2,
    flex: 1,
    fontFamily: 'Satoshi-Medium',
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 8,
  },
  authorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  sourceAvatarContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sourceAvatar: {
    width: '100%',
    height: '100%',
  },
  sourcesText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
    lineHeight: 16,
    fontFamily: 'Satoshi-Regular',
  },
  moreButton: {
    padding: 4,
  },
});
