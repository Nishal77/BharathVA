import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  Dimensions,
  StatusBar,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { newsService, NewsDetailResponse } from '../services/api/newsService';
import { BlurView } from 'expo-blur';
import { useFonts } from 'expo-font';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Language Icon Component
const LanguageIcon = ({ color = '#1c1f21', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 18 18">
    <Path d="M2.25 4.25H10.25" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M6.25 2.25V4.25" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M4.25 4.25C4.3353 6.7587 5.9446 8.94141 8.2746 9.78371" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M8.25 4.25C7.85 9.875 2.25 10.25 2.25 10.25" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M9.25 15.75L12.25 7.75H12.75L15.75 15.75" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M10.188 13.25H14.813" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

// Green Checkmark Icon Component
const CheckmarkIcon = ({ color = '#10B981', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Path
      d="M2.75 9.25 L6.75 14.25 L15.25 3.75"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface NewsDetailScreenProps {
  newsId: number;
  onClose: () => void;
}

export default function NewsDetailScreen({ newsId, onClose }: NewsDetailScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [fontsLoaded] = useFonts({
    'PPEditorialNew-Ultralight': require('../assets/fonts/PPEditorialNew-Ultralight-BF644b21500d0c0.otf'),
    'PPEditorialNew-Regular': require('../assets/fonts/PPEditorialNew-Regular-BF644b214ff145f.otf'),
    'Satoshi-Medium': require('../assets/fonts/Satoshi-Medium.otf'),
    'Satoshi-Regular': require('../assets/fonts/Satoshi-Regular.otf'),
  });

  // Calculate responsive spacing between title and image based on device dimensions
  const calculateImageSpacing = () => {
    const screenHeight = height;
    const screenWidth = width;
    const aspectRatio = screenHeight / screenWidth;
    
    // Base spacing calculation: 1.2% of screen height
    // Adjust for different aspect ratios (taller devices get slightly more spacing)
    let spacing = screenHeight * 0.012;
    
    // Adjust for aspect ratio (taller screens = more spacing, wider screens = less spacing)
    if (aspectRatio > 2.0) {
      // Very tall devices (e.g., iPhone 14 Pro Max)
      spacing = screenHeight * 0.014;
    } else if (aspectRatio > 1.9) {
      // Tall devices (e.g., iPhone 14 Pro)
      spacing = screenHeight * 0.013;
    } else if (aspectRatio < 1.6) {
      // Wider devices (e.g., tablets in landscape)
      spacing = screenHeight * 0.010;
    }
    
    // Clamp between 8px (minimum) and 20px (maximum) for consistency
    return Math.max(8, Math.min(20, Math.round(spacing)));
  };

  // Calculate responsive title font size based on device width
  const calculateTitleFontSize = () => {
    const screenWidth = width;
    
    // Base font size: 5.0% of screen width (increased for better visibility)
    let fontSize = screenWidth * 0.050;
    
    // Adjust for different screen sizes
    if (screenWidth < 375) {
      // Small devices (e.g., iPhone SE)
      fontSize = screenWidth * 0.048;
    } else if (screenWidth > 414) {
      // Large devices (e.g., iPhone 14 Pro Max, tablets)
      fontSize = screenWidth * 0.052;
    }
    
    // Clamp between 28px (minimum) and 48px (maximum) for better visibility
    return Math.max(28, Math.min(48, Math.round(fontSize)));
  };

  const imageTopSpacing = calculateImageSpacing();
  const titleFontSize = calculateTitleFontSize();

  const [newsDetail, setNewsDetail] = useState<NewsDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    fetchNewsDetail();
  }, [newsId]);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const detail = await newsService.getNewsWithSummary(newsId);
      setNewsDetail(detail);
    } catch (err: any) {
      console.error('Error fetching news detail:', err);
      setError(err.message || 'Failed to load news details');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!newsDetail) return;
    try {
      await Share.share({
        message: `${newsDetail.title}\n\n${newsDetail.summary}\n\nSource: ${newsDetail.source}\nFrom BharathVA News`,
        title: newsDetail.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1 ? 'Just now' : `${diffMinutes}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) {
          return `${diffDays}d ago`;
        } else {
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        }
      }
    } catch {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? '#2B2B2B' : '#E5E5E5' }]}>
          <Pressable onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            News Details
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Loading State */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={[styles.loadingText, { color: isDark ? '#999999' : '#666666' }]}>
            Loading news details...
          </Text>
          <Text style={[styles.aiText, { color: isDark ? '#666666' : '#999999' }]}>
            AI is generating a comprehensive summary
          </Text>
        </View>
      </View>
    );
  }

  if (error || !newsDetail) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? '#2B2B2B' : '#E5E5E5' }]}>
          <Pressable onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            News Details
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Error State */}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B35" />
          <Text style={[styles.errorTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Unable to Load News
          </Text>
          <Text style={[styles.errorMessage, { color: isDark ? '#999999' : '#666666' }]}>
            {error}
          </Text>
          <Pressable onPress={fetchNewsDetail} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header with Blur Effect */}
      <BlurView
        intensity={80}
        tint={isDark ? 'dark' : 'light'}
        style={styles.headerBlur}
      >
        <View style={styles.headerContent}>
          <Pressable onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </Pressable>
          
          {/* Center Content: Avatars + Trending */}
          <View style={styles.headerCenterContent}>
            <View style={styles.avatarsContainer}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
                style={[styles.avatar, styles.avatar1]}
              />
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?img=47' }}
                style={[styles.avatar, styles.avatar2]}
              />
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?img=33' }}
                style={[styles.avatar, styles.avatar3]}
              />
            </View>
            <Text style={[
              styles.trendingText, 
              { 
                color: isDark ? '#FFFFFF' : '#000000',
                fontFamily: fontsLoaded ? 'PPEditorialNew-Regular' : undefined,
              }
            ]}>
              Trending
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton}>
              <LanguageIcon color={isDark ? '#FFFFFF' : '#000000'} size={22} />
            </Pressable>
          </View>
        </View>
      </BlurView>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Content Container - Top Section */}
        <View style={[styles.contentContainer, { paddingBottom: 0 }]}>
          {/* Title */}
          <Text style={[
            styles.title, 
            { 
              color: isDark ? '#FFFFFF' : '#000000',
              fontFamily: fontsLoaded ? 'PPEditorialNew-Ultralight' : undefined,
              fontSize: titleFontSize,
              lineHeight: titleFontSize * 1.25, // 25% line height for better readability
            }
          ]}>
            {newsDetail.title}
          </Text>
        </View>

        {/* Hero Image */}
        {newsDetail.imageUrl && (
          <View style={[styles.imageContainer, { paddingTop: imageTopSpacing }]}>
            <Image
              source={{ uri: newsDetail.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
              onLoad={(event) => {
                setImageLoaded(true);
              }}
            />
            {!imageLoaded && (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
              </View>
            )}
          </View>
        )}

        {/* Content Container - Bottom Section */}
        <View style={styles.contentContainer}>
          {/* Verified News Info */}
          <View style={styles.verifiedNewsContainer}>
            <CheckmarkIcon color="#10B981" size={16} />
            <Text style={[styles.verifiedNewsText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              <Text style={[styles.verifiedNewsLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                Verified News
              </Text>
              <Text style={{ color: '#A1A1A1' }}> • </Text>
              <Text style={[
                styles.updatedText,
                { 
                  color: isDark ? '#CCCCCC' : '#666666',
                  fontFamily: fontsLoaded ? 'Satoshi-Medium' : undefined,
                }
              ]}>
                Updated {formatDate(newsDetail.publishedAt)}
              </Text>
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: isDark ? '#2B2B2B' : '#E5E5E5' }]} />

          {/* Summary Section */}
          <View style={styles.summarySection}>
            <Text style={[
              styles.sectionTitle, 
              { 
                color: isDark ? '#FFFFFF' : '#000000',
                fontFamily: fontsLoaded ? 'Satoshi-Medium' : undefined,
              }
            ]}>
              Overview
            </Text>

            <Text style={[
              styles.summaryText, 
              { 
                color: isDark ? '#CCCCCC' : '#333333',
                fontFamily: fontsLoaded ? 'Satoshi-Regular' : undefined,
              }
            ]}>
              {newsDetail.summary}
            </Text>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 50,
  },
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 50,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenterContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatar1: {
    zIndex: 3,
  },
  avatar2: {
    zIndex: 2,
    marginLeft: -6,
  },
  avatar3: {
    zIndex: 1,
    marginLeft: -6,
  },
  trendingText: {
    fontSize: 15,
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 56 : 94,
  },
  imageContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    padding: 20,
    marginTop: 0,
  },
  verifiedNewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 16,
    gap: 8,
  },
  verifiedNewsText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  verifiedNewsLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  updatedText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    marginBottom: 0,
    letterSpacing: -0.5,
  },
  divider: {
    height: 1,
    marginTop: 0,
    marginBottom: 20,
  },
  summarySection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
  },
  aiText: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
  },
  errorMessage: {
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

