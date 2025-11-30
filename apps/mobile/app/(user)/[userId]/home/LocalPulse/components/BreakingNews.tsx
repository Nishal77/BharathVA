import React, { useState, useEffect } from 'react';
import { View, Text, useColorScheme, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';

interface BreakingNewsItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
}

interface BreakingNewsProps {
  items: BreakingNewsItem[];
  onPress?: (item: BreakingNewsItem) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;

const mockBreakingNews: BreakingNewsItem[] = [
  {
    id: '1',
    title: 'Heavy Rainfall Alert: Waterlogging Expected in Downtown Area',
    description: 'Severe weather warning issued for downtown region. Residents advised to avoid low-lying areas.',
    imageUrl: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&h=600&fit=crop&auto=format',
  },
  {
    id: '2',
    title: 'Major Traffic Disruption on Western Express Highway',
    description: 'Accident reported causing significant delays. Alternative routes recommended.',
    imageUrl: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop&auto=format',
  },
  {
    id: '3',
    title: 'Power Outage Scheduled in Bandra West - Maintenance Alert',
    description: 'Scheduled maintenance will affect power supply from 10 AM to 2 PM today.',
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&auto=format',
  },
];

export default function BreakingNews({ items = mockBreakingNews, onPress }: BreakingNewsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentItemIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [items.length]);

  const currentItem = items[currentItemIndex] || items[0] || mockBreakingNews[0];

  return (
    <View className="px-4 pt-10 pb-1.5">
      <Pressable
        onPress={() => onPress?.(currentItem)}
        className="w-full"
        style={({ pressed }) => ({
          opacity: pressed ? 0.98 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        })}
      >
        <View
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          {/* Breaking News Header - White Background */}
          <View
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              paddingHorizontal: isSmallDevice ? 16 : 20,
              paddingTop: isSmallDevice ? 18 : 20,
              paddingBottom: isSmallDevice ? 16 : 18,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderTopWidth: 1.5,
              borderLeftWidth: 1.5,
              borderRightWidth: 1.5,
              borderBottomWidth: 0,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
            }}
          >
            <Text
              style={{
                fontFamily: 'Chirp-Bold',
                fontSize: isSmallDevice ? 13 : isMediumDevice ? 14 : 15,
                color: isDark ? '#FFFFFF' : '#000000',
                letterSpacing: -0.2,
                marginBottom: isSmallDevice ? 10 : 12,
              }}
            >
              Breaking News:
            </Text>
            <Text
              style={{
                fontFamily: 'Chirp-Bold',
                fontSize: isSmallDevice ? 16 : isMediumDevice ? 17 : 18,
                color: isDark ? '#FFFFFF' : '#000000',
                letterSpacing: -0.3,
                lineHeight: isSmallDevice ? 22 : isMediumDevice ? 24 : 26,
                marginBottom: currentItem.description ? (isSmallDevice ? 6 : 8) : 0,
              }}
              numberOfLines={2}
            >
              {currentItem.title}
            </Text>
            {currentItem.description && (
              <Text
                style={{
                  fontFamily: 'Chirp-Regular',
                  fontSize: isSmallDevice ? 13 : 14,
                  color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)',
                  lineHeight: isSmallDevice ? 18 : 20,
                  letterSpacing: -0.1,
                }}
                numberOfLines={2}
              >
                {currentItem.description}
              </Text>
            )}
          </View>

          {/* Image Section - Reduced Size */}
          <View
            style={{
              height: isSmallDevice ? 160 : isMediumDevice ? 180 : 200,
              overflow: 'hidden',
            }}
          >
            <Image
              source={{ uri: currentItem.imageUrl }}
              style={{
                width: '100%',
                height: '100%',
              }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          </View>
        </View>
      </Pressable>
    </View>
  );
}

