import React, { useState, useEffect } from 'react';
import { ScrollView, useColorScheme } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import ContentSlider from './components/ContentSlider';
import LatestUpdates from './components/LatestUpdates';
import { fetchTrafficAlerts, TrafficAlert } from '../../../../../services/api/trafficService';

interface LocalPulseItem {
  id: string;
  type: 'featured' | 'latest';
  title: string;
  category: string;
  author: string;
  readTime: string;
  timeAgo: string;
  imageUrl?: string;
  isBookmarked?: boolean;
}

export default function LocalPulse() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.userId as string;

  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const [trafficAlerts, setTrafficAlerts] = useState<TrafficAlert[]>([]);
  const [loadingTraffic, setLoadingTraffic] = useState(false);

  const latestItems: LocalPulseItem[] = [];

  useEffect(() => {
    loadTrafficAlerts();
  }, []);

  const loadTrafficAlerts = async () => {
    try {
      setLoadingTraffic(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoadingTraffic(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      
      // Validate coordinates are within India bounds
      const isIndiaLocation = latitude >= 6.0 && latitude <= 37.0 && longitude >= 68.0 && longitude <= 97.0;
      
      if (!isIndiaLocation) {
        console.warn('[LocalPulse] Location outside India bounds, skipping traffic alerts');
        setLoadingTraffic(false);
        return;
      }

      const response = await fetchTrafficAlerts(
        latitude,
        longitude,
        5.0 // MapMyIndia recommends 1-5 km radius
      );
      
      if (response.success && response.alerts) {
        setTrafficAlerts(response.alerts);
      }
    } catch (error) {
      console.error('Error loading traffic alerts:', error);
    } finally {
      setLoadingTraffic(false);
    }
  };

  // Temporarily disabled - will be re-enabled later
  const handleUpdatePress = (item: { id: string; title: string; category: string; author: string; timeAgo: string; imageUrl?: string }) => {
    // router.push({
    //   pathname: `/(user)/[userId]/home/LocalPulse/[newsId]` as any,
    //   params: {
    //     userId,
    //     newsId: item.id,
    //   title: item.title,
    //   category: item.category,
    //   author: item.author,
    //   timeAgo: item.timeAgo,
    //     imageUrl: item.imageUrl || '',
    //   },
    // });
    console.log('[LocalPulse] handleUpdatePress called (temporarily disabled):', item.id);
  };

  // Temporarily disabled - will be re-enabled later
  const handleBreakingNewsPress = (item: any) => {
    // router.push({
    //   pathname: `/(user)/[userId]/home/LocalPulse/[newsId]` as any,
    //   params: {
    //     userId,
    //     newsId: item.id,
    //     title: item.title,
    //     description: item.description || '',
    //     category: item.category || 'Breaking News',
    //     imageUrl: item.imageUrl || '',
    //     timeAgo: item.timeAgo || 'Just now',
    //   },
    // });
    console.log('[LocalPulse] handleBreakingNewsPress called (temporarily disabled):', item.id);
  };

  const getTimeAgo = (timestamp: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  };

  const breakingNewsItems = trafficAlerts
    .slice(0, 3)
    .map((alert, index) => ({
      id: alert.id,
      title: alert.title,
      description: alert.description || `${alert.title}. Stay informed and follow official guidance for your safety.`,
      category: 'Traffic Alert',
      imageUrl: '',
      timeAgo: getTimeAgo(alert.timestamp),
      likes: Math.floor(Math.random() * 10) + 1,
      replies: Math.floor(Math.random() * 20) + 5,
      authorAvatars: [
        `https://i.pravatar.cc/150?img=${index * 3 + 10}`,
        `https://i.pravatar.cc/150?img=${index * 3 + 11}`,
        `https://i.pravatar.cc/150?img=${index * 3 + 12}`,
      ],
    }));

  const localAlertsItems = trafficAlerts
    .slice(0, 4)
    .map((alert) => ({
      id: alert.id,
      type: alert.type === 'accident' ? 'traffic' : alert.type === 'road_work' ? 'power' : 'traffic',
      title: alert.title,
      description: alert.description,
      location: alert.location,
      timeAgo: getTimeAgo(alert.timestamp),
      severity: alert.severity.toLowerCase(),
      imageUrl: '',
      source: alert.city + ' Traffic',
    }));

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: bgColor }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <ContentSlider
        breakingNewsItems={breakingNewsItems}
        localAlertsItems={localAlertsItems}
        onWeatherPress={() => console.log('Weather card pressed')}
        onBreakingNewsPress={handleBreakingNewsPress}
        onLocalAlertsPress={(item) => console.log('Local alert pressed:', item.id)}
      />

      <LatestUpdates
        items={latestItems}
        onItemPress={handleUpdatePress}
        onBookmarkPress={(item) => console.log('Bookmark pressed:', item.id)}
        onSeeMorePress={() => console.log('See more pressed')}
        selectedCityParam={params.selectedCity as string | undefined}
      />
    </ScrollView>
  );
}
