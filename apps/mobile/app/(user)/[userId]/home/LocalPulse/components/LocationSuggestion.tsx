import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  useColorScheme,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { getAllCities, searchCities, IndianCity } from '../../../../../../services/api/citiesService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LocationSuggestion() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<IndianCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocationCity, setCurrentLocationCity] = useState<IndianCity | null>(null);
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadCities();
    loadCurrentLocation();
    
    // Focus search input after a delay
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);
  }, []);

  const loadCities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[LocationSuggestion] Starting to load cities...');
      const response = await getAllCities();
      console.log('[LocationSuggestion] Cities response:', {
        success: response.success,
        count: response.cities?.length || 0,
        message: response.message,
      });
      
      if (response.success && response.cities && response.cities.length > 0) {
        console.log('[LocationSuggestion] Setting cities:', response.cities.length);
        setCities(response.cities);
        setError(null);
      } else {
        const errorMsg = response.message || 'No cities found';
        console.warn('[LocationSuggestion] No cities received:', errorMsg);
        setCities([]);
        setError(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load cities';
      console.error('[LocationSuggestion] Error loading cities:', error);
      console.error('[LocationSuggestion] Error details:', {
        message: errorMsg,
        stack: error instanceof Error ? error.stack : undefined,
      });
      setCities([]);
      setError(errorMsg);
    } finally {
      setLoading(false);
      console.log('[LocationSuggestion] Loading complete');
    }
  }, []);

  const loadCurrentLocation = useCallback(async () => {
    setLoadingCurrentLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoadingCurrentLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      
      if (latitude >= 6.0 && latitude <= 37.0 && longitude >= 68.0 && longitude <= 97.0) {
        // Find nearest city from loaded cities
        if (cities.length > 0) {
          let nearestCity: IndianCity | null = null;
          let minDistance = Infinity;
          
          for (const city of cities) {
            const distance = calculateDistance(
              latitude,
              longitude,
              city.latitude,
              city.longitude
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              nearestCity = city;
            }
          }
          
          setCurrentLocationCity(nearestCity);
        }
      }
    } catch (error) {
      console.error('[LocationSuggestion] Error loading current location:', error);
    } finally {
      setLoadingCurrentLocation(false);
    }
  }, [cities]);

  // Update current location when cities are loaded
  useEffect(() => {
    if (cities.length > 0 && !currentLocationCity) {
      loadCurrentLocation();
    }
  }, [cities, currentLocationCity, loadCurrentLocation]);

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length > 0) {
      setSearching(true);
      setError(null);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('[LocationSuggestion] Searching for:', searchQuery);
          const response = await searchCities(searchQuery);
          console.log('[LocationSuggestion] Search response:', {
            success: response.success,
            count: response.cities?.length || 0,
            message: response.message,
          });
          
          if (response.success && response.cities) {
            setCities(response.cities);
            setError(null);
          } else {
            setCities([]);
            setError(response.message || 'No cities found');
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Search failed';
          console.error('[LocationSuggestion] Error searching:', error);
          setCities([]);
          setError(errorMsg);
        } finally {
          setSearching(false);
        }
      }, 300);
    } else {
      // Reload all cities when search is cleared
      setError(null);
      loadCities();
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, loadCities]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const handleCitySelect = (city: IndianCity) => {
    const userId = params.userId as string;
    console.log('[LocationSuggestion] City selected:', city.city, {
      latitude: city.latitude,
      longitude: city.longitude,
      district: city.district,
    });
    
    // Navigate back to remove LocationSuggestion from stack
    // Then set params on the current route (which should be index/LatestUpdates)
    // This ensures we always go to LatestUpdates/index, never to [newsId]
    if (router.canGoBack()) {
      router.back();
      
      // After going back, set params on the current route
      // This updates LatestUpdates with the selected city
      setTimeout(() => {
        router.setParams({
          selectedCity: JSON.stringify(city),
        });
      }, 100);
    } else {
      // Fallback: navigate directly to index if can't go back
      router.replace({
        pathname: '/(user)/[userId]/home/LocalPulse/index' as any,
        params: {
          userId,
          selectedCity: JSON.stringify(city),
        },
      });
    }
  };

  const handleCurrentLocationPress = async () => {
    if (currentLocationCity) {
      handleCitySelect(currentLocationCity);
    } else {
      setLoadingCurrentLocation(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;
        
        if (latitude >= 6.0 && latitude <= 37.0 && longitude >= 68.0 && longitude <= 97.0) {
          // Find nearest city
          if (cities.length > 0) {
            let nearestCity: IndianCity | null = null;
            let minDistance = Infinity;
            
            for (const city of cities) {
              const distance = calculateDistance(
                latitude,
                longitude,
                city.latitude,
                city.longitude
              );
              
              if (distance < minDistance) {
                minDistance = distance;
                nearestCity = city;
              }
            }
            
            if (nearestCity) {
              handleCitySelect(nearestCity);
            }
          }
        }
      } catch (error) {
        console.error('[LocationSuggestion] Error getting current location:', error);
      } finally {
        setLoadingCurrentLocation(false);
      }
    }
  };

  const renderCityItem = ({ item }: { item: IndianCity }) => {
    return (
      <View>
    <Pressable
      onPress={() => handleCitySelect(item)}
          className={`py-5 pl-8 pr-6 ${
            isDark ? 'active:bg-white/2' : 'active:bg-black/1'
          }`}
      style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
            <Text
                className={`font-chirp-medium text-[17px] font-semibold ${
                  isDark ? 'text-white' : 'text-black'
                }`}
                style={{ letterSpacing: -0.3 }}
                numberOfLines={1}
              >
                {item.city}
                {item.district && (
                <Text
                    className={`font-chirp-regular text-[15px] ${
                      isDark ? 'text-white/70' : 'text-black/70'
                    }`}
                    style={{ letterSpacing: 0.1 }}
                  >
                    {', '}
                    {item.district}
                  </Text>
                )}
                </Text>
              </View>
            <View
              className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                isDark ? 'border-white/30' : 'border-black/30'
              }`}
            >
              <View className="w-3 h-3 rounded-full bg-transparent" />
            </View>
          </View>
        </Pressable>
        <View
          className={`mx-8 ${
            isDark ? 'border-white/8' : 'border-black/5'
          }`}
          style={{
            borderBottomWidth: 1,
          }}
        />
      </View>
  );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
        {/* Header */}
        <View
          className="pb-5 px-6"
          style={{
            paddingTop: Platform.OS === 'ios' ? 64 : 48,
          }}
        >
          <View className="flex-row justify-between items-center">
            <Text
              className={`font-chirp-bold text-2xl font-bold ${
                isDark ? 'text-white' : 'text-black'
              }`}
              style={{ letterSpacing: -0.5 }}
            >
              Select Location
            </Text>
            <Pressable
              onPress={() => router.back()}
              className="w-8 h-8 items-center justify-center"
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                className={`text-2xl font-light ${
                  isDark ? 'text-white' : 'text-black'
                }`}
              >
                ×
              </Text>
            </Pressable>
          </View>

          {/* Search Input */}
          <View
            className={`mt-5 flex-row items-center rounded-xl px-4 py-3.5 border ${
              isDark 
                ? 'bg-white/5 border-white/8' 
                : 'bg-black/2 border-black/5'
            }`}
          >
            <View className="w-[18px] h-[18px] mr-3 items-center justify-center">
              <View
                className={`w-3.5 h-3.5 rounded-full border ${
                  isDark ? 'border-white/30' : 'border-black/30'
                }`}
                style={{ borderWidth: 1.5 }}
              />
              <View
                className={`absolute right-[-1px] bottom-[-1px] w-1.5 h-0.5 ${
                  isDark ? 'bg-white/30' : 'bg-black/30'
                }`}
                style={{ transform: [{ rotate: '45deg' }] }}
              />
            </View>
            <TextInput
              ref={searchInputRef}
              placeholder="Search City"
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className={`flex-1 text-base font-normal ${
                isDark ? 'text-white' : 'text-black'
              }`}
              style={{ letterSpacing: 0.1 }}
              autoCapitalize="words"
              autoCorrect={false}
              editable={true}
              selectTextOnFocus={false}
              clearButtonMode="never"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery('')}
                className={`ml-2.5 w-7 h-7 rounded-full items-center justify-center ${
                  isDark ? 'bg-white/8' : 'bg-black/6'
                }`}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <View
                  className={`w-[11px] h-0.5 ${
                    isDark ? 'bg-white/60' : 'bg-black/60'
                  }`}
                  style={{ transform: [{ rotate: '45deg' }] }}
                />
                <View
                  className={`absolute w-[11px] h-0.5 ${
                    isDark ? 'bg-white/60' : 'bg-black/60'
                  }`}
                  style={{ transform: [{ rotate: '-45deg' }] }}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* Cities List */}
        <View className="flex-1">
          {loading ? (
            <View className="p-20 items-center justify-center flex-1">
              <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#000000'} />
              <Text
                className={`mt-5 text-[15px] font-medium ${
                  isDark ? 'text-white/60' : 'text-black/60'
                }`}
                style={{ letterSpacing: 0.1 }}
              >
                Loading cities...
              </Text>
            </View>
          ) : error ? (
            <View className="p-20 items-center justify-center flex-1">
              <Text
                className={`text-lg font-bold text-center mb-3 ${
                  isDark ? 'text-white/90' : 'text-black/90'
                }`}
                style={{ letterSpacing: -0.3 }}
              >
                Unable to load cities
              </Text>
              <Text
                className={`text-[15px] text-center px-12 ${
                  isDark ? 'text-white/60' : 'text-black/60'
                }`}
                style={{ lineHeight: 22 }}
              >
                {error}
              </Text>
              <Pressable
                onPress={loadCities}
                className={`mt-7 py-3.5 px-8 rounded-2xl border ${
                  isDark 
                    ? 'bg-white/10 border-white/15' 
                    : 'bg-black/8 border-black/12'
                }`}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  borderWidth: 1.5,
                })}
              >
                <Text
                  className={`text-[15px] font-semibold ${
                    isDark ? 'text-white' : 'text-black'
                  }`}
                  style={{ letterSpacing: 0.2 }}
                >
                  Retry
                </Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={cities}
              renderItem={renderCityItem}
              keyExtractor={(item) => item.id.toString()}
              className="flex-1"
              contentContainerStyle={{ 
                paddingBottom: 40,
                paddingTop: 8,
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                searchQuery.trim().length > 0 && cities.length > 0 ? (
                  <View className="pl-8 pr-6 pt-5 pb-3">
                    <Text
                      className={`font-chirp-medium text-xs font-semibold uppercase ${
                        isDark ? 'text-white/60' : 'text-black/60'
                      }`}
                      style={{ letterSpacing: 0.2 }}
                    >
                      Search Results ({cities.length})
                    </Text>
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <View className="p-20 items-center justify-center">
                  {searching ? (
                    <>
                      <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#000000'} />
                      <Text
                        className={`mt-4 text-[15px] font-medium ${
                          isDark ? 'text-white/60' : 'text-black/60'
                        }`}
                        style={{ letterSpacing: 0.1 }}
                      >
                        Searching...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text
                        className={`text-[17px] mb-2 font-semibold ${
                          isDark ? 'text-white/70' : 'text-black/70'
                        }`}
                        style={{ letterSpacing: -0.2 }}
                      >
                        No cities found
                      </Text>
                      <Text
                        className={`text-sm ${
                          isDark ? 'text-white/50' : 'text-black/50'
                        }`}
                        style={{ letterSpacing: 0.1 }}
                      >
                        Try a different search term
                      </Text>
                    </>
                  )}
                </View>
              }
            />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

