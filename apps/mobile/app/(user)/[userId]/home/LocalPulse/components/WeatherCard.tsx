import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, useColorScheme, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import * as Location from 'expo-location';
import { Svg, Path, Circle } from 'react-native-svg';
import { weatherService, WeatherData } from '../../../../../../services/api/weatherService';

// Get screen dimensions for responsive design
const getScreenDimensions = () => Dimensions.get('window');
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = getScreenDimensions();

// Calculate device category based on both width and height
const getDeviceCategory = () => {
  const width = SCREEN_WIDTH;
  const height = SCREEN_HEIGHT;
  const aspectRatio = width / height;
  const diagonal = Math.sqrt(width * width + height * height);
  
  // Consider both width and aspect ratio for better categorization
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
const isLargeDevice = deviceCategory === 'large';

// Enhanced responsive scaling functions that consider both dimensions
const scale = (size: number, baseWidth: number = 375) => {
  const widthScale = SCREEN_WIDTH / baseWidth;
  const heightScale = SCREEN_HEIGHT / 667; // iPhone 8 height as base
  // Use the smaller scale to prevent overflow
  const scaleFactor = Math.min(widthScale, heightScale, 1.2); // Cap at 1.2x
  return size * scaleFactor;
};

const moderateScale = (size: number, factor = 0.5, baseWidth: number = 375) => {
  const scaled = scale(size, baseWidth);
  return size + (scaled - size) * factor;
};

// Font scaling that ensures readability
const scaleFont = (size: number) => {
  const baseSize = 375;
  const scaleFactor = Math.min(SCREEN_WIDTH / baseSize, SCREEN_HEIGHT / 667, 1.15);
  return Math.max(size * scaleFactor, size * 0.85); // Never go below 85% of original
};

interface WeatherCardProps {
  onPress?: () => void;
}

// Get district from coordinates using Nominatim API (same as LatestUpdates)
const getDistrictFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  // Validate coordinates are within India bounds
  const isIndiaLocation = latitude >= 6.0 && latitude <= 37.0 && longitude >= 68.0 && longitude <= 97.0;
  
  if (!isIndiaLocation) {
    console.warn('[WeatherCard] Coordinates outside India bounds, skipping district fetch');
    return 'Unknown';
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BharathVA-Mobile-App',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return 'Unknown';
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
  } catch (error: any) {
    // Network errors are expected, use warn instead of error
    if (error.name === 'AbortError') {
      console.warn('[WeatherCard] District fetch timed out');
    } else if (error.message?.includes('Network request failed')) {
      console.warn('[WeatherCard] Network unavailable for district fetch');
    } else {
      console.warn('[WeatherCard] Error fetching district:', error.message || error);
    }
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
      maximumAge: 60000,
      timeout: 10000,
    });

    const { latitude, longitude } = location.coords;
    
    // Validate coordinates are within India bounds
    const isIndiaLocation = latitude >= 6.0 && latitude <= 37.0 && longitude >= 68.0 && longitude <= 97.0;
    
    if (!isIndiaLocation) {
      console.warn('[WeatherCard] Location outside India bounds');
      return 'Unknown';
    }

    const district = await getDistrictFromCoordinates(latitude, longitude);
    return district;
  } catch (error: any) {
    console.warn('[WeatherCard] Error getting location:', error.message || error);
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
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  // Handle dimension changes (rotation, split screen, etc.)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  // Calculate responsive values based on current dimensions (used in all states)
  const calculateResponsiveValues = () => {
    const currentWidth = dimensions.width;
    const currentHeight = dimensions.height;
    const currentAspectRatio = currentWidth / currentHeight;
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

    const currentScaleFont = (size: number) => {
      const baseSize = 375;
      const scaleFactor = Math.min(currentWidth / baseSize, currentHeight / 667, 1.15);
      return Math.max(size * scaleFactor, size * 0.85);
    };

    return {
      currentIsSmallDevice,
      currentIsMediumDevice,
      cardPadding: Math.round(currentModerateScale(currentIsSmallDevice ? 16 : 20)),
      cardMinHeight: Math.round(currentModerateScale(currentIsSmallDevice ? 180 : currentIsMediumDevice ? 200 : 220, 0.5)),
      currentModerateScale,
      currentScaleFont,
    };
  };

  const responsiveValues = calculateResponsiveValues();

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
      let location: Location.LocationObject | null = null;
      try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Fallback to Mumbai if permission denied
          const response = await weatherService.getWeatherByCity('Mumbai');
          if (response.success && response.data?.data) {
            setWeatherData(response.data.data);
          } else {
            setError('Unable to fetch weather data');
          }
          return;
        }

        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      } catch (locationError: any) {
        // If location fetch fails, fallback to Mumbai
        const response = await weatherService.getWeatherByCity('Mumbai');
        if (response.success && response.data?.data) {
          setWeatherData(response.data.data);
        } else {
          setError('Unable to fetch location. Using default weather data.');
        }
        return;
      }

      if (!location) {
        // Final fallback to Mumbai
        const response = await weatherService.getWeatherByCity('Mumbai');
        if (response.success && response.data?.data) {
          setWeatherData(response.data.data);
        } else {
          setError('Unable to fetch weather data');
        }
        return;
      }

      const { latitude, longitude } = location.coords;

      // Check if coordinates are within India
      if (!isWithinIndia(latitude, longitude)) {
        // Coordinates outside India - use district or city name
        const locationName = userDistrict !== 'Unknown' ? userDistrict : 'Mumbai';
        try {
        const response = await weatherService.getWeatherByCity(locationName);
        if (response.success && response.data?.data) {
          setWeatherData(response.data.data);
            return;
          }
        } catch (cityError) {
          // Silently continue to fallback
        }

          // Final fallback to Mumbai
        try {
          const mumbaiResponse = await weatherService.getWeatherByCity('Mumbai');
          if (mumbaiResponse.success && mumbaiResponse.data?.data) {
            setWeatherData(mumbaiResponse.data.data);
          } else {
            setError('Unable to fetch weather data. Please ensure you are in India or try again later.');
          }
        } catch (mumbaiError) {
          setError('Unable to fetch weather data. Please try again later.');
        }
        return;
      }

      // Try to use district name first if available
      if (userDistrict !== 'Unknown') {
        try {
        const districtResponse = await weatherService.getWeatherByCity(userDistrict);
        if (districtResponse.success && districtResponse.data?.data) {
          setWeatherData(districtResponse.data.data);
          return;
          }
        } catch (districtError) {
          // Silently continue to coordinate-based lookup
        }
      }

      // Coordinates are within India - use coordinate-based API
      try {
      const response = await weatherService.getWeatherByCoordinates(latitude, longitude);
      if (response.success && response.data?.data) {
        setWeatherData(response.data.data);
          return;
        }
      } catch (coordinateError) {
        // Silently continue to city-based fallback
      }

        // If coordinate-based fails, try district or city-based lookup
        const locationName = userDistrict !== 'Unknown' ? userDistrict : 'Mumbai';
      try {
        const cityResponse = await weatherService.getWeatherByCity(locationName);
        if (cityResponse.success && cityResponse.data?.data) {
          setWeatherData(cityResponse.data.data);
          return;
        }
      } catch (cityError) {
        // Silently continue to final fallback
      }

      // Final fallback to Mumbai
      try {
        const mumbaiResponse = await weatherService.getWeatherByCity('Mumbai');
        if (mumbaiResponse.success && mumbaiResponse.data?.data) {
          setWeatherData(mumbaiResponse.data.data);
        } else {
          setError('Unable to fetch weather data. Please try again later.');
        }
      } catch (mumbaiError) {
        setError('Unable to fetch weather data. Please check your connection and try again.');
      }
    } catch (err: any) {
      // Final fallback to Mumbai on any unexpected error
      try {
        const response = await weatherService.getWeatherByCity('Mumbai');
        if (response.success && response.data?.data) {
          setWeatherData(response.data.data);
        } else {
          setError(err?.message || 'Failed to fetch weather data');
        }
      } catch (fallbackError: any) {
        setError(err?.message || 'Failed to fetch weather data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View className="px-4 pt-10 pb-1.5">
        <View
          className="rounded-3xl overflow-hidden"
          style={{
            backgroundColor: isDark ? '#0F0F0F' : '#FAFAFA',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.5 : 0.12,
            shadowRadius: 24,
            elevation: 12,
            minHeight: responsiveValues.cardMinHeight,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          }}
        >
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="px-4 pt-10 pb-1.5">
        <View
          className="rounded-3xl overflow-hidden"
          style={{
            backgroundColor: isDark ? '#0F0F0F' : '#FAFAFA',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.5 : 0.12,
            shadowRadius: 24,
            elevation: 12,
            minHeight: responsiveValues.cardMinHeight,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          }}
        >
          <View className="items-center justify-center flex-1" style={{ minHeight: responsiveValues.cardMinHeight, paddingHorizontal: responsiveValues.cardPadding, paddingVertical: Math.round(responsiveValues.currentModerateScale(18, 0.7)) }}>
            <View className="items-center">
              <ActivityIndicator 
                size="small" 
                color="#3B82F6" 
                style={{ marginBottom: 12 }}
              />
              <Text
                style={{ 
                  fontFamily: 'Chirp-Medium', 
                  fontSize: Math.round(responsiveValues.currentScaleFont(12)), 
                  letterSpacing: 0.15,
                  color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                }}
              >
                Loading...
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (error || !weatherData) {
    return (
      <View className="px-4 pt-10 pb-1.5">
        <View
          className="rounded-3xl overflow-hidden"
          style={{
            backgroundColor: isDark ? '#0F0F0F' : '#FAFAFA',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.5 : 0.12,
            shadowRadius: 24,
            elevation: 12,
            minHeight: responsiveValues.cardMinHeight,
            paddingHorizontal: responsiveValues.cardPadding,
            paddingTop: Math.round(responsiveValues.currentModerateScale(18, 0.7)),
            paddingBottom: Math.round(responsiveValues.currentModerateScale(18, 0.7)),
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          }}
        >
          <Text
            style={{ 
              fontFamily: 'Chirp-Medium', 
              fontSize: Math.round(responsiveValues.currentScaleFont(12)), 
              letterSpacing: 0.15, 
              lineHeight: Math.round(responsiveValues.currentScaleFont(12)) * 1.5,
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              textAlign: 'center',
            }}
          >
            {error || 'Weather data unavailable'}
          </Text>
        </View>
      </View>
    );
  }

  // Humidity level helper (defined early for use in calculations)
  const getHumidityLevel = (humidityValue: number): string => {
    if (humidityValue < 30) return 'Low';
    if (humidityValue < 50) return 'Moderate';
    if (humidityValue < 70) return 'Comfortable';
    if (humidityValue < 85) return 'High';
    return 'Very High';
  };

  // Humidity color helper (defined early for use in calculations)
  const getHumidityColor = (humidityValue: number): string => {
    if (humidityValue < 30) return '#60A5FA'; // Light blue - Low
    if (humidityValue < 50) return '#3B82F6'; // Blue - Moderate
    if (humidityValue < 70) return '#10B981'; // Green - Comfortable
    if (humidityValue < 85) return '#F59E0B'; // Orange - High
    return '#EF4444'; // Red - Very High
  };

  const temp = Math.round(weatherData.temperature.current);
  const feelsLike = Math.round(weatherData.temperature.feelsLike);
  const humidity = weatherData.humidity?.value || weatherData.current.humidity || 0;
  const humidityLevel = weatherData.humidity?.level || getHumidityLevel(humidity);
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
      default: return isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.55)';
    }
  };

  const getAQIBadgeColor = (aqi: number): { bg: string; text: string; border: string } => {
    switch (aqi) {
      case 1: return { bg: '#10B981', text: '#FFFFFF', border: '#059669' }; // Green - Good
      case 2: return { bg: '#84CC16', text: '#FFFFFF', border: '#65A30D' }; // Yellow-Green - Fair
      case 3: return { bg: '#F59E0B', text: '#FFFFFF', border: '#D97706' }; // Orange - Moderate
      case 4: return { bg: '#EF4444', text: '#FFFFFF', border: '#DC2626' }; // Red - Poor
      case 5: return { bg: '#991B1B', text: '#FFFFFF', border: '#7F1D1D' }; // Dark Red - Very Poor
      default: return { bg: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.55)', text: '#FFFFFF', border: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.55)' };
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

  // Dynamic color helpers
  const getRainColor = () => {
    if (rainChance >= 50) return '#3B82F6';
    if (rainChance >= 30) return '#60A5FA';
    return '#93C5FD';
  };

  const getUVColor = () => {
    if (uvIndex >= 10) return '#DC2626';
    if (uvIndex >= 7) return '#F59E0B';
    if (uvIndex >= 5) return '#FBBF24';
    if (uvIndex >= 3) return '#84CC16';
    return '#10B981';
  };

  // Generate weather forecast description (24-hour outlook)
  const getWeatherForecastDescription = (
    condition: string,
    temperature: number,
    humidityValue: number,
    aqiValue: number
  ): string => {
    // Check for precipitation conditions
    const hasPrecipitation = condition.includes('rain') || 
                            condition.includes('drizzle') || 
                            condition.includes('storm') || 
                            condition.includes('snow');
    
    if (hasPrecipitation) {
      if (condition.includes('heavy') || condition.includes('extreme')) {
        return 'Heavy Precipitation Expected. Stay Indoors Over The Next 24 Hours.';
      }
      if (condition.includes('light')) {
        return 'Light Rain Showers. Carry An Umbrella Over The Next Few Hours.';
      }
      return 'Precipitation Expected Over The Next 24 Hours.';
    }
    
    if (condition.includes('cloud')) {
      if (condition.includes('overcast') || condition.includes('broken')) {
        return 'Overcast. No Precipitation Expected Over The Next 24 Hours.';
      }
      return 'Cloudy. No Precipitation Expected Over The Next 24 Hours.';
    }
    
    if (condition.includes('clear') || condition.includes('sunny')) {
      return 'Clear Skies. No Precipitation Expected Over The Next 24 Hours.';
    }
    
    if (condition.includes('fog') || condition.includes('mist')) {
      return 'Misty Conditions. No Precipitation Expected Over The Next 24 Hours.';
    }
    
    if (condition.includes('haze') || condition.includes('smoke')) {
      return 'Hazy Conditions. Air Quality May Be Affected Over The Next Hours.';
    }
    
    // Default forecast
    return 'Stable Weather Conditions. No Precipitation Expected Over The Next 24 Hours.';
  };

  // Generate short weather update message based on conditions (one line)
  const getWeatherUpdateMessage = (
    condition: string,
    temperature: number,
    humidityValue: number,
    aqiValue: number
  ): string => {
    // Priority: Extreme conditions first
    if (temperature >= 40) {
      return 'Extreme heat warning - stay hydrated and avoid sun exposure';
    }
    
    if (condition.includes('storm') || condition.includes('thunder')) {
      return 'Thunderstorm alert - stay indoors and avoid open areas';
    }
    
    if (condition.includes('heavy') && (condition.includes('rain') || condition.includes('drizzle'))) {
      return 'Heavy rainfall expected - carry umbrella and avoid waterlogged areas';
    }
    
    if (aqiValue >= 4) {
      return 'Poor air quality - limit outdoor activities and use masks';
    }
    
    if (temperature >= 35) {
      return 'High temperatures - keep cool and stay indoors during peak hours';
    }
    
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return 'Rain expected - keep an umbrella handy';
    }
    
    if (condition.includes('fog') || condition.includes('mist') || condition.includes('haze')) {
      return 'Reduced visibility due to fog - drive carefully';
    }
    
    if (humidityValue >= 85) {
      return 'Very high humidity - stay hydrated and avoid strenuous activities';
    }
    
    if (aqiValue >= 3) {
      return 'Moderate air quality - sensitive individuals take precautions';
    }
    
    if (temperature <= 15) {
      return 'Cool weather - dress warmly and stay comfortable';
    }
    
    if (humidityValue < 30) {
      return 'Low humidity - keep yourself hydrated throughout the day';
    }
    
    if (condition.includes('clear') || condition.includes('sunny')) {
      return 'Clear skies and pleasant weather - perfect for outdoor activities';
    }

    // Default message
    return 'Weather conditions are normal - stay updated for any changes';
  };

  // Responsive values based on both screen width and height (using current dimensions) - Reduced to match BreakingNews
  const currentWidth = dimensions.width;
  const descriptionWidth = responsiveValues.currentIsSmallDevice ? currentWidth * 0.36 : responsiveValues.currentIsMediumDevice ? currentWidth * 0.40 : currentWidth * 0.42;
  
  // Font sizes with proper scaling - Reduced to match BreakingNews proportions
  const tempFontSize = Math.round(responsiveValues.currentScaleFont(responsiveValues.currentIsSmallDevice ? 36 : responsiveValues.currentIsMediumDevice ? 42 : 48));
  const locationFontSize = Math.round(responsiveValues.currentScaleFont(responsiveValues.currentIsSmallDevice ? 12 : responsiveValues.currentIsMediumDevice ? 13 : 14));
  const descFontSize = Math.round(responsiveValues.currentScaleFont(responsiveValues.currentIsSmallDevice ? 10 : responsiveValues.currentIsMediumDevice ? 11 : 12));
  const conditionFontSize = Math.round(responsiveValues.currentScaleFont(responsiveValues.currentIsSmallDevice ? 9 : responsiveValues.currentIsMediumDevice ? 10 : 11));
  
  // Metric card dimensions with scaling - Reduced to match BreakingNews compact size
  const metricCardWidth = Math.round(responsiveValues.currentModerateScale(responsiveValues.currentIsSmallDevice ? 42 : responsiveValues.currentIsMediumDevice ? 48 : 54));
  const metricIconSize = Math.round(responsiveValues.currentScaleFont(responsiveValues.currentIsSmallDevice ? 9 : responsiveValues.currentIsMediumDevice ? 10 : 12));
  const metricContainerSize = Math.round(responsiveValues.currentModerateScale(responsiveValues.currentIsSmallDevice ? 18 : responsiveValues.currentIsMediumDevice ? 20 : 22));
  const metricLabelSize = Math.round(responsiveValues.currentScaleFont(responsiveValues.currentIsSmallDevice ? 6 : responsiveValues.currentIsMediumDevice ? 7 : 8));
  const metricValueSize = Math.round(responsiveValues.currentScaleFont(responsiveValues.currentIsSmallDevice ? 8 : responsiveValues.currentIsMediumDevice ? 9 : 10));
  
  // Additional responsive spacing - Minimal for modern compact design
  const topSpacing = Math.round(responsiveValues.currentModerateScale(responsiveValues.currentIsSmallDevice ? 0 : 1));
  const bottomSpacing = Math.round(responsiveValues.currentModerateScale(responsiveValues.currentIsSmallDevice ? 2 : 3));
  const iconContainerSize = Math.round(responsiveValues.currentModerateScale(responsiveValues.currentIsSmallDevice ? 16 : 18));
  const weatherIconSize = Math.round(responsiveValues.currentModerateScale(responsiveValues.currentIsSmallDevice ? 20 : responsiveValues.currentIsMediumDevice ? 22 : 24));

  return (
    <View className="px-4 pt-10 pb-1.5">
      <Pressable
        onPress={onPress}
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
          }}
      >
          {/* Premium Gradient Overlay */}
          <View 
            className="absolute inset-0"
            style={{ 
              backgroundColor: isDark 
                ? 'rgba(59, 130, 246, 0.03)' 
                : 'rgba(59, 130, 246, 0.02)',
            }}
          />
          
          <View 
            className="relative"
            style={{ 
              paddingHorizontal: responsiveValues.cardPadding,
              paddingTop: responsiveValues.currentIsSmallDevice ? 16 : 18,
              paddingBottom: responsiveValues.currentIsSmallDevice ? 10 : 12,
              minHeight: responsiveValues.cardMinHeight, 
              justifyContent: 'space-between' 
            }}
          >
          {/* Content Container */}
          <View>
            {/* TOP ROW - District on Left, Description on Right */}
            <View className="flex-row items-center justify-between" style={{ marginBottom: Math.round(responsiveValues.currentModerateScale(1, 0.3)) }}>
              {/* Left: District */}
              <View className="flex-row items-center" style={{ gap: Math.round(responsiveValues.currentModerateScale(4, 0.6)) }}>
                <Text
                  className={isDark ? 'text-white' : 'text-[#0A0A0A]'}
                  style={{
                    fontFamily: 'Chirp-Bold',
                    fontSize: locationFontSize,
                    letterSpacing: -0.2,
                  }}
                  numberOfLines={1}
                >
                  {district !== 'Unknown' ? district : (weatherData.location.district !== 'Unknown' ? weatherData.location.district : weatherData.location.city)}
                </Text>
                <View
                  className="rounded-full items-center justify-center"
                  style={{
                    width: iconContainerSize,
                    height: iconContainerSize,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <Svg
                    width={Math.round(iconContainerSize * 0.5)}
                    height={Math.round(iconContainerSize * 0.5)}
                  viewBox="0 0 24 24"
                >
                  <Path
                    d="M12 19V5M12 5L5 12M12 5L19 12"
                      stroke={isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)'}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
                </View>
              </View>

              {/* Right: Weather Forecast Description */}
              <View style={{ 
                flex: 1, 
                maxWidth: responsiveValues.currentIsSmallDevice ? '55%' : '58%',
                marginLeft: Math.round(responsiveValues.currentModerateScale(6, 0.7)),
              }}>
                <Text
                  className={isDark ? 'text-white/60' : 'text-black/55'}
                  style={{
                    fontFamily: 'Chirp-Regular',
                    fontSize: descFontSize,
                    lineHeight: descFontSize * 1.3,
                    letterSpacing: 0.15,
                    textAlign: 'left',
                  }}
                  numberOfLines={responsiveValues.currentIsSmallDevice ? 3 : 4}
                >
                  {getWeatherForecastDescription(condition, temp, humidity, aqi.value)}
                </Text>
              </View>
            </View>

            {/* Temperature - Directly Below District with Minimal Spacing */}
            <View className="flex-row items-baseline" style={{ marginBottom: bottomSpacing }}>
            <Text
                className={isDark ? 'text-white' : 'text-[#0A0A0A]'}
              style={{
                fontFamily: 'Chirp-Bold',
                fontSize: tempFontSize,
                  letterSpacing: responsiveValues.currentIsSmallDevice ? -2 : -3,
                lineHeight: tempFontSize * 1.05,
                }}
              >
                {temp}
              </Text>
              <Text
                className={isDark ? 'text-white/70' : 'text-black/60'}
                style={{
                  fontFamily: 'Chirp-Bold',
                  fontSize: Math.round(tempFontSize * 0.4),
                  letterSpacing: -1,
                  marginLeft: 2,
                }}
              >
                °
            </Text>
            </View>
          </View>

          {/* BOTTOM ROW - Weather Info on Left, Metric Cards on Right */}
          <View className="flex-row items-end justify-between">
            {/* Left: Weather Condition + High/Low */}
            <View style={{ flex: 1, maxWidth: responsiveValues.currentIsSmallDevice ? '38%' : '42%' }}>
              {/* Weather Condition with Icon */}
              <View className="flex-row items-center" style={{ gap: Math.round(responsiveValues.currentModerateScale(3, 0.5)), marginBottom: Math.round(responsiveValues.currentModerateScale(2, 0.4)) }}>
                <View
                  className="rounded-lg items-center justify-center"
                  style={{
                    width: weatherIconSize,
                    height: weatherIconSize,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <Text style={{ fontSize: Math.round(weatherIconSize * 0.65) }}>
                  {getWeatherIcon()}
                </Text>
                </View>
                <Text
                  className={isDark ? 'text-white/95' : 'text-black/90'}
                  style={{
                    fontFamily: 'Chirp-Medium',
                    fontSize: conditionFontSize,
                    letterSpacing: 0.15,
                    textTransform: 'capitalize',
                  }}
                  numberOfLines={1}
                >
                  {weatherData.condition.description}
                </Text>
              </View>

              {/* High/Low Temperatures */}
              <View className="flex-row items-center" style={{ gap: Math.round(responsiveValues.currentModerateScale(6, 0.5)) }}>
                <View className="flex-row items-center" style={{ gap: Math.round(responsiveValues.currentModerateScale(3)) }}>
                  <Text
                    className={isDark ? 'text-white/70' : 'text-black/65'}
                    style={{ fontFamily: 'Chirp-Medium', fontSize: Math.round(responsiveValues.currentScaleFont(11)) }}
                  >
                    ↑
                  </Text>
                  <Text
                    className={isDark ? 'text-white/80' : 'text-black/75'}
                    style={{ fontFamily: 'Chirp-Bold', fontSize: Math.round(responsiveValues.currentScaleFont(11)) }}
                  >
                    {Math.round(weatherData.temperature.max)}°
                  </Text>
                </View>
                <View className="flex-row items-center" style={{ gap: Math.round(responsiveValues.currentModerateScale(3)) }}>
                  <Text
                    className={isDark ? 'text-white/70' : 'text-black/65'}
                    style={{ fontFamily: 'Chirp-Medium', fontSize: Math.round(responsiveValues.currentScaleFont(11)) }}
                  >
                    ↓
                  </Text>
                  <Text
                    className={isDark ? 'text-white/80' : 'text-black/75'}
                    style={{ fontFamily: 'Chirp-Bold', fontSize: Math.round(responsiveValues.currentScaleFont(11)) }}
                  >
                    {Math.round(weatherData.temperature.min)}°
                  </Text>
                </View>
              </View>
            </View>

            {/* Right: Metric Cards - Humidity, AQI, UV - Responsive */}
            <View className="flex-row" style={{ gap: Math.round(responsiveValues.currentModerateScale(3, 0.5)) }}>
              {/* Humidity Card */}
              <View
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: isDark ? '#1A1A1A' : '#2D3748',
                  minWidth: metricCardWidth,
                  paddingVertical: Math.round(responsiveValues.currentModerateScale(8, 0.6)),
                  paddingHorizontal: Math.round(responsiveValues.currentModerateScale(6, 0.6)),
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.2 : 0.15,
                  shadowRadius: 8,
                  elevation: 4,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(96, 165, 250, 0.15)',
                }}
              >
                <View className="items-center" style={{ marginBottom: Math.round(responsiveValues.currentModerateScale(2, 0.4)) }}>
                  <View
                    className="rounded-full items-center justify-center"
                    style={{
                      width: metricContainerSize,
                      height: metricContainerSize,
                      backgroundColor: 'rgba(96, 165, 250, 0.2)',
                    }}
                  >
                    <Svg width={metricIconSize} height={metricIconSize} viewBox="0 0 24 24">
                      <Path
                        d="M12 2C12 2 5 8.5 5 14C5 17.87 8.13 21 12 21C15.87 21 19 17.87 19 14C19 8.5 12 2 12 2Z"
                        stroke="#60A5FA"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </Svg>
                  </View>
                </View>
                <Text
                  className="text-white/75 text-center"
                  style={{ fontFamily: 'Chirp-Medium', fontSize: metricLabelSize, letterSpacing: 0.15 }}
                >
                  Humidity
                </Text>
                <Text
                  className="text-white text-center"
                  style={{ fontFamily: 'Chirp-Bold', fontSize: metricValueSize, letterSpacing: 0.15, marginTop: 1 }}
                >
                  {humidity}%
                </Text>
              </View>

              {/* AQI Card */}
              <View
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: isDark 
                    ? `rgba(${aqi.value <= 2 ? '34, 197, 94' : aqi.value <= 3 ? '245, 158, 11' : '239, 68, 68'}, 0.15)` 
                    : aqi.value <= 2 ? '#D1FAE5' : aqi.value <= 3 ? '#FEF3C7' : '#FEE2E2',
                  minWidth: metricCardWidth,
                  paddingVertical: Math.round(responsiveValues.currentModerateScale(8, 0.6)),
                  paddingHorizontal: Math.round(responsiveValues.currentModerateScale(6, 0.6)),
                  shadowColor: aqi.value <= 2 ? '#22C55E' : aqi.value <= 3 ? '#F59E0B' : '#EF4444',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.25 : 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                  borderWidth: 1,
                  borderColor: isDark 
                    ? `rgba(${aqi.value <= 2 ? '34, 197, 94' : aqi.value <= 3 ? '245, 158, 11' : '239, 68, 68'}, 0.3)` 
                    : `rgba(${aqi.value <= 2 ? '34, 197, 94' : aqi.value <= 3 ? '245, 158, 11' : '239, 68, 68'}, 0.25)`,
                }}
              >
                <View className="items-center" style={{ marginBottom: Math.round(responsiveValues.currentModerateScale(2, 0.4)) }}>
                  <View
                    className="rounded-full items-center justify-center"
                    style={{
                      width: metricContainerSize,
                      height: metricContainerSize,
                      backgroundColor: `rgba(${aqi.value <= 2 ? '34, 197, 94' : aqi.value <= 3 ? '245, 158, 11' : '239, 68, 68'}, 0.25)`,
                    }}
                  >
                    <Svg width={metricIconSize} height={metricIconSize} viewBox="0 0 24 24">
                      <Path
                        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
                        stroke={aqi.value <= 2 ? '#22C55E' : aqi.value <= 3 ? '#F59E0B' : '#EF4444'}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                      <Path
                        d="M12 8V12L14 14"
                        stroke={aqi.value <= 2 ? '#22C55E' : aqi.value <= 3 ? '#F59E0B' : '#EF4444'}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </Svg>
                  </View>
                </View>
                <Text
                  className="text-center"
                  style={{
                    fontFamily: 'Chirp-Medium',
                    fontSize: metricLabelSize, 
                    letterSpacing: 0.15,
                    color: isDark 
                      ? (aqi.value <= 2 ? 'rgba(34, 197, 94, 0.9)' : aqi.value <= 3 ? 'rgba(245, 158, 11, 0.9)' : 'rgba(239, 68, 68, 0.9)')
                      : (aqi.value <= 2 ? '#16A34A' : aqi.value <= 3 ? '#D97706' : '#DC2626'),
                  }}
                >
                  AQI
                </Text>
                <Text
                  className="text-center"
                  style={{
                    fontFamily: 'Chirp-Bold', 
                    fontSize: metricValueSize, 
                    letterSpacing: 0.15,
                    marginTop: 1,
                    color: aqi.value <= 2 ? '#22C55E' : aqi.value <= 3 ? '#F59E0B' : '#EF4444',
                  }}
                >
                  {aqi.value}
                </Text>
              </View>

              {/* UV Card */}
              <View
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: isDark 
                    ? `rgba(${uvIndex <= 2 ? '34, 197, 94' : uvIndex <= 5 ? '245, 158, 11' : '239, 68, 68'}, 0.15)` 
                    : uvIndex <= 2 ? '#D1FAE5' : uvIndex <= 5 ? '#FEF3C7' : '#FEE2E2',
                  minWidth: metricCardWidth,
                  paddingVertical: Math.round(responsiveValues.currentModerateScale(8, 0.6)),
                  paddingHorizontal: Math.round(responsiveValues.currentModerateScale(6, 0.6)),
                  shadowColor: uvIndex <= 2 ? '#22C55E' : uvIndex <= 5 ? '#F59E0B' : '#EF4444',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.25 : 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                  borderWidth: 1,
                  borderColor: isDark 
                    ? `rgba(${uvIndex <= 2 ? '34, 197, 94' : uvIndex <= 5 ? '245, 158, 11' : '239, 68, 68'}, 0.3)` 
                    : `rgba(${uvIndex <= 2 ? '34, 197, 94' : uvIndex <= 5 ? '245, 158, 11' : '239, 68, 68'}, 0.25)`,
                }}
              >
                <View className="items-center" style={{ marginBottom: Math.round(responsiveValues.currentModerateScale(2, 0.4)) }}>
                  <View
                    className="rounded-full items-center justify-center"
                    style={{
                      width: metricContainerSize,
                      height: metricContainerSize,
                      backgroundColor: `rgba(${uvIndex <= 2 ? '34, 197, 94' : uvIndex <= 5 ? '245, 158, 11' : '239, 68, 68'}, 0.25)`,
                    }}
                  >
                    <Svg width={metricIconSize} height={metricIconSize} viewBox="0 0 24 24">
                      <Circle 
                        cx="12" 
                        cy="12" 
                        r="4" 
                        stroke={uvIndex <= 2 ? '#22C55E' : uvIndex <= 5 ? '#F59E0B' : '#EF4444'}
                        strokeWidth={2.5}
                        fill="none"
                      />
                      <Path
                        d="M12 2V4M12 20V22M4 12H2M6.31 6.31L4.9 4.9M17.69 6.31L19.1 4.9M6.31 17.69L4.9 19.1M17.69 17.69L19.1 19.1M22 12H20"
                        stroke={uvIndex <= 2 ? '#22C55E' : uvIndex <= 5 ? '#F59E0B' : '#EF4444'}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </Svg>
                  </View>
                </View>
                <Text
                  className="text-center"
                  style={{
                    fontFamily: 'Chirp-Medium', 
                    fontSize: metricLabelSize, 
                    letterSpacing: 0.15,
                    color: isDark 
                      ? (uvIndex <= 2 ? 'rgba(34, 197, 94, 0.9)' : uvIndex <= 5 ? 'rgba(245, 158, 11, 0.9)' : 'rgba(239, 68, 68, 0.9)')
                      : (uvIndex <= 2 ? '#16A34A' : uvIndex <= 5 ? '#D97706' : '#DC2626'),
                  }}
                >
                  UV
                </Text>
                <Text
                  className="text-center"
                  style={{
                    fontFamily: 'Chirp-Bold', 
                    fontSize: metricValueSize, 
                    letterSpacing: 0.15, 
                    marginTop: 1,
                    color: uvIndex <= 2 ? '#22C55E' : uvIndex <= 5 ? '#F59E0B' : '#EF4444',
                  }}
                >
                  {uvIndex}
                </Text>
              </View>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
