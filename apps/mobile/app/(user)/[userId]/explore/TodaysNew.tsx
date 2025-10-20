import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTabStyles } from '../../../../hooks/useTabStyles';

interface NewsItem {
  id: string;
  title: string;
  trending: boolean;
  timeAgo?: string;
  category: string;
  posts: string;
  thumbnail: string;
  icons: {
    profile: string;
    flag: string;
    badge: string;
  };
}

const newsData: NewsItem[] = [
  {
    id: '1',
    title: 'Mumbai Metro Line 3 Phase 2 Inauguration Set for Next Month - Local Commuters Rejoice',
    trending: true,
    category: 'Transport',
    posts: '12.4K posts',
    thumbnail: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=400&h=300&q=80',
    icons: {
      profile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=32&h=32&facepad=2',
      flag: '🚇',
      badge: 'MUMBAI'
    }
  },
  {
    id: '2',
    title: 'Bengaluru IT Hub Reports 25% Growth in Startup Registrations This Quarter',
    trending: false,
    timeAgo: '3 hours ago',
    category: 'Business',
    posts: '8.9K posts',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&h=300&q=80',
    icons: {
      profile: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&w=32&h=32&facepad=2',
      flag: '💻',
      badge: 'BENGALURU'
    }
  },
  {
    id: '3',
    title: 'Delhi NCR Air Quality Improves Significantly After New Green Initiatives',
    trending: true,
    timeAgo: '1 hour ago',
    category: 'Environment',
    posts: '15.2K posts',
    thumbnail: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&h=300&q=80',
    icons: {
      profile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=32&h=32&facepad=2',
      flag: '🌱',
      badge: 'DELHI NCR'
    }
  },
  {
    id: '4',
    title: 'Chennai Port Records Highest Container Throughput in South India',
    trending: false,
    timeAgo: '5 hours ago',
    category: 'Infrastructure',
    posts: '6.7K posts',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&h=300&q=80',
    icons: {
      profile: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&w=32&h=32&facepad=2',
      flag: '🚢',
      badge: 'CHENNAI'
    }
  },
  {
    id: '5',
    title: 'Pune District Schools Implement Digital Learning Platforms for Rural Students',
    trending: true,
    timeAgo: '2 hours ago',
    category: 'Education',
    posts: '11.8K posts',
    thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&h=300&q=80',
    icons: {
      profile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=32&h=32&facepad=2',
      flag: '📚',
      badge: 'PUNE'
    }
  },
  {
    id: '6',
    title: 'Hyderabad Pharma Industry Expands with New Manufacturing Units in Genome Valley',
    trending: false,
    timeAgo: '4 hours ago',
    category: 'Healthcare',
    posts: '7.3K posts',
    thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&h=300&q=80',
    icons: {
      profile: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&w=32&h=32&facepad=2',
      flag: '💊',
      badge: 'HYDERABAD'
    }
  },
  {
    id: '7',
    title: 'Ahmedabad Smart City Project Completes Phase 1 - Citizens Celebrate Digital Transformation',
    trending: false,
    timeAgo: '6 hours ago',
    category: 'Smart City',
    posts: '9.1K posts',
    thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=400&h=300&q=80',
    icons: {
      profile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=32&h=32&facepad=2',
      flag: '🏙️',
      badge: 'AHMEDABAD'
    }
  },
  {
    id: '8',
    title: 'Kochi Port Authority Announces New Cruise Terminal for International Tourism',
    trending: true,
    timeAgo: '30 minutes ago',
    category: 'Tourism',
    posts: '13.6K posts',
    thumbnail: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&h=300&q=80',
    icons: {
      profile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=32&h=32&facepad=2',
      flag: '🚢',
      badge: 'KOCHI'
    }
  }
];

interface TodaysNewProps {
  onNewsPress?: (newsItem: NewsItem) => void;
}

export default function TodaysNew({ onNewsPress }: TodaysNewProps) {
  const tabStyles = useTabStyles();

  const handleNewsPress = (newsItem: NewsItem) => {
    onNewsPress?.(newsItem);
    console.log('News pressed:', newsItem.title);
  };

  return (
    <View style={{ backgroundColor: tabStyles.screen.backgroundColor, paddingHorizontal: 8, paddingVertical: 16 }}>
      {/* Modern Header with Gradient Text Effect */}
      <View style={{ marginBottom: 24, marginLeft: 4 }}>
        <Text style={{ 
          fontSize: 28, 
          fontWeight: '800', 
          color: tabStyles.text.primary,
          letterSpacing: -0.5,
          lineHeight: 32
        }}>
          Today's News
        </Text>
        <Text style={{
          fontSize: 14,
          color: tabStyles.text.secondary,
          marginTop: 4,
          fontWeight: '500'
        }}>
          Local news from districts across India
        </Text>
      </View>
      
      {/* Perfect Medium-Style News Cards */}
      {newsData.map((newsItem, index) => (
        <Pressable
          key={newsItem.id}
          onPress={() => handleNewsPress(newsItem)}
          style={({ pressed }) => ({
            backgroundColor: tabStyles.screen.backgroundColor,
            marginBottom: index < newsData.length - 1 ? 32 : 0,
            opacity: pressed ? 0.96 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'flex-start',
            paddingVertical: 16
          }}>
            {/* Left Content - Perfect Typography */}
            <View style={{ flex: 1, marginRight: 20 }}>
              {/* News Title - Medium Style */}
              <Text 
                style={{ 
                  color: tabStyles.text.primary,
                  fontSize: 18,
                  fontWeight: '700',
                  lineHeight: 26,
                  letterSpacing: -0.2,
                  marginBottom: 16
                }}
              >
                {newsItem.title}
              </Text>
              
              {/* Perfect Metadata Line - Trending, Avatars, Time */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Trending Indicator */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                  <View style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: newsItem.trending ? '#FF4444' : '#10B981',
                    marginRight: 6
                  }} />
                  <Text style={{
                    fontSize: 11,
                    color: tabStyles.text.secondary,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: 0.8
                  }}>
                    {newsItem.trending ? 'TRENDING' : 'LATEST'}
                  </Text>
                </View>
                
                {/* News Sources - Perfect Overlapping Avatars */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                  {/* News Source 1 */}
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: tabStyles.screen.backgroundColor,
                    overflow: 'hidden',
                    zIndex: 3,
                  }}>
                    <Image
                      source={{ uri: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=48&h=48&facepad=2` }}
                      style={{ width: 24, height: 24 }}
                      contentFit="cover"
                    />
                  </View>
                  
                  {/* News Source 2 */}
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: tabStyles.screen.backgroundColor,
                    marginLeft: -8,
                    overflow: 'hidden',
                    zIndex: 2,
                  }}>
                    <Image
                      source={{ uri: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&w=48&h=48&facepad=2` }}
                      style={{ width: 24, height: 24 }}
                      contentFit="cover"
                    />
                  </View>
                  
                  {/* News Source 3 */}
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: tabStyles.screen.backgroundColor,
                    marginLeft: -8,
                    overflow: 'hidden',
                    zIndex: 1,
                  }}>
                    <Image
                      source={{ uri: `https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=facearea&w=48&h=48&facepad=2` }}
                      style={{ width: 24, height: 24 }}
                      contentFit="cover"
                    />
                  </View>
                </View>
                
                {/* Time */}
                <Text style={{
                  fontSize: 11,
                  color: tabStyles.text.secondary,
                  fontWeight: '500'
                }}>
                  {newsItem.timeAgo || 'Just now'}
                </Text>
              </View>
            </View>
            
            {/* Right Content - Perfect Thumbnail */}
            <View style={{ 
              width: 120, 
              height: 120,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: tabStyles.screen.backgroundColor === '#000000' ? 'rgba(255,255,255,0.05)' : '#F8F9FA'
            }}>
              <Image
                source={{ uri: newsItem.thumbnail }}
                style={{ 
                  width: 120, 
                  height: 120,
                }}
                contentFit="cover"
                placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
              />
              
              {/* HOT Badge - Perfect Positioning */}
              {newsItem.trending && (
                <View style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: '#FF4444',
                  paddingHorizontal: 6,
                  paddingVertical: 3,
                  borderRadius: 6
                }}>
                  <Text style={{
                    fontSize: 8,
                    color: '#FFFFFF',
                    fontWeight: '800',
                    letterSpacing: 0.5
                  }}>
                    HOT
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
