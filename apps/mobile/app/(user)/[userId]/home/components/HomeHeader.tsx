import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View, useColorScheme } from 'react-native';
import { Svg, Path } from 'react-native-svg';

interface HomeHeaderProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  onMessagesPress: () => void;
  tabs: string[];
}

const isWithinIndia = (lat: number, lon: number): boolean => {
  return lat >= 6.0 && lat <= 37.0 && lon >= 68.0 && lon <= 97.0;
};

const getDistrictFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    if (!isWithinIndia(latitude, longitude)) {
      console.warn('Coordinates outside India bounds:', latitude, longitude);
      return '';
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&countrycodes=in`,
      {
        headers: {
          'User-Agent': 'BharathVA-Mobile-App',
          'Accept-Language': 'en-IN,en',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    
    if (!data || !data.address) {
      return '';
    }

    const address = data.address;
    
    if (address.country_code && address.country_code.toLowerCase() !== 'in') {
      console.warn('Location not in India, country code:', address.country_code);
      return '';
    }

    const district = 
      address.district || 
      address.state_district || 
      address.municipality ||
      address.county ||
      address.suburb ||
      null;

    if (district) {
      return district;
    }

    return '';
  } catch (error) {
    console.error('Error fetching district:', error);
    return '';
  }
};

const fetchUserDistrict = async (): Promise<string> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission denied');
      return '';
    }

    let location;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: attempts === 0 
            ? Location.Accuracy.Highest 
            : attempts === 1 
            ? Location.Accuracy.High 
            : Location.Accuracy.Balanced,
        });

        const { latitude, longitude, accuracy } = location.coords;

        if (accuracy && accuracy > 1000) {
          console.warn(`Location accuracy too low: ${accuracy}m, attempt ${attempts + 1}`);
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        }

        if (!isWithinIndia(latitude, longitude)) {
          console.warn('Coordinates outside India:', latitude, longitude);
          return '';
        }

        const district = await getDistrictFromCoordinates(latitude, longitude);
        
        if (district) {
          return district;
        }

        if (attempts < maxAttempts - 1) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        return '';
      } catch (locationError) {
        console.error(`Location fetch attempt ${attempts + 1} failed:`, locationError);
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw locationError;
        }
      }
    }

    return '';
  } catch (error) {
    console.error('Error getting location:', error);
    return '';
  }
};

export default function HomeHeader({ 
  activeTab, 
  onTabPress, 
  onMessagesPress,
  tabs 
}: HomeHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [userDistrict, setUserDistrict] = useState<string>('');

  useEffect(() => {
    const loadDistrict = async () => {
      const district = await fetchUserDistrict();
      setUserDistrict(district);
    };
    loadDistrict();
  }, []);

  const iconColor = isDark ? '#FFFFFF' : '#000000';
  const activeTextColor = isDark ? '#FFFFFF' : '#000000';
  const inactiveTextColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <BlurView
      intensity={50}
      tint={isDark ? "dark" : "light"}
      className="absolute top-0 left-0 right-0 z-50 px-6"
      style={{
        paddingTop: 48,
        paddingBottom: 16,
      }}
    >
      <View 
        className="absolute inset-0"
        style={{
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.35)',
        }}
      />
      
      <View 
        className="absolute left-0 right-0 top-0"
        style={{
          height: 72,
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.25)',
        }}
      />
      
      <View 
        className="absolute left-0 right-0 top-0"
        style={{
          height: 40,
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.4)',
        }}
      />
      
      <View className="relative" style={{ zIndex: 10 }}>
        <View className="flex-row items-center justify-between mb-0">
          <Pressable
            className="items-center justify-center"
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
            accessibilityLabel="Profile"
            accessibilityRole="button"
          >
            <Svg
              width={32}
              height={32}
              viewBox="0 0 32 32"
            >
              <Path
                d="M13.443,27.064c-5.297,.522-9.87-1.872-10.215-5.35-.344-3.478,3.673-6.721,8.97-7.244,5.298-.524,9.871,1.871,10.215,5.347,.343,3.479-3.672,6.724-8.97,7.247m10.595-11.546c-.451-.135-.76-.227-.524-.818,.511-1.286,.564-2.395,.01-3.186-1.039-1.484-3.881-1.404-7.139-.04,0-.002-1.023,.448-.761-.364,.501-1.611,.426-2.96-.354-3.739-1.767-1.769-6.468,.067-10.499,4.096C1.753,14.486,0,17.685,0,20.452,0,25.744,6.786,28.961,13.425,28.961c8.703,0,14.492-5.057,14.492-9.071,0-2.425-2.043-3.802-3.879-4.372"
                fill={iconColor}
              />
              <Path
                d="M29.818,5.835c-2.101-2.33-5.202-3.218-8.063-2.609h0c-.661,.141-1.084,.793-.942,1.454,.141,.661,.792,1.084,1.454,.942,2.036-.432,4.238,.201,5.733,1.855,1.493,1.655,1.898,3.913,1.259,5.891h0c-.209,.646,.144,1.336,.79,1.544,.643,.208,1.334-.144,1.542-.787v-.005c.897-2.785,.33-5.958-1.772-8.285"
                fill={iconColor}
              />
              <Path
                d="M26.59,8.747c-1.023-1.134-2.533-1.566-3.927-1.269-.57,.121-.933,.682-.811,1.253,.122,.568,.682,.933,1.251,.809h0c.681-.144,1.42,.067,1.921,.62,.501,.555,.635,1.311,.42,1.975h0c-.179,.553,.124,1.148,.679,1.328,.555,.177,1.149-.125,1.328-.679,.437-1.357,.163-2.902-.862-4.037"
                fill={iconColor}
              />
              <Path
                d="M13.735,20.765c-.185,.317-.595,.469-.916,.337-.316-.13-.415-.484-.235-.796,.185-.31,.579-.461,.893-.336,.32,.118,.435,.476,.258,.795m-1.688,2.167c-.512,.817-1.609,1.175-2.436,.798-.814-.371-1.055-1.321-.542-2.118,.506-.793,1.566-1.148,2.387-.803,.829,.354,1.095,1.297,.591,2.123m1.925-5.786c-2.521-.656-5.37,.6-6.465,2.822-1.115,2.265-.037,4.78,2.51,5.602,2.639,.851,5.748-.453,6.829-2.898,1.066-2.39-.265-4.851-2.874-5.526"
                fill={iconColor}
              />
            </Svg>
          </Pressable>

          <View className="w-16 h-16" />

          <Pressable
            onPress={onMessagesPress}
            className="items-center justify-center relative"
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
            accessibilityLabel="Open messages"
            accessibilityRole="button"
          >
            <Image
              source={require('../../../../../assets/logo/message.png')}
              className="w-7 h-7"
              style={{
                tintColor: iconColor
              }}
              contentFit="contain"
            />
            
            <View 
              className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 rounded-full justify-center items-center"
              style={{
                paddingHorizontal: 4,
              }}
            >
              <Text 
                className="text-white text-[11px] font-bold text-center"
                style={{
                  lineHeight: 13,
                }}
              >
                3
              </Text>
            </View>
          </Pressable>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="pt-3"
          contentContainerStyle={{ 
            paddingLeft: 0,
            paddingRight: 16,
            alignItems: 'center',
            paddingBottom: 0,
          }}
        >
          <View className="flex-row gap-6">
            {['For You', 'Following', 'Local Pulse', 'Public Safety', 'Communities', 'Space(Live)'].map((tab, index) => {
              const displayTab = tab === 'Local Pulse' 
                ? (userDistrict || 'Local Pulse')
                : tab;
              const tabKey = tab === 'Local Pulse' ? 'Local Pulse' : tab;
              const isActive = activeTab === tabKey;
              
              return (
                <Pressable
                  key={tabKey}
                  onPress={() => onTabPress(tabKey)}
                  className="py-2 relative"
                  style={({ pressed }) => ({
                    paddingHorizontal: 16,
                    opacity: pressed ? 0.7 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <Text
                    className="text-sm"
                    style={{
                      fontWeight: isActive ? '700' : '600',
                      color: isActive ? activeTextColor : inactiveTextColor,
                    }}
                  >
                    {displayTab}
                  </Text>
                  {isActive && (
                    <View 
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{
                        backgroundColor: activeTextColor,
                        marginHorizontal: 16,
                      }}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </BlurView>
  );
}
