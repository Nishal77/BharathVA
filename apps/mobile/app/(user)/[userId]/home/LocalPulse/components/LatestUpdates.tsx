import React, { useEffect, useState, useCallback } from 'react';
import { Pressable, Text, View, ActivityIndicator, useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import Svg, { Path } from 'react-native-svg';

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

const LocationIcon = ({ size = 20, color = '#000000' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12.56 20.82a.96.96 0 0 1-1.12 0C6.611 17.378 1.486 10.298 6.667 5.182A7.6 7.6 0 0 1 12 3c2 0 3.919.785 5.333 2.181 5.181 5.116.056 12.196-4.773 15.64"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface LocationState {
  district: string;
  isLoading: boolean;
  error: string | null;
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
      // Prioritize district fields only, avoid city/town/county place names
      const district = 
        address.district || 
        address.state_district || 
        address.municipality ||
        null;

      // If no district found, return '---'
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
    const district = await getDistrictFromCoordinates(latitude, longitude);
    return district;
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [fontsLoaded] = useFonts({
    'Satoshi-Regular': require('../../../../../../assets/fonts/Satoshi-Regular.otf'),
    'Satoshi-Medium': require('../../../../../../assets/fonts/Satoshi-Medium.otf'),
  });

  const [locationState, setLocationState] = useState<LocationState>({
    district: '---',
    isLoading: true,
    error: null,
  });

  const loadDistrict = useCallback(async () => {
    setLocationState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const district = await fetchUserDistrict();
      setLocationState({
        district,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setLocationState({
        district: '---',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      loadDistrict();
    }
  }, [fontsLoaded, loadDistrict]);

  const locationColor = isDark ? '#FFFFFF' : '#000000';

  if (!fontsLoaded) {
    return (
      <View className="px-4 pt-2 items-center justify-center py-8">
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <View style={{ padding: 20, paddingBottom: 12, paddingTop: 24 }}>
      <View className="flex-row justify-between items-center mb-7">
        <Text
          style={{ fontFamily: 'Satoshi-Medium', fontWeight: '700' }}
          className="text-2xl dark:text-white text-black tracking-tight"
        >
          Latest Updates
        </Text>
        <View className="flex-row items-center gap-2">
          <LocationIcon size={18} color={locationColor} />
          {locationState.isLoading ? (
            <ActivityIndicator size="small" color={locationColor} />
          ) : (
            <Text
              style={{ fontFamily: 'Satoshi-Regular' }}
              className="text-sm dark:text-white/80 text-gray-700 font-medium"
            >
              {locationState.district}
            </Text>
          )}
        </View>
      </View>

      {items.map((item, index) => (
        <View key={item.id}>
          {index > 0 && (
            <View className="h-[0.5px] bg-gray-200 dark:bg-white/10 mb-7" />
          )}
          <Pressable
            onPress={() => onItemPress?.(item)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.95 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            })}
            className="mb-7"
          >
            <Text
              style={{ fontFamily: 'Satoshi-Medium', fontWeight: '700' }}
              className="text-[17px] dark:text-white text-black leading-[26px] mb-4 tracking-tight"
              numberOfLines={3}
            >
              {item.title}
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-row" style={{ marginRight: 4 }}>
                {[1, 2, 3].map((index) => (
                  <View
                    key={index}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: isDark ? '#000000' : '#FFFFFF',
                      marginLeft: index > 1 ? -8 : 0,
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
                        borderRadius: 10,
                      }}
                      contentFit="cover"
                    />
                  </View>
                ))}
              </View>
              <Text
                style={{ fontFamily: 'Satoshi-Regular', fontSize: 13 }}
                className="dark:text-white/70 text-gray-600"
              >
                {item.timeAgo.toLowerCase()}
              </Text>
              <View className="w-1 h-1 rounded-full bg-gray-400 dark:bg-white/30" />
              <Text
                style={{ fontFamily: 'Satoshi-Regular', fontSize: 13 }}
                className="dark:text-white/70 text-gray-600"
              >
                {item.category.toLowerCase()}
              </Text>
              {item.author && (
                <>
                  <View className="w-1 h-1 rounded-full bg-gray-400 dark:bg-white/30" />
                  <Text
                    style={{ fontFamily: 'Satoshi-Regular', fontSize: 13 }}
                    className="dark:text-white/70 text-gray-600"
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

