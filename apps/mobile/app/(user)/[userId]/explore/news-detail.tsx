import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  Dimensions,
  Share,
  Linking,
} from 'react-native';
import { useTabStyles } from '../../../../hooks/useTabStyles';
import { newsService, NewsItem, NewsSummaryResponse } from '../../../../services/api/newsService';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function NewsDetailScreen() {
  const tabStyles = useTabStyles();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [news, setNews] = useState<NewsItem | null>(null);
  const [summary, setSummary] = useState<NewsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const newsId = typeof params.id === 'string' ? parseInt(params.id) : null;

  useEffect(() => {
    if (newsId) {
      loadNewsDetail();
      loadNewsSummary();
    }
  }, [newsId]);

  const loadNewsDetail = async () => {
    if (!newsId) return;
    
    try {
      setLoading(true);
      const detail = await newsService.getNewsById(newsId);
      setNews(detail);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load news detail:', err);
      setError(err.message || 'Failed to load news article');
    } finally {
      setLoading(false);
    }
  };

  const loadNewsSummary = async () => {
    if (!newsId) return;
    
    try {
      setSummaryLoading(true);
      const summaryData = await newsService.getNewsSummary(newsId, 1000, 2000);
      setSummary(summaryData);
    } catch (err: any) {
      console.error('Failed to load summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleShare = async () => {
    if (!news) return;
    
    try {
      await Share.share({
        message: `${summary?.catchyHeadline || news.title}\n\n${summary?.summary || news.description || ''}\n\nRead more: ${news.url}`,
        url: news.url,
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleOpenLink = () => {
    if (news?.url) {
      Linking.openURL(news.url);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: tabStyles.screen.backgroundColor, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={{ color: tabStyles.text.secondary, marginTop: 16, fontSize: 14 }}>Loading article...</Text>
      </View>
    );
  }

  if (error || !news) {
    return (
      <View style={{ flex: 1, backgroundColor: tabStyles.screen.backgroundColor, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Ionicons name="alert-circle-outline" size={64} color={tabStyles.text.secondary} />
        <Text style={{ color: tabStyles.text.primary, fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>
          Article Not Found
        </Text>
        <Text style={{ color: tabStyles.text.secondary, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
          {error || 'The news article could not be loaded.'}
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{
            marginTop: 24,
            backgroundColor: '#FF6B35',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerStyle: {
            backgroundColor: tabStyles.screen.backgroundColor,
          },
          headerTintColor: tabStyles.text.primary,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: tabStyles.screen.backgroundColor === '#000000' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 8,
              }}
            >
              <Ionicons name="arrow-back" size={24} color={tabStyles.text.primary} />
            </Pressable>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 8, marginRight: 8 }}>
              <Pressable
                onPress={handleShare}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: tabStyles.screen.backgroundColor === '#000000' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="share-outline" size={20} color={tabStyles.text.primary} />
              </Pressable>
            </View>
          ),
        }}
      />
      
      <ScrollView
        style={{ flex: 1, backgroundColor: tabStyles.screen.backgroundColor }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image/Video Section */}
        {(news.imageUrl || news.videoUrl) && (
          <View style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.6, backgroundColor: tabStyles.screen.backgroundColor === '#000000' ? 'rgba(255,255,255,0.05)' : '#F8F9FA' }}>
            <Image
              source={{ uri: news.videoUrl || news.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
            />
            
            {/* Source Badge Overlay */}
            {news.source && (
              <View style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                backgroundColor: 'rgba(0,0,0,0.7)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}>
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                  {news.source}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Content Section */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {/* Catchy Headline */}
          {summaryLoading ? (
            <View style={{ marginBottom: 16 }}>
              <View style={{ height: 32, backgroundColor: tabStyles.screen.backgroundColor === '#000000' ? 'rgba(255,255,255,0.05)' : '#F0F0F0', borderRadius: 8, marginBottom: 8 }} />
              <View style={{ height: 32, width: '80%', backgroundColor: tabStyles.screen.backgroundColor === '#000000' ? 'rgba(255,255,255,0.05)' : '#F0F0F0', borderRadius: 8 }} />
            </View>
          ) : summary?.catchyHeadline ? (
            <Text style={{
              fontSize: 28,
              fontWeight: '800',
              color: tabStyles.text.primary,
              lineHeight: 36,
              letterSpacing: -0.5,
              marginBottom: 16,
            }}>
              {summary.catchyHeadline}
            </Text>
          ) : (
            <Text style={{
              fontSize: 26,
              fontWeight: '800',
              color: tabStyles.text.primary,
              lineHeight: 34,
              letterSpacing: -0.5,
              marginBottom: 16,
            }}>
              {news.title}
            </Text>
          )}

          {/* Metadata */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            {/* Source Avatar */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#FF6B35',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                  {news.source?.charAt(0) || 'N'}
                </Text>
              </View>
              <Text style={{ color: tabStyles.text.primary, fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                {news.source || 'News Source'}
              </Text>
            </View>

            {/* Divider Dot */}
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: tabStyles.text.secondary }} />

            {/* Time */}
            <Text style={{ color: tabStyles.text.secondary, fontSize: 13, fontWeight: '500' }}>
              {formatTimeAgo(news.publishedAt)}
            </Text>

            {/* Sources Count */}
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: tabStyles.text.secondary }} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="newspaper-outline" size={14} color={tabStyles.text.secondary} />
              <Text style={{ color: tabStyles.text.secondary, fontSize: 13, fontWeight: '500', marginLeft: 4 }}>
                Multiple sources
              </Text>
            </View>
          </View>

          {/* AI Summary Section - Perplexity Style */}
          <View style={{
            backgroundColor: tabStyles.screen.backgroundColor === '#000000' ? 'rgba(255,107,53,0.1)' : 'rgba(255,107,53,0.05)',
            borderLeftWidth: 3,
            borderLeftColor: '#FF6B35',
            borderRadius: 12,
            padding: 20,
            marginBottom: 32,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#FF6B35',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              </View>
              <Text style={{
                color: '#FF6B35',
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                marginLeft: 8,
              }}>
                {summaryLoading ? 'Generating AI Summary' : (summary?.cached ? 'AI Summary' : 'Fresh AI Summary')}
              </Text>
            </View>

            {summaryLoading ? (
              <View>
                <ActivityIndicator size="small" color="#FF6B35" style={{ marginBottom: 12 }} />
                <Text style={{ color: tabStyles.text.secondary, fontSize: 14, lineHeight: 22, fontStyle: 'italic' }}>
                  Analyzing article and generating intelligent summary...
                </Text>
              </View>
            ) : summary?.summary ? (
              <Text style={{
                color: tabStyles.text.primary,
                fontSize: 16,
                lineHeight: 26,
                fontWeight: '400',
                letterSpacing: 0.2,
              }}>
                {summary.summary}
              </Text>
            ) : (
              <Text style={{
                color: tabStyles.text.secondary,
                fontSize: 15,
                lineHeight: 24,
                fontStyle: 'italic',
              }}>
                {news.description || 'No summary available for this article.'}
              </Text>
            )}
          </View>

          {/* Full Description */}
          {news.description && news.description !== summary?.summary && (
            <View style={{ marginBottom: 32 }}>
              <Text style={{
                color: tabStyles.text.primary,
                fontSize: 15,
                lineHeight: 24,
                fontWeight: '400',
                letterSpacing: 0.1,
              }}>
                {news.description}
              </Text>
            </View>
          )}

          {/* Read Full Article Button */}
          <Pressable
            onPress={handleOpenLink}
            style={({ pressed }) => ({
              backgroundColor: '#FF6B35',
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Ionicons name="open-outline" size={20} color="#FFFFFF" />
            <Text style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '700',
              marginLeft: 8,
              letterSpacing: 0.5,
            }}>
              Read Full Article
            </Text>
          </Pressable>

          {/* Attribution */}
          <View style={{
            marginTop: 32,
            paddingTop: 24,
            borderTopWidth: 1,
            borderTopColor: tabStyles.screen.backgroundColor === '#000000' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="information-circle-outline" size={16} color={tabStyles.text.secondary} />
              <Text style={{ color: tabStyles.text.secondary, fontSize: 12, fontWeight: '600', marginLeft: 6 }}>
                Powered by BharathVA News AI
              </Text>
            </View>
            <Text style={{ color: tabStyles.text.secondary, fontSize: 11, lineHeight: 18 }}>
              This summary was generated using advanced AI to provide you with quick, accurate insights.
              Read the full article for complete details.
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

