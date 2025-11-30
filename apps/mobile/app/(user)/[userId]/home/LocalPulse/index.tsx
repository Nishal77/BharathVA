import React, { useState } from 'react';
import { ScrollView, useColorScheme, Dimensions } from 'react-native';
import ContentSlider from './components/ContentSlider';
import LatestUpdates from './components/LatestUpdates';
import UpdateDetailModal from './components/UpdateDetailModal';

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

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    title: string;
    category: string;
    author: string;
    timeAgo: string;
    imageUrl?: string;
  } | null>(null);

  const handleUpdatePress = (item: { id: string; title: string; category: string; author: string; timeAgo: string; imageUrl?: string }) => {
    setSelectedItem({
      title: item.title,
      category: item.category,
      author: item.author,
      timeAgo: item.timeAgo,
      imageUrl: item.imageUrl,
    });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => {
      setSelectedItem(null);
    }, 300);
  };

  // Prepare breaking news items for the slider
  const breakingNewsItems = mockLocalPulseData
    .filter(item => item.type === 'featured' || item.category === 'Alert' || item.category === 'Flood')
    .map((item, index) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&h=600&fit=crop&auto=format',
      timeAgo: item.timeAgo,
      likes: Math.floor(Math.random() * 10) + 1,
      replies: Math.floor(Math.random() * 20) + 5,
      authorAvatars: [
        `https://i.pravatar.cc/150?img=${index * 3 + 10}`,
        `https://i.pravatar.cc/150?img=${index * 3 + 11}`,
        `https://i.pravatar.cc/150?img=${index * 3 + 12}`,
      ],
    }));

  // Prepare local alerts items for the slider
  const localAlertsItems = [
    {
      id: '1',
      type: 'power',
      title: 'Scheduled Power Cut',
      description: 'Maintenance work in Bandra West from 10 AM to 2 PM',
      location: 'Bandra West',
      timeAgo: '2 hours ago',
      severity: 'medium',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&auto=format',
      source: 'MSEB',
    },
    {
      id: '2',
      type: 'traffic',
      title: 'Road Closure Alert',
      description: 'Western Express Highway closed due to accident. Use alternate route.',
      location: 'Andheri',
      timeAgo: '30 min ago',
      severity: 'high',
      imageUrl: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop&auto=format',
      source: 'Traffic Police',
    },
    {
      id: '3',
      type: 'water',
      title: 'Water Supply Interruption',
      description: 'Water supply will be affected in South Mumbai from 6 PM to 10 PM',
      location: 'South Mumbai',
      timeAgo: '1 hour ago',
      severity: 'medium',
      imageUrl: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&h=600&fit=crop&auto=format',
      source: 'Water Board',
    },
    {
      id: '4',
      type: 'safety',
      title: 'Police Advisory',
      description: 'Increased security presence in downtown area. Follow instructions.',
      location: 'Downtown',
      timeAgo: '3 hours ago',
      severity: 'low',
      imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&auto=format',
      source: 'Police Dept',
    },
  ];

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
        onBreakingNewsPress={(item) => console.log('Breaking news pressed:', item.id)}
        onLocalAlertsPress={(item) => console.log('Local alert pressed:', item.id)}
      />

      <LatestUpdates
        items={latestItems}
        onItemPress={handleUpdatePress}
        onBookmarkPress={(item) => console.log('Bookmark pressed:', item.id)}
        onSeeMorePress={() => console.log('See more pressed')}
      />

      {selectedItem && (
        <UpdateDetailModal
          visible={modalVisible}
          onClose={handleCloseModal}
          title={selectedItem.title}
          category={selectedItem.category}
          author={selectedItem.author}
          timeAgo={selectedItem.timeAgo}
          imageUrl={selectedItem.imageUrl}
        />
      )}
    </ScrollView>
  );
}

