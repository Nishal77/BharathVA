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

// Get screen dimensions for responsive design - Match WeatherCard
const getScreenDimensions = () => Dimensions.get('window');
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = getScreenDimensions();

// Calculate device category based on both width and height - Match WeatherCard
const getDeviceCategory = () => {
  const width = SCREEN_WIDTH;
  const height = SCREEN_HEIGHT;
  const diagonal = Math.sqrt(width * width + height * height);
  
  if (width < 375 || diagonal < 600) {
    return 'small';
  } else if (width >= 375 && width < 414 && diagonal < 800) {
    return 'medium';
  } else {
    return 'large';
  }
};

const deviceCategory = getDeviceCategory();
const isSmallDevice = deviceCategory === 'small';
const isMediumDevice = deviceCategory === 'medium';

// Responsive scaling functions - Match WeatherCard
const scale = (size: number, baseWidth: number = 375) => {
  const widthScale = SCREEN_WIDTH / baseWidth;
  const heightScale = SCREEN_HEIGHT / 667;
  const scaleFactor = Math.min(widthScale, heightScale, 1.2);
  return size * scaleFactor;
};

const moderateScale = (size: number, factor = 0.5, baseWidth: number = 375) => {
  const scaled = scale(size, baseWidth);
  return size + (scaled - size) * factor;
};

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
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  // Handle dimension changes (rotation, split screen, etc.) - Match WeatherCard
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentItemIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [items.length]);

  const currentItem = items[currentItemIndex] || items[0] || mockBreakingNews[0];

  // Calculate responsive values - Match WeatherCard exactly
  const currentWidth = dimensions.width;
  const currentHeight = dimensions.height;
  const currentDiagonal = Math.sqrt(currentWidth * currentWidth + currentHeight * currentHeight);
  
  const getCurrentDeviceCategory = () => {
    if (currentWidth < 375 || currentDiagonal < 600) {
      return 'small';
    } else if (currentWidth >= 375 && currentWidth < 414 && currentDiagonal < 800) {
      return 'medium';
    } else {
      return 'large';
    }
  };

  const currentDeviceCategory = getCurrentDeviceCategory();
  const currentIsSmallDevice = currentDeviceCategory === 'small';
  const currentIsMediumDevice = currentDeviceCategory === 'medium';

  const currentScale = (size: number, baseWidth: number = 375) => {
    const widthScale = currentWidth / baseWidth;
    const heightScale = currentHeight / 667;
    const scaleFactor = Math.min(widthScale, heightScale, 1.2);
    return size * scaleFactor;
  };

  const currentModerateScale = (size: number, factor = 0.5, baseWidth: number = 375) => {
    const scaled = currentScale(size, baseWidth);
    return size + (scaled - size) * factor;
  };

  // Match WeatherCard dimensions exactly with responsive scaling
  const cardPadding = Math.round(currentModerateScale(currentIsSmallDevice ? 16 : 20));
  const cardMinHeight = Math.round(currentModerateScale(currentIsSmallDevice ? 180 : currentIsMediumDevice ? 200 : 220, 0.5));

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
          className="rounded-3xl overflow-hidden"
          style={{
            backgroundColor: isDark ? '#0F0F0F' : '#FAFAFA',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.5 : 0.12,
            shadowRadius: 24,
            elevation: 12,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            minHeight: cardMinHeight,
          }}
        >
          {/* Premium Gradient Overlay */}
          <View
            className="absolute inset-0 z-10"
            style={{
              backgroundColor: isDark 
                ? 'rgba(239, 68, 68, 0.03)' 
                : 'rgba(239, 68, 68, 0.02)',
            }}
          />

          {/* Image Section - Full Card with Text Overlay */}
          <View
            style={{
              width: '100%',
              height: cardMinHeight,
              position: 'relative',
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
              blurRadius={8}
            />
            
            {/* Bottom Text Overlay - Premium Design without Black Background */}
            <View
              className="absolute bottom-0 left-0 right-0"
              style={{
                paddingTop: 50,
                paddingBottom: currentIsSmallDevice ? 14 : 16,
                paddingHorizontal: cardPadding,
              }}
            >
              {/* Text Content with Enhanced Shadows for Premium Readability */}
              <View className="relative z-10">
                {/* Breaking News Badge */}
                <View className="flex-row items-center" style={{ marginBottom: currentIsSmallDevice ? 8 : 10, gap: 8 }}>
                  <View
                    className="rounded-lg items-center justify-center"
                    style={{
                      width: currentIsSmallDevice ? 20 : currentIsMediumDevice ? 22 : 24,
                      height: currentIsSmallDevice ? 20 : currentIsMediumDevice ? 22 : 24,
                      backgroundColor: 'rgba(239, 68, 68, 0.95)',
                      shadowColor: '#EF4444',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.5,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Text style={{ fontSize: currentIsSmallDevice ? 10 : currentIsMediumDevice ? 11 : 12 }}>🔥</Text>
                  </View>
                  <Text
                    className="text-white"
                    style={{
                      fontFamily: 'Chirp-Bold',
                      fontSize: currentIsSmallDevice ? 12 : currentIsMediumDevice ? 13 : 14,
                      letterSpacing: -0.2,
                      color: '#FFFFFF',
                      textShadowColor: 'rgba(0, 0, 0, 0.8)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 6,
                    }}
                  >
                    Breaking News
                  </Text>
                </View>
                
                {/* Title */}
                <Text
                  className="text-white"
                  style={{
                    fontFamily: 'Chirp-Bold',
                    fontSize: currentIsSmallDevice ? 16 : currentIsMediumDevice ? 18 : 20,
                    letterSpacing: -0.4,
                    lineHeight: currentIsSmallDevice ? 22 : currentIsMediumDevice ? 24 : 26,
                    marginBottom: currentItem.description ? (currentIsSmallDevice ? 6 : 8) : 0,
                    color: '#FFFFFF',
                    textShadowColor: 'rgba(0, 0, 0, 0.85)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 8,
                  }}
                  numberOfLines={2}
                >
                  {currentItem.title}
                </Text>
                
                {/* Description */}
                {currentItem.description && (
                  <Text
                    className="text-white"
                    style={{
                      fontFamily: 'Chirp-Regular',
                      fontSize: currentIsSmallDevice ? 12 : currentIsMediumDevice ? 13 : 14,
                      lineHeight: currentIsSmallDevice ? 17 : currentIsMediumDevice ? 19 : 20,
                      letterSpacing: 0.1,
                      color: 'rgba(255, 255, 255, 0.95)',
                      textShadowColor: 'rgba(0, 0, 0, 0.75)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 6,
                    }}
                    numberOfLines={2}
                  >
                    {currentItem.description}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

