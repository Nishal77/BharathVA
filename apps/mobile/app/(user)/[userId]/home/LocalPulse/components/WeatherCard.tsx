import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, useColorScheme, ActivityIndicator, Pressable } from 'react-native';
import { useFonts } from 'expo-font';
import * as Location from 'expo-location';
import { weatherService, WeatherData } from '../../../../../../services/api/weatherService';

interface WeatherCardProps {
  onPress?: () => void;
}

// Get district from coordinates using Nominatim API (same as LatestUpdates)
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
      const district = 
        address.district || 
        address.state_district || 
        address.municipality ||
        address.city ||
        address.subAdministrativeArea ||
        null;

      return district || 'Unknown';
    }

    return 'Unknown';
  } catch (error) {
    console.error('Error fetching district:', error);
    return 'Unknown';
  }
};

const fetchUserDistrict = async (): Promise<string> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return 'Unknown';
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;
    const district = await getDistrictFromCoordinates(latitude, longitude);
    return district;
  } catch (error) {
    console.error('Error getting location:', error);
    return 'Unknown';
  }
};

export default function WeatherCard({ onPress }: WeatherCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [fontsLoaded] = useFonts({
    'Chirp-Regular': require('../../../../../../assets/fonts/Chirp-Regular.ttf'),
    'Chirp-Medium': require('../../../../../../assets/fonts/Chirp-Medium.ttf'),
    'Chirp-Bold': require('../../../../../../assets/fonts/Chirp-Bold.ttf'),
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [district, setDistrict] = useState<string>('Unknown');

  const loadDistrict = useCallback(async () => {
    try {
      const userDistrict = await fetchUserDistrict();
      setDistrict(userDistrict);
      return userDistrict;
    } catch (error) {
      console.error('Error loading district:', error);
      return 'Unknown';
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const userDistrict = await loadDistrict();
      await fetchWeather(userDistrict);
    };
    initialize();
  }, [loadDistrict]);

  // Check if coordinates are within India bounds
  const isWithinIndia = (lat: number, lon: number): boolean => {
    return lat >= 6.0 && lat <= 37.0 && lon >= 68.0 && lon <= 97.0;
  };

  const fetchWeather = async (userDistrict: string = 'Unknown') => {
    try {
      setLoading(true);
      setError(null);

      // Request location permission and get coordinates
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Fallback to Mumbai if permission denied
        const response = await weatherService.getWeatherByCity('Mumbai');
        if (response.success && response.data?.data) {
          setWeatherData(response.data.data);
        } else {
          setError('Unable to fetch weather data');
        }
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;

      // Check if coordinates are within India
      if (!isWithinIndia(latitude, longitude)) {
        // Coordinates outside India - use district or city name
        const locationName = userDistrict !== 'Unknown' ? userDistrict : 'Mumbai';
        const response = await weatherService.getWeatherByCity(locationName);
        
        if (response.success && response.data?.data) {
          setWeatherData(response.data.data);
        } else {
          // Final fallback to Mumbai
          const mumbaiResponse = await weatherService.getWeatherByCity('Mumbai');
          if (mumbaiResponse.success && mumbaiResponse.data?.data) {
            setWeatherData(mumbaiResponse.data.data);
          } else {
            setError('Unable to fetch weather data. Please ensure you are in India or try again later.');
          }
        }
        setLoading(false);
        return;
      }

      // Try to use district name first if available
      if (userDistrict !== 'Unknown') {
        const districtResponse = await weatherService.getWeatherByCity(userDistrict);
        if (districtResponse.success && districtResponse.data?.data) {
          setWeatherData(districtResponse.data.data);
          setLoading(false);
          return;
        }
      }

      // Coordinates are within India - use coordinate-based API
      const response = await weatherService.getWeatherByCoordinates(latitude, longitude);
      
      if (response.success && response.data?.data) {
        setWeatherData(response.data.data);
      } else {
        // If coordinate-based fails, try district or city-based lookup
        const locationName = userDistrict !== 'Unknown' ? userDistrict : 'Mumbai';
        const cityResponse = await weatherService.getWeatherByCity(locationName);
        
        if (cityResponse.success && cityResponse.data?.data) {
          setWeatherData(cityResponse.data.data);
        } else {
          setError(response.error?.message || 'Unable to fetch weather data');
        }
      }
    } catch (err: any) {
      // Final fallback to Mumbai
      try {
        const response = await weatherService.getWeatherByCity('Mumbai');
        if (response.success && response.data?.data) {
          setWeatherData(response.data.data);
        } else {
          setError(err.message || 'Failed to fetch weather');
        }
      } catch (fallbackError) {
        setError(err.message || 'Failed to fetch weather');
      }
    } finally {
      setLoading(false);
    }
  };

  const cardBgColor = isDark ? '#1A1A1A' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)';
  const innerBorderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
  const textPrimary = isDark ? '#FFFFFF' : '#111111';
  const textSecondary = isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.55)';
  const accentColor = '#3B82F6';
  const innerBgColor = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(249, 250, 251, 0.8)';

  if (!fontsLoaded) {
    return (
      <View style={{ paddingHorizontal: 6, paddingTop: 10, paddingBottom: 6, alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ paddingHorizontal: 6, paddingTop: 10, paddingBottom: 6 }}>
        <View
          style={{
            backgroundColor: cardBgColor,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: borderColor,
            padding: 24,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            shadowColor: isDark ? '#000000' : '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          <ActivityIndicator size="small" color={accentColor} />
          <Text
            style={{
              fontFamily: 'Chirp-Regular',
              fontSize: 14,
              color: textSecondary,
              marginTop: 12,
            }}
          >
            Loading weather...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !weatherData) {
    return (
      <View style={{ paddingHorizontal: 6, paddingTop: 10, paddingBottom: 6 }}>
        <View
          style={{
            backgroundColor: cardBgColor,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: borderColor,
            padding: 24,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            shadowColor: isDark ? '#000000' : '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontFamily: 'Chirp-Medium',
              fontSize: 14,
              color: textSecondary,
              textAlign: 'center',
            }}
          >
            {error || 'Weather data unavailable'}
          </Text>
        </View>
      </View>
    );
  }

  const temp = Math.round(weatherData.temperature.current);
  const feelsLike = Math.round(weatherData.temperature.feelsLike);
  const humidity = weatherData.humidity.value;
  const uvIndex = weatherData.current.uvIndex ? Math.round(weatherData.current.uvIndex) : 0;
  const condition = weatherData.condition.main.toLowerCase();
  const description = weatherData.condition.description.toLowerCase();

  // Determine alerts based on weather conditions
  const alerts: string[] = [];
  if (temp >= 40) {
    alerts.push('⚠️ Heatwave');
  }
  if (condition.includes('rain') || condition.includes('storm') || condition.includes('thunder')) {
    if (condition.includes('heavy') || condition.includes('extreme')) {
      alerts.push('🌧️ Heavy Rain predicted');
    } else {
      alerts.push('🌧️ Rain');
    }
  }
  if (condition.includes('flood') || description.includes('flood')) {
    alerts.push('🌊 Flood Alert');
  }
  if (condition.includes('storm') || description.includes('storm')) {
    alerts.push('⛈️ Storm Alert');
  }

  // Get AQI from air pollution data if available, otherwise use fallback
  const getAQI = () => {
    if (weatherData.airPollution && weatherData.airPollution.aqi) {
      return {
        value: weatherData.airPollution.aqi,
        level: weatherData.airPollution.aqiLevel || getAQILevelName(weatherData.airPollution.aqi),
        pm2_5: weatherData.airPollution.pm2_5,
        pm10: weatherData.airPollution.pm10,
      };
    }
    // Fallback calculation based on visibility and condition
    if (condition.includes('haze') || condition.includes('smoke') || condition.includes('fog')) {
      return { value: 142, level: 'Unhealthy', pm2_5: undefined, pm10: undefined };
    }
    if (condition.includes('clear') || condition.includes('sunny')) {
      return { value: 45, level: 'Good', pm2_5: undefined, pm10: undefined };
    }
    return { value: 78, level: 'Moderate', pm2_5: undefined, pm10: undefined };
  };

  const getAQILevelName = (aqi: number): string => {
    switch (aqi) {
      case 1: return 'Good';
      case 2: return 'Fair';
      case 3: return 'Moderate';
      case 4: return 'Poor';
      case 5: return 'Very Poor';
      default: return 'Unknown';
    }
  };

  const getAQIColor = (aqi: number): string => {
    switch (aqi) {
      case 1: return '#10B981'; // Green - Good
      case 2: return '#84CC16'; // Yellow-Green - Fair
      case 3: return '#F59E0B'; // Orange - Moderate
      case 4: return '#EF4444'; // Red - Poor
      case 5: return '#991B1B'; // Dark Red - Very Poor
      default: return textSecondary;
    }
  };

  const getAQIBadgeColor = (aqi: number): { bg: string; text: string; border: string } => {
    switch (aqi) {
      case 1: return { bg: '#10B981', text: '#FFFFFF', border: '#059669' }; // Green - Good
      case 2: return { bg: '#84CC16', text: '#FFFFFF', border: '#65A30D' }; // Yellow-Green - Fair
      case 3: return { bg: '#F59E0B', text: '#FFFFFF', border: '#D97706' }; // Orange - Moderate
      case 4: return { bg: '#EF4444', text: '#FFFFFF', border: '#DC2626' }; // Red - Poor
      case 5: return { bg: '#991B1B', text: '#FFFFFF', border: '#7F1D1D' }; // Dark Red - Very Poor
      default: return { bg: textSecondary, text: '#FFFFFF', border: textSecondary };
    }
  };

  const aqi = getAQI();
  const rainChance = condition.includes('rain') || condition.includes('drizzle') ? Math.max(60, humidity) : Math.min(30, humidity);

  // UV Index level
  const getUVLevel = (uv: number) => {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  };

  const uvLevel = getUVLevel(uvIndex || 0);

  // Get weather icon emoji based on condition
  const getWeatherIcon = () => {
    const main = condition;
    if (main.includes('clear') || main.includes('sunny')) return '☀️';
    if (main.includes('rain') || main.includes('drizzle')) return '🌧️';
    if (main.includes('storm') || main.includes('thunder')) return '⛈️';
    if (main.includes('cloud')) return '☁️';
    if (main.includes('mist') || main.includes('fog') || main.includes('haze')) return '🌫️';
    if (main.includes('snow')) return '❄️';
    return '🌤️';
  };

  return (
    <View style={{ paddingHorizontal: 6, paddingTop: 10, paddingBottom: 6 }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: cardBgColor,
          borderRadius: 24,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: borderColor,
          opacity: pressed ? 0.98 : 1,
          width: '100%',
          shadowColor: isDark ? '#000000' : '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 16,
          elevation: 4,
        })}
      >
        <View style={{ padding: 20 }}>
            {/* Header Row - Today with Location */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <Text
                style={{
                  fontFamily: 'Chirp-Bold',
                  fontSize: 20,
                  color: textPrimary,
                  letterSpacing: -0.5,
                  lineHeight: 24,
                }}
              >
                Today
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 26, opacity: 0.9 }}>
                  {getWeatherIcon()}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Chirp-Medium',
                    fontSize: 13.5,
                    color: textSecondary,
                    letterSpacing: 0.15,
                    lineHeight: 18,
                  }}
                >
                  {district !== 'Unknown' ? district : (weatherData.location.district !== 'Unknown' ? weatherData.location.district : weatherData.location.city)}
                  {weatherData.location.country && `, ${weatherData.location.country}`}
                </Text>
              </View>
            </View>

            {/* Temperature - Main Display */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }}>
              <Text
                style={{
                  fontFamily: 'Chirp-Bold',
                  fontSize: 56,
                  color: textPrimary,
                  letterSpacing: -2,
                  lineHeight: 64,
                }}
              >
                {temp}°
              </Text>
              <View style={{ marginLeft: 12, marginTop: 10 }}>
                <Text
                  style={{
                    fontFamily: 'Chirp-Regular',
                    fontSize: 15,
                    color: textSecondary,
                    letterSpacing: 0.15,
                    lineHeight: 20,
                  }}
                >
                  Feels {feelsLike}°
                </Text>
              </View>
            </View>

            {/* Key Metrics Row - Horizontal Single Line */}
            <View style={{ marginBottom: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                {/* Rain */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text
                    style={{
                      fontFamily: 'Chirp-Medium',
                      fontSize: 14,
                      color: textSecondary,
                      letterSpacing: 0.15,
                    }}
                  >
                    Rain
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Chirp-Bold',
                      fontSize: 14,
                      color: rainChance >= 50 ? '#3B82F6' : rainChance >= 30 ? '#60A5FA' : '#93C5FD',
                      letterSpacing: 0.15,
                    }}
                  >
                    {rainChance}%
                  </Text>
                </View>
                
                {/* Separator */}
                <Text
                  style={{
                    fontFamily: 'Chirp-Regular',
                    fontSize: 16,
                    color: textSecondary,
                    opacity: 0.3,
                  }}
                >
                  |
                </Text>

                {/* AQI */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text
                    style={{
                      fontFamily: 'Chirp-Medium',
                      fontSize: 14,
                      color: textSecondary,
                      letterSpacing: 0.15,
                    }}
                  >
                    AQI
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Chirp-Bold',
                      fontSize: 14,
                      color: getAQIColor(aqi.value),
                      letterSpacing: 0.15,
                    }}
                  >
                    {aqi.value}
                  </Text>
                  <View style={{
                    backgroundColor: getAQIBadgeColor(aqi.value).bg,
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderWidth: 1,
                    borderColor: getAQIBadgeColor(aqi.value).border,
                    shadowColor: getAQIColor(aqi.value),
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.4,
                    shadowRadius: 3,
                    elevation: 2,
                  }}>
                    <Text
                      style={{
                        fontFamily: 'Chirp-Bold',
                        fontSize: 10,
                        color: getAQIBadgeColor(aqi.value).text,
                        letterSpacing: 0.15,
                        lineHeight: 13,
                      }}
                    >
                      {aqi.level}
                    </Text>
                  </View>
                </View>

                {/* Separator */}
                <Text
                  style={{
                    fontFamily: 'Chirp-Regular',
                    fontSize: 16,
                    color: textSecondary,
                    opacity: 0.3,
                  }}
                >
                  |
                </Text>

                {/* UV Index */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text
                    style={{
                      fontFamily: 'Chirp-Medium',
                      fontSize: 14,
                      color: textSecondary,
                      letterSpacing: 0.15,
                    }}
                  >
                    UV
                  </Text>
                  <View style={{
                    backgroundColor: uvIndex >= 10 ? '#DC2626' : uvIndex >= 7 ? '#F59E0B' : uvIndex >= 5 ? '#FBBF24' : uvIndex >= 3 ? '#84CC16' : '#10B981',
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderWidth: 1,
                    borderColor: uvIndex >= 10 ? '#B91C1C' : uvIndex >= 7 ? '#D97706' : uvIndex >= 5 ? '#F59E0B' : uvIndex >= 3 ? '#65A30D' : '#059669',
                    shadowColor: uvIndex >= 7 ? (uvIndex >= 10 ? '#DC2626' : '#F59E0B') : 'transparent',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: uvIndex >= 7 ? 0.3 : 0,
                    shadowRadius: 3,
                    elevation: uvIndex >= 7 ? 2 : 0,
                  }}>
                    <Text
                      style={{
                        fontFamily: 'Chirp-Bold',
                        fontSize: 10,
                        color: '#FFFFFF',
                        letterSpacing: 0.15,
                        lineHeight: 13,
                      }}
                    >
                      {uvLevel}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Air Pollution Details */}
              {aqi.pm2_5 !== undefined && aqi.pm10 !== undefined && (
                <View style={{ marginTop: 12, flexDirection: 'row', gap: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text
                      style={{
                        fontFamily: 'Chirp-Regular',
                        fontSize: 11.5,
                        color: textSecondary,
                        letterSpacing: 0.1,
                      }}
                    >
                      PM2.5:
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Chirp-Medium',
                        fontSize: 11.5,
                        color: textPrimary,
                        letterSpacing: 0.1,
                      }}
                    >
                      {Math.round(aqi.pm2_5)} μg/m³
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text
                      style={{
                        fontFamily: 'Chirp-Regular',
                        fontSize: 11.5,
                        color: textSecondary,
                        letterSpacing: 0.1,
                      }}
                    >
                      PM10:
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Chirp-Medium',
                        fontSize: 11.5,
                        color: textPrimary,
                        letterSpacing: 0.1,
                      }}
                    >
                      {Math.round(aqi.pm10)} μg/m³
                    </Text>
                  </View>
                </View>
              )}
            </View>

          {/* Alerts - Compact Design */}
            {alerts.length > 0 && (
              <View style={{ 
                marginBottom: 18, 
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.06)',
                borderRadius: 14,
                padding: 14,
                borderWidth: 0.5,
                borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)',
              }}>
                <Text
                  style={{
                    fontFamily: 'Chirp-Bold',
                    fontSize: 12.5,
                    color: '#EF4444',
                    marginBottom: 8,
                    letterSpacing: 0.2,
                    lineHeight: 16,
                  }}
                >
                  Alerts:
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {alerts.map((alert, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.12)',
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderWidth: 0.5,
                        borderColor: isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Chirp-Medium',
                          fontSize: 11.5,
                          color: '#EF4444',
                          letterSpacing: 0.15,
                          lineHeight: 15,
                        }}
                      >
                        {alert}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
        </View>
      </Pressable>
    </View>
  );
}

