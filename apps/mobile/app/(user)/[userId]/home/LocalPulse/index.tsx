import React from 'react';
import { ScrollView, useColorScheme, Dimensions } from 'react-native';
import WeatherCard from './components/WeatherCard';
import LatestUpdates from './components/LatestUpdates';

const { width } = Dimensions.get('window');

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

const mockLocalPulseData: LocalPulseItem[] = [
  {
    id: '1',
    type: 'featured',
    title: 'Heavy Rainfall Alert: Waterlogging Expected in Downtown Area',
    category: 'Weather',
    author: 'Mumbai Weather Bureau',
    readTime: '2 min read',
    timeAgo: 'Just now',
    imageUrl: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&h=600&fit=crop&auto=format',
    isBookmarked: false,
  },
  {
    id: '2',
    type: 'latest',
    title: 'Metro Line 2 Delayed by 15 Minutes Due to Technical Issues',
    category: 'Alert',
    author: 'Mumbai Metro',
    readTime: '532',
    timeAgo: '5 min ago',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop&auto=format',
    isBookmarked: false,
  },
  {
    id: '3',
    type: 'latest',
    title: 'Heavy Rainfall Causes Flooding in Low-Lying Areas - Avoid Travel',
    category: 'Flood',
    author: 'Mumbai Weather Bureau',
    readTime: '421',
    timeAgo: '1 hour ago',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop&auto=format',
    isBookmarked: false,
  },
  {
    id: '4',
    type: 'latest',
    title: 'Major Accident on Western Express Highway - Traffic Diverted',
    category: 'Accident',
    author: 'Mumbai Traffic Police',
    readTime: '312',
    timeAgo: '2 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=400&fit=crop&auto=format',
    isBookmarked: false,
  },
  {
    id: '5',
    type: 'latest',
    title: 'Power Outage Alert: Scheduled Maintenance in Bandra West',
    category: 'Alert',
    author: 'MSEB',
    readTime: '289',
    timeAgo: '3 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&auto=format',
    isBookmarked: false,
  },
];

export default function LocalPulse() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? '#000000' : '#FFFFFF';

  const latestItems = mockLocalPulseData.filter(item => item.type === 'latest');

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: bgColor }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <WeatherCard
        onPress={() => console.log('Weather card pressed')}
      />

      <LatestUpdates
        items={latestItems}
        onItemPress={(item) => console.log('Latest update pressed:', item.id)}
        onBookmarkPress={(item) => console.log('Bookmark pressed:', item.id)}
        onSeeMorePress={() => console.log('See more pressed')}
      />
    </ScrollView>
  );
}

