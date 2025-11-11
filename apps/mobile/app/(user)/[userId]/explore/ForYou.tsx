import React, { useState, useEffect } from "react";
import { View, ScrollView, Dimensions, Text, Image, Pressable, StyleSheet, useColorScheme, ActivityIndicator, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
    authorAvatar: getDefaultAvatar(item.source || item.author),
      date: getRelativeTime(item.publishedAt), // Real-time timestamp
    trendingNumber: index < 5 ? index + 1 : undefined,
    };
  });
};

const getDefaultAvatar = (source?: string): string => {
  const avatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
  ];
  if (source) {
    const hash = source.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatars[hash % avatars.length];
  }
  return avatars[0];
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
        transformedCards.forEach((card, index) => {
          if (!card.authorAvatar || card.authorAvatar === 'https://via.placeholder.com/100?text=Author') {
            card.authorAvatar = getDefaultAvatar(card.author);
          }
        });
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
        {card.trendingNumber && card.trendingNumber <= 3 && (
          <View style={styles.trendingBadge}>
            <Ionicons name="flame" size={16} color="#FFFFFF" />
            <Text style={styles.trendingBadgeText}>#{card.trendingNumber}</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={[styles.cardContent, { backgroundColor: tabStyles.screen.backgroundColor }]}>
        {/* Trending and Date Row */}
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

        {/* Author Row */}
        <View style={styles.authorRow}>
          <View style={styles.authorLeft}>
            <View style={styles.authorAvatarContainer}>
              <Image
                source={{ uri: card.authorAvatar }}
                style={styles.authorAvatar}
              />
            </View>
            <Text
              style={[
                styles.authorName,
                { color: tabStyles.text.active },
              ]}
            >
              {card.author}
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

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: tabStyles.screen.backgroundColor, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={tabStyles.text.active} />
        <Text style={{ marginTop: 16, color: tabStyles.text.inactive }}>Loading news...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: tabStyles.screen.backgroundColor, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Ionicons name="alert-circle-outline" size={48} color={tabStyles.text.inactive} />
        <Text style={{ marginTop: 16, color: tabStyles.text.inactive, textAlign: 'center' }}>{error}</Text>
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
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Retry</Text>
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
      <TodaysNew 
        onNewsPress={(newsItem) => {
          handleCardPress(newsItem.id.toString());
        }}
      />

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
  trendingBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  trendingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 18,
    minHeight: 140,
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
  },
  dateText: {
    fontSize: 11,
    fontWeight: '400',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatarContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 10,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  authorAvatar: {
    width: '100%',
    height: '100%',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
  },
  moreButton: {
    padding: 4,
  },
});
