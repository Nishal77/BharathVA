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
    title: 'Government Shutdown Enters Fourth Day as Trump Posts AI Memes Mocking Democrats',
    trending: true,
    category: 'Politics',
    posts: '9.3K posts',
    thumbnail: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=400&h=300&q=80',
    icons: {
      profile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=32&h=32&facepad=2',
      flag: '🇺🇸',
      badge: 'RAPID\nRESPONSE'
    }
  },
  {
    id: '2',
    title: 'Bitcoin Surges Past $123,000 on Institutional Demand and ETF Inflows',
    trending: false,
    timeAgo: '6 hours ago',
    category: 'Finance',
    posts: '8.7K posts',
    thumbnail: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=400&h=300&q=80',
    icons: {
      profile: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&w=32&h=32&facepad=2',
      flag: '🪙',
      badge: '🚀'
    }
  },
  {
    id: '3',
    title: 'Elon Musk Announces Tesla Robotaxi Fleet Launch in Major Cities Next Month',
    trending: true,
    timeAgo: '2 hours ago',
    category: 'Technology',
    posts: '12.1K posts',
    thumbnail: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=400&h=300&q=80',
    icons: {
      profile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=32&h=32&facepad=2',
      flag: '🚗',
      badge: 'BREAKING'
    }
  },
  {
    id: '4',
    title: 'Climate Summit Reaches Historic Agreement on Carbon Neutrality by 2050',
    trending: false,
    timeAgo: '4 hours ago',
    category: 'Environment',
    posts: '7.8K posts',
    thumbnail: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=400&h=300&q=80',
    icons: {
      profile: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&w=32&h=32&facepad=2',
      flag: '🌍',
      badge: 'GLOBAL'
    }
  },
  {
    id: '5',
    title: 'Scientists Discover New Exoplanet with Potential for Life in Nearby Star System',
    trending: true,
    timeAgo: '1 hour ago',
    category: 'Science',
    posts: '15.4K posts',
    thumbnail: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=400&h=300&q=80',
    icons: {
      profile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=32&h=32&facepad=2',
      flag: '🪐',
      badge: 'DISCOVERY'
    }
  },
  {
    id: '6',
    title: 'Major Tech Companies Report Record Quarterly Earnings Despite Market Volatility',
    trending: false,
    timeAgo: '3 hours ago',
    category: 'Business',
    posts: '6.2K posts',
    thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=400&h=300&q=80',
    icons: {
      profile: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&w=32&h=32&facepad=2',
      flag: '📈',
      badge: 'ANALYSIS'
    }
  },
  {
    id: '7',
    title: 'Olympic Committee Announces New Sports for 2028 Summer Games in Los Angeles',
    trending: false,
    timeAgo: '8 hours ago',
    category: 'Sports',
    posts: '4.9K posts',
    thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&h=300&q=80',
    icons: {
      profile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=32&h=32&facepad=2',
      flag: '🏆',
      badge: 'SPORTS'
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
    <View style={{ backgroundColor: tabStyles.screen.backgroundColor, padding: 20 }}>
      {/* Today's News Header */}
      <Text style={{ 
        fontSize: 24, 
        fontWeight: '700', 
        color: tabStyles.text.primary, 
        marginBottom: 20 
      }}>
        Today's News
      </Text>
      
      {/* News Items */}
      {newsData.map((newsItem, index) => (
        <Pressable
          key={newsItem.id}
          onPress={() => handleNewsPress(newsItem)}
          style={({ pressed }) => ({
            backgroundColor: tabStyles.screen.backgroundColor,
            marginBottom: index < newsData.length - 1 ? 16 : 0,
            opacity: pressed ? 0.95 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            {/* Left Content - Title, Icons, Metadata */}
            <View style={{ flex: 1, marginRight: 12 }}>
              {/* News Title */}
              <Text 
                className="text-base font-bold"
                style={{ 
                  color: tabStyles.text.primary, 
                  lineHeight: 20,
                  marginBottom: 8
                }}
              >
                {newsItem.title}
              </Text>
              
              {/* Icons and Metadata Row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                {/* Amazing Overlapping Avatar Group - News Channels */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                  {/* News Channel Avatar 1 - CNN */}
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: '#FFFFFF',
                    overflow: 'hidden',
                    zIndex: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 3,
                    backgroundColor: '#CC0000',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{ 
                      fontSize: 8, 
                      color: '#FFFFFF', 
                      fontWeight: '900',
                      textAlign: 'center'
                    }}>
                      CNN
                    </Text>
                  </View>
                  
                  {/* News Channel Avatar 2 - BBC */}
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: '#FFFFFF',
                    overflow: 'hidden',
                    marginLeft: -8,
                    zIndex: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 2,
                    backgroundColor: '#BB0000',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{ 
                      fontSize: 7, 
                      color: '#FFFFFF', 
                      fontWeight: '900',
                      textAlign: 'center'
                    }}>
                      BBC
                    </Text>
                  </View>
                  
                  {/* News Channel Avatar 3 - Fox News */}
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: '#FFFFFF',
                    overflow: 'hidden',
                    marginLeft: -8,
                    zIndex: 1,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 1,
                    backgroundColor: '#003876',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{ 
                      fontSize: 6, 
                      color: '#FFFFFF', 
                      fontWeight: '900',
                      textAlign: 'center'
                    }}>
                      FOX
                    </Text>
                  </View>
                </View>
                
                {/* Metadata Text */}
                <Text 
                  className="text-sm"
                  style={{ 
                    color: tabStyles.text.secondary,
                    flex: 1
                  }}
                >
                  {newsItem.trending ? 'Trending now' : newsItem.timeAgo} · {newsItem.category} · {newsItem.posts}
                </Text>
              </View>
            </View>
            
            {/* Right Content - Thumbnail */}
            <View style={{ width: 80, height: 80 }}>
              <Image
                source={{ uri: newsItem.thumbnail }}
                style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: 8 
                }}
                contentFit="cover"
                placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
              />
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
