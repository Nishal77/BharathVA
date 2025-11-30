import React, { useState, useEffect } from 'react';
import { View, Text, useColorScheme, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';

interface LocalAlertItem {
  id: string;
  type: 'power' | 'water' | 'traffic' | 'safety';
  title: string;
  description: string;
  location: string;
  timeAgo: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  imageUrl?: string;
  source?: string;
}

interface LocalAlertsProps {
  items: LocalAlertItem[];
  onPress?: (item: LocalAlertItem) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;

const mockLocalAlerts: LocalAlertItem[] = [
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

const getAlertCategory = (type: string): string => {
  switch (type) {
    case 'power':
      return 'Power';
    case 'water':
      return 'Water';
    case 'traffic':
      return 'Traffic';
    case 'safety':
      return 'Safety';
    default:
      return 'Alert';
  }
};

const getSeverityColor = (severity: string): { bg: string; text: string } => {
  switch (severity) {
    case 'critical':
      return {
        bg: '#EF4444',
        text: '#FFFFFF',
      };
    case 'high':
      return {
        bg: '#F59E0B',
        text: '#FFFFFF',
      };
    case 'medium':
      return {
        bg: '#3B82F6',
        text: '#FFFFFF',
      };
    case 'low':
      return {
        bg: '#22C55E',
        text: '#FFFFFF',
      };
    default:
      return {
        bg: '#6B7280',
        text: '#FFFFFF',
      };
  }
};

export default function LocalAlerts({ items = mockLocalAlerts, onPress }: LocalAlertsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentItemIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [items.length]);

  const currentItem = items[currentItemIndex] || items[0] || mockLocalAlerts[0];
  const severityColors = getSeverityColor(currentItem.severity);
  const defaultImageUrl = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&auto=format';

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
            backgroundColor: '#FFFFFF',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          {/* Local Alerts Header - White Background */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              paddingHorizontal: isSmallDevice ? 16 : 20,
              paddingTop: isSmallDevice ? 18 : 20,
              paddingBottom: isSmallDevice ? 16 : 18,
            }}
          >
            {/* Header Row with Category and Time */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
              <Text
                style={{
                  fontFamily: 'Chirp-Bold',
                    fontSize: isSmallDevice ? 13 : isMediumDevice ? 14 : 15,
                    color: '#000000',
                    letterSpacing: -0.2,
                }}
              >
                  Local Alerts:
              </Text>
                <View
                  style={{
                    paddingHorizontal: isSmallDevice ? 9 : 11,
                    paddingVertical: isSmallDevice ? 4 : 5,
                    borderRadius: 14,
                    backgroundColor: severityColors.bg,
                    shadowColor: severityColors.bg,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Chirp-Bold',
                      fontSize: isSmallDevice ? 10 : 11,
                      color: severityColors.text,
                      letterSpacing: 0.4,
                      textTransform: 'uppercase',
                    }}
                  >
                    {getAlertCategory(currentItem.type)}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontFamily: 'Chirp-Regular',
                  fontSize: isSmallDevice ? 11 : 12,
                  color: 'rgba(0, 0, 0, 0.5)',
                  letterSpacing: -0.1,
                }}
              >
                {currentItem.timeAgo}
              </Text>
            </View>

            {/* Title */}
            <Text
              style={{
                fontFamily: 'Chirp-Bold',
                fontSize: isSmallDevice ? 16 : isMediumDevice ? 17 : 18,
                color: '#000000',
                letterSpacing: -0.3,
                lineHeight: isSmallDevice ? 22 : isMediumDevice ? 24 : 26,
                marginBottom: isSmallDevice ? 6 : 8,
              }}
              numberOfLines={2}
            >
              {currentItem.title}
            </Text>

            {/* Description */}
            <Text
              style={{
                fontFamily: 'Chirp-Regular',
                fontSize: isSmallDevice ? 13 : 14,
                color: 'rgba(0, 0, 0, 0.65)',
                lineHeight: isSmallDevice ? 18 : 20,
                letterSpacing: -0.1,
                marginBottom: isSmallDevice ? 10 : 12,
              }}
              numberOfLines={2}
            >
              {currentItem.description}
            </Text>

            {/* Location and Source Badges */}
            <View className="flex-row items-center gap-2 flex-wrap">
              <View
                style={{
                  paddingHorizontal: isSmallDevice ? 12 : 14,
                  paddingVertical: isSmallDevice ? 6 : 7,
                  borderRadius: 20,
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  borderWidth: 0.5,
                  borderColor: 'rgba(0, 0, 0, 0.06)',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Chirp-Medium',
                    fontSize: isSmallDevice ? 11 : 12,
                    color: 'rgba(0, 0, 0, 0.8)',
                    letterSpacing: -0.05,
                  }}
                >
                  📍 {currentItem.location}
                </Text>
              </View>
              {currentItem.source && (
              <View
                  style={{
                    paddingHorizontal: isSmallDevice ? 12 : 14,
                    paddingVertical: isSmallDevice ? 6 : 7,
                    borderRadius: 20,
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    borderWidth: 0.5,
                    borderColor: 'rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Chirp-Medium',
                      fontSize: isSmallDevice ? 11 : 12,
                      color: 'rgba(0, 0, 0, 0.8)',
                      letterSpacing: -0.05,
                    }}
                  >
                    {currentItem.source}
                </Text>
              </View>
              )}
            </View>
          </View>

          {/* Image Section - Matching BreakingNews Size */}
          <View
            style={{
              height: isSmallDevice ? 160 : isMediumDevice ? 180 : 200,
              overflow: 'hidden',
            }}
          >
            <Image
              source={{ uri: currentItem.imageUrl || defaultImageUrl }}
              style={{
                width: '100%',
                height: '100%',
              }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          </View>

          {/* Pagination Dots */}
          {items.length > 1 && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: isSmallDevice ? 12 : 14,
                gap: 6,
                backgroundColor: '#FFFFFF',
              }}
            >
              {items.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: index === currentItemIndex ? 6 : 5,
                    height: index === currentItemIndex ? 6 : 5,
                    borderRadius: index === currentItemIndex ? 3 : 2.5,
                    backgroundColor: index === currentItemIndex ? '#000000' : 'rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

