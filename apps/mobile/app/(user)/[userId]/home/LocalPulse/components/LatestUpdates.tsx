import React, { useEffect, useState, useCallback } from 'react';
import { Pressable, Text, View, useColorScheme, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import * as Location from 'expo-location';

interface LatestUpdateItem {
  id: string;
  title: string;
  category: string;
  author: string;
  readTime: string;
  timeAgo: string;
  imageUrl?: string;
  isBookmarked?: boolean;
}

interface LatestUpdatesProps {
  items: LatestUpdateItem[];
  onItemPress?: (item: LatestUpdateItem) => void;
  onBookmarkPress?: (item: LatestUpdateItem) => void;
  onSeeMorePress?: () => void;
}

const getDistrictFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BharathVA-Mobile-App',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    const address = data.address;

    if (address) {
      const district = address.district || address.state_district || address.municipality || null;
      return district || '---';
    }

    return '---';
  } catch (error) {
    console.error('Error fetching district:', error);
    return '---';
  }
};

const fetchUserDistrict = async (): Promise<string> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return '---';
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;
    return await getDistrictFromCoordinates(latitude, longitude);
  } catch (error) {
    console.error('Error getting location:', error);
    return '---';
  }
};

export default function LatestUpdates({
  items,
  onItemPress,
  onBookmarkPress,
  onSeeMorePress,
}: LatestUpdatesProps) {
  const isDark = useColorScheme() === 'dark';
  const [district, setDistrict] = useState<string>('---');

  const loadDistrict = useCallback(async () => {
    try {
      const userDistrict = await fetchUserDistrict();
      setDistrict(userDistrict);
    } catch (error) {
      setDistrict('---');
    }
  }, []);

  useEffect(() => {
    loadDistrict();
  }, [loadDistrict]);

  const headingText = district && district !== '---' 
    ? `What's Happening in ${district}` 
    : 'Latest Updates';

  const { width: screenWidth } = Dimensions.get('window');
  const baseFontSize = 22;
  const minFontSize = 18;
  const maxFontSize = 26;
  const scaleFactor = Math.min(Math.max(screenWidth / 375, 0.85), 1.15);
  const fontSize = Math.max(minFontSize, Math.min(maxFontSize, baseFontSize * scaleFactor));
  const letterSpacing = fontSize < 22 ? -0.7 : -0.9;

  return (
    <View style={{ padding: 20, paddingBottom: 12, paddingTop: 24 }}>
      <View className="flex-row justify-between items-center mb-8">
        <Text
          className="dark:text-white text-black font-semibold"
          style={{ 
            fontSize, 
            letterSpacing,
            lineHeight: fontSize * 1.1,
            fontWeight: '900',
            includeFontPadding: false,
          }}
          numberOfLines={2}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.85}
        >
          {headingText}
        </Text>
      </View>

      {items.map((item, index) => (
        <View key={item.id}>
          {index > 0 && (
            <View className="h-[0.5px] bg-gray-200 dark:bg-white/10 mb-8" />
          )}
          <Pressable
            onPress={() => onItemPress?.(item)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.95 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            })}
            className="mb-8"
          >
            <Text
              className="font-chirp-medium dark:text-white text-black mb-5"
              style={{ 
                fontWeight: '700', 
                fontSize: 18, 
                lineHeight: 26, 
                letterSpacing: -0.3 
              }}
              numberOfLines={3}
            >
              {item.title}
            </Text>
            <View className="flex-row items-center gap-2.5">
              <View className="flex-row" style={{ marginRight: 6 }}>
                {[1, 2, 3].map((index) => (
                  <View
                    key={index}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      borderWidth: 2,
                      borderColor: isDark ? '#000000' : '#FFFFFF',
                      marginLeft: index > 1 ? -10 : 0,
                      zIndex: 3 - index,
                    }}
                  >
                    <Image
                      source={{
                        uri: `https://i.pravatar.cc/150?img=${index + 10}`,
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 11,
                      }}
                      contentFit="cover"
                    />
                  </View>
                ))}
              </View>
              <Text
                className="font-chirp-regular dark:text-white/70 text-gray-600"
                style={{ fontSize: 13, letterSpacing: 0.1 }}
              >
                {item.timeAgo.toLowerCase()}
              </Text>
              <View className="w-1 h-1 rounded-full bg-gray-400 dark:bg-white/30" />
              <Text
                className="font-chirp-regular dark:text-white/70 text-gray-600"
                style={{ fontSize: 13, letterSpacing: 0.1 }}
              >
                {item.category.toLowerCase()}
              </Text>
              {item.author && (
                <>
                  <View className="w-1 h-1 rounded-full bg-gray-400 dark:bg-white/30" />
                  <Text
                    className="font-chirp-regular dark:text-white/70 text-gray-600"
                    style={{ fontSize: 13, letterSpacing: 0.1 }}
                  >
                    {item.author}
                  </Text>
                </>
              )}
            </View>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

