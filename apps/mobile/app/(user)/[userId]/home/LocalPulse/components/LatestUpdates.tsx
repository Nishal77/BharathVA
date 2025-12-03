import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Pressable, Text, View, useColorScheme, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { fetchTrafficAlerts, TrafficAlert } from '../../../../../../services/api/trafficService';
import { fetchWeatherAlerts, WeatherAlert } from '../../../../../../services/api/weatherAlertService';
import { IndianCity, getAllCities } from '../../../../../../services/api/citiesService';

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
  items?: LatestUpdateItem[];
  onItemPress?: (item: LatestUpdateItem) => void;
  onBookmarkPress?: (item: LatestUpdateItem) => void;
  onSeeMorePress?: () => void;
  selectedCityParam?: string;
}

interface CachedData<T> {
  data: T[];
  timestamp: number;
  location: { latitude: number; longitude: number };
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache
const MIN_REQUEST_INTERVAL = 30 * 1000; // 30 seconds min interval
const MAX_TRAFFIC_ALERTS = 50; // Show all traffic alerts found (increased from 5 to show all)
const MAX_WEATHER_ALERTS = 50; // Show all weather alerts found (increased from 5 to show all)
const WEATHER_RADIUS_KM = 100.0; // 100km radius for weather alerts (increased for better coverage)
const TRAFFIC_RADIUS_KM = 100.0; // 100km radius for traffic alerts (increased for better coverage)
const RECENT_ALERTS_HOURS = 24; // Show only alerts from the last 24 hours

// Module-level cache for random district to prevent repeated API calls
let randomDistrictCache: string | null = null;


const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
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

const findNearestDistrict = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await getAllCities();
    if (!response.success || !response.cities || response.cities.length === 0) {
      return 'Mumbai';
    }

    let nearestCity: IndianCity | null = null;
    let minDistance = Infinity;

    for (const city of response.cities) {
      if (city.latitude && city.longitude) {
        const distance = calculateDistance(latitude, longitude, city.latitude, city.longitude);
        if (distance < minDistance) {
          minDistance = distance;
          nearestCity = city;
        }
      }
    }

    if (nearestCity) {
      return nearestCity.district || nearestCity.city;
    }

    return 'Mumbai';
  } catch (error) {
    console.warn('[LatestUpdates] Error finding nearest district:', error);
    return 'Mumbai';
  }
};


const getRandomDistrict = async (): Promise<string> => {
  // Return cached random district if available
  if (randomDistrictCache) {
    return randomDistrictCache;
  }
  
  try {
    const response = await getAllCities();
    if (response.success && response.cities && response.cities.length > 0) {
      const randomIndex = Math.floor(Math.random() * response.cities.length);
      const randomCity = response.cities[randomIndex];
      const district = randomCity.district || randomCity.city;
      randomDistrictCache = district;
      return district;
    }
    const defaultDistrict = 'Mumbai';
    randomDistrictCache = defaultDistrict;
    return defaultDistrict;
  } catch (error) {
    console.warn('[LatestUpdates] Error fetching random district:', error);
    const defaultDistrict = 'Mumbai';
    randomDistrictCache = defaultDistrict;
    return defaultDistrict;
  }
};

export default function LatestUpdates({
  items = [],
  onItemPress,
  onBookmarkPress,
  onSeeMorePress,
  selectedCityParam,
}: LatestUpdatesProps) {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const params = useLocalSearchParams();
  const [district, setDistrict] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<IndianCity | null>(null);
  const [isLoadingDistrict, setIsLoadingDistrict] = useState(true);
  const [trafficAlerts, setTrafficAlerts] = useState<TrafficAlert[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [weatherLocationName, setWeatherLocationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const lastRequestTime = useRef<number>(0);
  const trafficCacheRef = useRef<CachedData<TrafficAlert> | null>(null);
  const weatherCacheRef = useRef<CachedData<WeatherAlert> | null>(null);
  const navigationTriggeredRef = useRef<boolean>(false);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingDistrictRef = useRef<boolean>(false);
  const hasInitializedRef = useRef<boolean>(false);
  const hasAttemptedInitialLoadRef = useRef<boolean>(false);

  /**
   * Load traffic and weather alerts for a specific location
   * @param latitude - Location latitude
   * @param longitude - Location longitude
   * @param cityName - Optional city name for logging
   * @param forceRefresh - Force refresh even if cache is valid
   */
  const loadAlerts = useCallback(async (
    latitude: number, 
    longitude: number, 
    cityName?: string,
    forceRefresh: boolean = false
  ) => {
    const now = Date.now();
    const lat = Number(latitude);
    const lon = Number(longitude);
    
    // Validate coordinates
    if (isNaN(lat) || isNaN(lon)) {
      console.error('[LatestUpdates] ❌ Invalid coordinates:', { latitude, longitude, lat, lon });
      setTrafficAlerts([]);
      setWeatherAlerts([]);
      setLoading(false);
      return;
    }
    
    // Check cache validity (only if not forcing refresh)
    if (!forceRefresh) {
      const isTrafficCacheValid = trafficCacheRef.current && 
        (now - trafficCacheRef.current.timestamp < CACHE_DURATION) &&
        Math.abs(trafficCacheRef.current.location.latitude - lat) < 0.001 &&
        Math.abs(trafficCacheRef.current.location.longitude - lon) < 0.001;
      
      const isWeatherCacheValid = weatherCacheRef.current && 
        (now - weatherCacheRef.current.timestamp < CACHE_DURATION) &&
        Math.abs(weatherCacheRef.current.location.latitude - lat) < 0.001 &&
        Math.abs(weatherCacheRef.current.location.longitude - lon) < 0.001;
      
      if (isTrafficCacheValid && isWeatherCacheValid) {
        console.log('[LatestUpdates] ✅ Using cached alerts for:', cityName || `${lat}, ${lon}`);
        setTrafficAlerts(trafficCacheRef.current!.data.slice(0, MAX_TRAFFIC_ALERTS));
        setWeatherAlerts(weatherCacheRef.current!.data.slice(0, MAX_WEATHER_ALERTS));
        return;
      }

      // Rate limiting check
      if (now - lastRequestTime.current < MIN_REQUEST_INTERVAL) {
        console.log('[LatestUpdates] ⏳ Rate limiting: Using cached data');
        if (trafficCacheRef.current) {
          setTrafficAlerts(trafficCacheRef.current.data.slice(0, MAX_TRAFFIC_ALERTS));
        }
        if (weatherCacheRef.current) {
          setWeatherAlerts(weatherCacheRef.current.data.slice(0, MAX_WEATHER_ALERTS));
        }
        return;
      }
    }

    try {
      setLoading(true);
      lastRequestTime.current = now;
      
      const locationLabel = cityName || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      console.log('[LatestUpdates] 🌐 Fetching alerts for:', locationLabel, {
        latitude: lat,
        longitude: lon,
        latitudeFormatted: lat.toFixed(6),
        longitudeFormatted: lon.toFixed(6),
        radius: `${TRAFFIC_RADIUS_KM}km (traffic), ${WEATHER_RADIUS_KM}km (weather)`,
        forceRefresh,
        timestamp: new Date().toISOString(),
      });
      
      // Fetch both traffic and weather alerts in parallel
      // Use exact coordinates as they are from cities.json
      console.log('[LatestUpdates] 📡 Making API calls with coordinates:', {
        traffic: `lat=${lat.toFixed(6)}, lon=${lon.toFixed(6)}, radius=${TRAFFIC_RADIUS_KM}`,
        weather: `lat=${lat.toFixed(6)}, lon=${lon.toFixed(6)}, radius=${WEATHER_RADIUS_KM}`,
      });
      
      const [trafficResponse, weatherResponse] = await Promise.all([
        fetchTrafficAlerts(lat, lon, TRAFFIC_RADIUS_KM),
        fetchWeatherAlerts(lat, lon, WEATHER_RADIUS_KM),
      ]);
      
      console.log('[LatestUpdates] 📥 API responses received:', {
        traffic: {
          success: trafficResponse.success,
          alertsCount: trafficResponse.alerts?.length || 0,
          message: trafficResponse.message,
        },
        weather: {
          success: weatherResponse.success,
          alertsCount: weatherResponse.alerts?.length || 0,
          message: weatherResponse.message,
        },
      });
      
      // Process traffic alerts
      if (!trafficResponse.success) {
        console.error('[LatestUpdates] ❌ Traffic API error:', trafficResponse.message);
        setTrafficAlerts([]);
      } else if (trafficResponse.alerts && trafficResponse.alerts.length > 0) {
        console.log('[LatestUpdates] 📊 Processing', trafficResponse.alerts.length, 'traffic alerts');
        
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        const recentThreshold = currentTime - (RECENT_ALERTS_HOURS * 60 * 60); // 24 hours ago in seconds
        
        // Remove duplicates by ID and filter recent alerts (within 24 hours)
        // Also include high-severity alerts regardless of age (they might be important)
        const uniqueAlertsMap = new Map<string, TrafficAlert>();
        const recentAlerts: TrafficAlert[] = [];
        
        for (const alert of trafficResponse.alerts) {
          // Remove duplicates - keep the first occurrence
          if (!uniqueAlertsMap.has(alert.id)) {
            uniqueAlertsMap.set(alert.id, alert);
            
            const alertTime = alert.timestamp || 0;
            const isRecent = alertTime >= recentThreshold;
            const isHighSeverity = alert.severity?.toLowerCase() === 'high';
            
            // Include if: recent (within 24h) OR high severity (important alerts)
            // Also handle edge cases where timestamp might be in future or invalid
            const isValidTimestamp = alertTime > 0 && alertTime < (currentTime + 86400); // Allow up to 24h in future
            
            if ((isRecent || isHighSeverity) && isValidTimestamp) {
              recentAlerts.push(alert);
            } else if (!isValidTimestamp && isHighSeverity) {
              // Include high severity alerts even if timestamp is invalid
              recentAlerts.push(alert);
            }
          }
        }
        
        console.log('[LatestUpdates] 📊 Filtered alerts:', {
          total: trafficResponse.alerts.length,
          unique: uniqueAlertsMap.size,
          recent: recentAlerts.length,
          threshold: new Date(recentThreshold * 1000).toISOString(),
        });
        
        // Sort by severity (high to low) and then by timestamp (newest first)
        const sortedAlerts = recentAlerts.sort((a, b) => {
          const severityOrder: { [key: string]: number } = { 'high': 0, 'medium': 1, 'low': 2 };
          const aSeverity = severityOrder[a.severity?.toLowerCase() || 'medium'] ?? 1;
          const bSeverity = severityOrder[b.severity?.toLowerCase() || 'medium'] ?? 1;
          if (aSeverity !== bSeverity) {
            return aSeverity - bSeverity;
          }
          return (b.timestamp || 0) - (a.timestamp || 0);
        });
        
        trafficCacheRef.current = {
          data: sortedAlerts,
          timestamp: now,
          location: { latitude: lat, longitude: lon },
        };
        
        // Show all recent alerts found
        setTrafficAlerts(sortedAlerts);
        console.log('[LatestUpdates] ✅ Loaded and displaying', sortedAlerts.length, 'recent traffic alerts for', locationLabel, {
          totalFound: trafficResponse.alerts.length,
          unique: uniqueAlertsMap.size,
          recent: sortedAlerts.length,
          showing: sortedAlerts.length,
        });
        console.log('[LatestUpdates] 📋 Traffic alerts details:', sortedAlerts.map(a => ({
          id: a.id,
          title: a.title,
          severity: a.severity,
          type: a.type,
          location: a.location,
          timestamp: a.timestamp,
          age: a.timestamp ? `${Math.floor((currentTime - a.timestamp) / 3600)}h ago` : 'unknown',
        })));
      } else {
        setTrafficAlerts([]);
        console.log('[LatestUpdates] ℹ️ No traffic alerts found for', locationLabel, {
          responseSuccess: trafficResponse.success,
          alertsArray: trafficResponse.alerts,
          message: trafficResponse.message,
        });
      }
      
      // Process weather alerts
      if (!weatherResponse.success) {
        console.error('[LatestUpdates] ❌ Weather API error:', weatherResponse.message);
        setWeatherAlerts([]);
        setWeatherLocationName(null);
      } else if (weatherResponse.alerts && weatherResponse.alerts.length > 0) {
        console.log('[LatestUpdates] 📊 Processing', weatherResponse.alerts.length, 'weather alerts');
        
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        const recentThreshold = currentTime - (RECENT_ALERTS_HOURS * 60 * 60); // 24 hours ago in seconds
        
        // Remove duplicates by ID and filter recent alerts (within 24 hours)
        // Also include high-severity alerts regardless of age (they might be important)
        const uniqueAlertsMap = new Map<string, WeatherAlert>();
        const recentAlerts: WeatherAlert[] = [];
        
        for (const alert of weatherResponse.alerts) {
          // Remove duplicates - keep the first occurrence
          if (!uniqueAlertsMap.has(alert.id)) {
            uniqueAlertsMap.set(alert.id, alert);
            
            const alertTime = alert.timestamp || 0;
            const isRecent = alertTime >= recentThreshold;
            const isHighSeverity = alert.severity?.toLowerCase() === 'high';
            
            // Include if: recent (within 24h) OR high severity (important alerts)
            // Also handle edge cases where timestamp might be in future or invalid
            const isValidTimestamp = alertTime > 0 && alertTime < (currentTime + 86400); // Allow up to 24h in future
            
            if ((isRecent || isHighSeverity) && isValidTimestamp) {
              recentAlerts.push(alert);
            } else if (!isValidTimestamp && isHighSeverity) {
              // Include high severity alerts even if timestamp is invalid
              recentAlerts.push(alert);
            }
          }
        }
        
        console.log('[LatestUpdates] 📊 Filtered weather alerts:', {
          total: weatherResponse.alerts.length,
          unique: uniqueAlertsMap.size,
          recent: recentAlerts.length,
        });
        
        // Sort by severity (high to low) and then by timestamp (newest first)
        const sortedAlerts = recentAlerts.sort((a, b) => {
          const severityOrder: { [key: string]: number } = { 'high': 0, 'medium': 1, 'low': 2 };
          const aSeverity = severityOrder[a.severity?.toLowerCase() || 'medium'] ?? 1;
          const bSeverity = severityOrder[b.severity?.toLowerCase() || 'medium'] ?? 1;
          if (aSeverity !== bSeverity) {
            return aSeverity - bSeverity;
          }
          return (b.timestamp || 0) - (a.timestamp || 0);
        });
        
        weatherCacheRef.current = {
          data: sortedAlerts,
          timestamp: now,
          location: { latitude: lat, longitude: lon },
        };
        
        // Show all recent alerts found
        setWeatherAlerts(sortedAlerts);
        setWeatherLocationName(weatherResponse.locationName);
        console.log('[LatestUpdates] ✅ Loaded and displaying', sortedAlerts.length, 'recent weather alerts for', locationLabel, {
          totalFound: weatherResponse.alerts.length,
          unique: uniqueAlertsMap.size,
          recent: sortedAlerts.length,
          showing: sortedAlerts.length,
        });
        console.log('[LatestUpdates] 📋 Weather alerts details:', sortedAlerts.map(a => ({
          id: a.id,
          title: a.title,
          severity: a.severity,
          type: a.type,
          timestamp: a.timestamp,
          age: a.timestamp ? `${Math.floor((currentTime - a.timestamp) / 3600)}h ago` : 'unknown',
        })));
      } else {
        setWeatherAlerts([]);
        setWeatherLocationName(weatherResponse.locationName);
        console.log('[LatestUpdates] ℹ️ No weather alerts found for', locationLabel, {
          responseSuccess: weatherResponse.success,
          alertsArray: weatherResponse.alerts,
          message: weatherResponse.message,
          locationName: weatherResponse.locationName,
        });
      }
      
    } catch (error) {
      console.error('[LatestUpdates] ❌ ERROR loading alerts:', error);
      setTrafficAlerts([]);
      setWeatherAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDistrictAndAlerts = useCallback(async (city?: IndianCity | null, forceLoad: boolean = false) => {
    // Only skip if already loading AND not forcing load (for explicit city selection)
    if (!forceLoad && isLoadingDistrictRef.current) {
      console.log('[LatestUpdates] Already loading district, skipping...');
      return;
    }

    try {
      isLoadingDistrictRef.current = true;
      setIsLoadingDistrict(true);
      let latitude: number;
      let longitude: number;
      let districtName: string = '';

      if (city) {
        // Use exact coordinates from cities.json without any modification
        latitude = Number(city.latitude);
        longitude = Number(city.longitude);
        districtName = city.district || city.city;
        
        // Validate coordinates are valid numbers
        if (isNaN(latitude) || isNaN(longitude)) {
          console.error('[LatestUpdates] ❌ Invalid city coordinates:', {
            city: city.city,
            latitude: city.latitude,
            longitude: city.longitude,
            parsedLat: latitude,
            parsedLon: longitude,
          });
          setIsLoadingDistrict(false);
          isLoadingDistrictRef.current = false;
          return;
        }
        
        setDistrict(districtName);
        setIsLoadingDistrict(false);
        
        console.log('[LatestUpdates] 📍 Using selected city from cities.json:', {
          city: city.city,
          district: districtName,
          state: city.state,
          latitude: latitude,
          longitude: longitude,
          coordinates: `${latitude}, ${longitude}`,
        });
        
        // Force refresh when city is explicitly selected - use exact coordinates
        await loadAlerts(latitude, longitude, `${city.city}, ${districtName}`, true);
        isLoadingDistrictRef.current = false;
        return;
      } else {
        console.log('[LatestUpdates] Requesting location permissions...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('[LatestUpdates] Location permission denied, using random district');
          const randomDistrict = await getRandomDistrict();
          setDistrict(randomDistrict);
          setIsLoadingDistrict(false);
          isLoadingDistrictRef.current = false;
          return;
        }

        console.log('[LatestUpdates] Getting current location...');
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        latitude = location.coords.latitude;
        longitude = location.coords.longitude;
        
        const isIndiaLocation = latitude >= 6.0 && latitude <= 37.0 && longitude >= 68.0 && longitude <= 97.0;
        
        console.log('[LatestUpdates] Current location fetched:', {
          latitude,
          longitude,
          accuracy: location.coords.accuracy,
          timestamp: new Date(location.timestamp).toISOString(),
          isIndiaLocation,
        });
        
        if (!isIndiaLocation) {
          console.warn('[LatestUpdates] ⚠️ Location is outside India bounds! Coordinates:', { latitude, longitude });
          const randomDistrict = await getRandomDistrict();
          setDistrict(randomDistrict);
          setIsLoadingDistrict(false);
          isLoadingDistrictRef.current = false;
          if (!navigationTriggeredRef.current) {
            navigationTriggeredRef.current = true;
            if (navigationTimeoutRef.current) {
              clearTimeout(navigationTimeoutRef.current);
            }
            navigationTimeoutRef.current = setTimeout(() => {
              try {
                const userId = params.userId as string;
                if (userId && router) {
                  router.push({
                    pathname: `/(user)/[userId]/home/LocalPulse/location-suggestion` as any,
                    params: {
                      userId,
                    },
                  });
                } else {
                  navigationTriggeredRef.current = false;
                }
              } catch (navError) {
                console.warn('[LatestUpdates] Navigation skipped or failed:', navError);
                navigationTriggeredRef.current = false;
              } finally {
                navigationTimeoutRef.current = null;
              }
            }, 2000);
          }
          return;
        }
        
        if (navigationTriggeredRef.current) {
          navigationTriggeredRef.current = false;
        }
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
          navigationTimeoutRef.current = null;
        }
        
        console.log('[LatestUpdates] Finding nearest district from cities.json using GPS coordinates:', { latitude, longitude });
        const nearestDistrict = await findNearestDistrict(latitude, longitude);
        districtName = nearestDistrict;
        setDistrict(nearestDistrict);
        console.log('[LatestUpdates] Nearest district found from cities.json:', nearestDistrict);
        
        const shouldClearCache = !trafficCacheRef.current || 
          !weatherCacheRef.current ||
          Math.abs(trafficCacheRef.current.location.latitude - latitude) >= 0.001 ||
          Math.abs(trafficCacheRef.current.location.longitude - longitude) >= 0.001;
        
        if (shouldClearCache) {
          console.log('[LatestUpdates] 🗑️ Clearing cache for new location');
          trafficCacheRef.current = null;
          weatherCacheRef.current = null;
          lastRequestTime.current = 0;
        }
        
        setIsLoadingDistrict(false);
        isLoadingDistrictRef.current = false;
      }
      
      console.log('[LatestUpdates] ✅ Valid India location confirmed. Loading alerts for:', districtName || 'current location');
      await loadAlerts(latitude, longitude, districtName || undefined, false);
    } catch (error) {
      console.error('[LatestUpdates] ❌ Error getting location:', error);
      console.error('[LatestUpdates] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : undefined,
      });
      const randomDistrict = await getRandomDistrict();
      setDistrict(randomDistrict);
      setIsLoadingDistrict(false);
      isLoadingDistrictRef.current = false;
    }
  }, [loadAlerts, params.userId, router]);

  /**
   * Handle city selection from LocationSuggestion screen
   * When a city is selected, clear cache and fetch fresh alerts for that city
   */
  useEffect(() => {
    const cityParam = selectedCityParam || params.selectedCity;
    
    if (cityParam && typeof cityParam === 'string') {
      try {
        const city = JSON.parse(cityParam) as IndianCity;
        if (city && city.latitude && city.longitude) {
          // Check if this is the same city already selected
          if (selectedCity && 
              selectedCity.latitude === city.latitude && 
              selectedCity.longitude === city.longitude) {
            console.log('[LatestUpdates] ℹ️ Same city already selected, skipping reload:', city.city);
            return;
          }
          
          // Validate coordinates are valid numbers
          const cityLat = Number(city.latitude);
          const cityLon = Number(city.longitude);
          
          if (isNaN(cityLat) || isNaN(cityLon)) {
            console.error('[LatestUpdates] ❌ Invalid city coordinates in selected city:', {
              city: city.city,
              latitude: city.latitude,
              longitude: city.longitude,
              parsedLat: cityLat,
              parsedLon: cityLon,
            });
            isLoadingDistrictRef.current = false;
            setLoading(false);
            return;
          }
          
          console.log('[LatestUpdates] 🎯 City selected from LocationSuggestion:', {
            city: city.city,
            district: city.district,
            state: city.state,
            latitude: cityLat,
            longitude: cityLon,
            coordinates: `${cityLat}, ${cityLon}`,
            id: city.id,
          });
          
          // Update selected city state with validated coordinates
          setSelectedCity({
            ...city,
            latitude: cityLat,
            longitude: cityLon,
          });
          setDistrict(city.district || city.city);
          
          // Clear all caches to force fresh data for the new city
          console.log('[LatestUpdates] 🗑️ Clearing all caches for new city selection');
          trafficCacheRef.current = null;
          weatherCacheRef.current = null;
          lastRequestTime.current = 0;
          
          // Clear existing alerts while loading
          setTrafficAlerts([]);
          setWeatherAlerts([]);
          setLoading(true);
          setIsLoadingDistrict(false);
          hasAttemptedInitialLoadRef.current = true;
          
          // Reset loading flag BEFORE calling to ensure it can proceed
          isLoadingDistrictRef.current = false;
          
          // Load alerts for the selected city using exact coordinates from cities.json
          // Force load to ensure fresh data even if already loading
          console.log('[LatestUpdates] 📍 Loading traffic and weather alerts for selected city:', {
            city: city.city,
            coordinates: `${cityLat}, ${cityLon}`,
            radius: `${TRAFFIC_RADIUS_KM}km`,
            forceLoad: true,
          });
          
          // Call loadDistrictAndAlerts with forceLoad=true to bypass loading check
          loadDistrictAndAlerts({
            ...city,
            latitude: cityLat,
            longitude: cityLon,
          }, true)
            .then(() => {
              console.log('[LatestUpdates] ✅ Successfully loaded alerts for:', city.city);
              setLoading(false);
              isLoadingDistrictRef.current = false;
            })
            .catch((error) => {
              console.error('[LatestUpdates] ❌ Error loading alerts for:', city.city, error);
              setLoading(false);
              isLoadingDistrictRef.current = false;
            });
        } else {
          console.warn('[LatestUpdates] ⚠️ Invalid city data:', city);
        }
      } catch (error) {
        console.error('[LatestUpdates] ❌ Error parsing selected city:', error);
        isLoadingDistrictRef.current = false;
        setLoading(false);
      }
    }
  }, [selectedCityParam, params.selectedCity, selectedCity, loadDistrictAndAlerts]);

  const getTimeAgo = useCallback((timestamp: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  }, []);



  // Log state changes
  useEffect(() => {
    console.log('[LatestUpdates] 🔄 State updated - Traffic alerts:', trafficAlerts.length);
    if (trafficAlerts.length > 0) {
      console.log('[LatestUpdates] Traffic alert titles:', trafficAlerts.map(a => a.title));
    }
  }, [trafficAlerts]);

  useEffect(() => {
    console.log('[LatestUpdates] 🔄 State updated - Weather alerts:', weatherAlerts.length);
    if (weatherAlerts.length > 0) {
      console.log('[LatestUpdates] Weather alert titles:', weatherAlerts.map(a => a.title));
    }
  }, [weatherAlerts]);

  useEffect(() => {
    // Force fresh fetch on mount (only once)
    if (hasInitializedRef.current) {
      return;
    }
    
    console.log('[LatestUpdates] 🚀 Component mounted, clearing cache and fetching fresh data');
    trafficCacheRef.current = null;
    weatherCacheRef.current = null;
    lastRequestTime.current = 0;
    navigationTriggeredRef.current = false;
    hasInitializedRef.current = true;
    
    // Cleanup navigation timeout on unmount
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
      hasInitializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Load with current GPS location if no city selected (only once on mount)
    // This ensures by default the user's current location is shown in the right end
    if (!hasInitializedRef.current) {
      return;
    }
    
    // Skip if we've already attempted initial load or if a city is being selected
    if (hasAttemptedInitialLoadRef.current) {
      return;
    }
    
    // Only load if no city is selected from params and we're not already loading
    // Check both selectedCity state and params.selectedCity to avoid duplicate loads
    const hasCityParam = params.selectedCity && typeof params.selectedCity === 'string';
    if (!selectedCity && !hasCityParam && !isLoadingDistrictRef.current) {
      console.log('[LatestUpdates] 🚀 Initial load: Fetching user current location');
      hasAttemptedInitialLoadRef.current = true;
      loadDistrictAndAlerts(null);
    }
  }, [selectedCity, params.selectedCity, loadDistrictAndAlerts]);

  // Determine location text to display in the right end button
  // Priority: Selected city > Current district > Fallback
  const locationText = selectedCity
    ? selectedCity.city // Show city name when user selects a city
    : district && district !== '---' && district !== '' && district !== 'Mumbai'
    ? district // Show current district from GPS or nearest match
    : isLoadingDistrict
    ? 'Loading...' // Show loading state
    : 'Select Location'; // Fallback when no location available

  const hasAlerts = weatherAlerts.length > 0 || trafficAlerts.length > 0;

  // Log render state
  console.log('[LatestUpdates] 🎨 RENDER - Weather alerts:', weatherAlerts.length, 'Traffic alerts:', trafficAlerts.length, 'Has alerts:', hasAlerts, 'Loading:', loading);
  if (weatherAlerts.length > 0) {
    console.log('[LatestUpdates] 🎨 Rendering weather alerts:', weatherAlerts.map(a => a.title));
  }
  if (trafficAlerts.length > 0) {
    console.log('[LatestUpdates] 🎨 Rendering traffic alerts:', trafficAlerts.map(a => a.title));
  }
  if (!hasAlerts && !loading) {
    console.log('[LatestUpdates] 🎨 Will show "No alerts" message');
  }

  return (
    <View style={{ padding: 20, paddingBottom: 12, paddingTop: 24 }}>
      <View className="flex-row justify-between items-center mb-8">
        <Text
          className={`font-chirp-bold text-2xl font-bold ${
            isDark ? 'text-white' : 'text-black'
          }`}
          style={{ letterSpacing: -0.5 }}
        >
          Latest Updates
        </Text>
        <Pressable
          onPress={() => {
            const userId = params.userId as string;
            router.push({
              pathname: `/(user)/[userId]/home/LocalPulse/location-suggestion` as any,
              params: {
                userId,
              },
            });
          }}
          className="flex-row items-center justify-center"
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 22,
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
          })}
        >
          {isLoadingDistrict ? (
            <View className="flex-row items-center">
              <ActivityIndicator 
                size="small" 
                color={isDark ? '#FFFFFF' : '#000000'} 
                style={{ marginRight: 8 }}
              />
              <View className="w-4 h-4 items-center justify-center">
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRightWidth: 2,
                    borderBottomWidth: 2,
                    borderColor: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                    transform: [{ rotate: '45deg' }],
                  }}
                />
              </View>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Text
                className={isDark ? 'text-white' : 'text-black'}
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  marginRight: 8,
                  maxWidth: 140,
                  letterSpacing: 0.1,
                }}
                numberOfLines={1}
              >
                {locationText}
              </Text>
              <View className="w-4 h-4 items-center justify-center">
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRightWidth: 2,
                    borderBottomWidth: 2,
                    borderColor: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                    transform: [{ rotate: '45deg' }],
                  }}
                />
              </View>
            </View>
          )}
        </Pressable>
      </View>

      {loading && !hasAlerts && (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#000000'} />
        </View>
      )}

      {/* Alert Count Summary */}
      {!loading && hasAlerts && (
        <View style={{ marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <Text
            className={`text-sm font-medium ${
              isDark ? 'text-white/70' : 'text-black/70'
            }`}
            style={{ letterSpacing: 0.2 }}
          >
            {trafficAlerts.length > 0 && weatherAlerts.length > 0
              ? `${trafficAlerts.length} recent traffic alert${trafficAlerts.length !== 1 ? 's' : ''} and ${weatherAlerts.length} recent weather alert${weatherAlerts.length !== 1 ? 's' : ''} (last ${RECENT_ALERTS_HOURS} hours)`
              : trafficAlerts.length > 0
              ? `${trafficAlerts.length} recent traffic alert${trafficAlerts.length !== 1 ? 's' : ''} (last ${RECENT_ALERTS_HOURS} hours)`
              : `${weatherAlerts.length} recent weather alert${weatherAlerts.length !== 1 ? 's' : ''} (last ${RECENT_ALERTS_HOURS} hours)`}
          </Text>
        </View>
      )}

      {/* Weather Alerts Section */}
      {weatherAlerts.length > 0 && (
        <View style={{ marginBottom: weatherAlerts.length > 0 && trafficAlerts.length > 0 ? 16 : 0 }}>
          {weatherAlerts.map((alert, index) => (
            <View key={`${alert.id}-${index}`}>
              {index > 0 && (
                <View className="h-[0.5px] bg-gray-200 dark:bg-white/10 my-5" />
              )}
              <Pressable
                onPress={() => {
                  if (onItemPress) {
                    onItemPress({
                      id: alert.id,
                      title: alert.title,
                      category: 'Weather',
                      author: alert.locationName || weatherLocationName || 'Weather',
                      readTime: '',
                      timeAgo: getTimeAgo(alert.timestamp),
                      imageUrl: undefined,
                      isBookmarked: false,
                    });
                  }
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.95 : 1,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                })}
                className="py-1"
              >
                <Text
                  className="font-chirp-bold dark:text-white text-black"
                  style={{ 
                    fontWeight: '700', 
                    fontSize: 17, 
                    lineHeight: 24, 
                    letterSpacing: -0.2,
                    marginBottom: 8
                  }}
                  numberOfLines={2}
                >
                  {alert.title}
                </Text>
                <Text
                  className="font-chirp-regular dark:text-white/70 text-gray-600"
                  style={{ 
                    fontSize: 15, 
                    lineHeight: 22, 
                    letterSpacing: 0.1,
                    marginBottom: 10
                  }}
                  numberOfLines={2}
                >
                  {alert.description}
                </Text>
                <Text
                  className="font-chirp-regular dark:text-white/50 text-gray-500"
                  style={{ fontSize: 13, letterSpacing: 0.1 }}
                >
                  {getTimeAgo(alert.timestamp).toLowerCase()} · Weather
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Divider between weather and traffic alerts */}
      {weatherAlerts.length > 0 && trafficAlerts.length > 0 && (
        <View className="h-[0.5px] bg-gray-200 dark:bg-white/10 mb-6" />
      )}

      {/* Traffic Alerts Section */}
      {trafficAlerts.length > 0 && (
        <View style={{ marginTop: weatherAlerts.length > 0 ? 0 : 0 }}>
          {trafficAlerts.map((alert, index) => (
            <View key={`${alert.id}-${index}`}>
              {index > 0 && (
                <View className="h-[0.5px] bg-gray-200 dark:bg-white/10 my-5" />
              )}
              <Pressable
                onPress={() => {
                  if (onItemPress) {
                    onItemPress({
                      id: alert.id,
                      title: alert.title,
                      category: 'Traffic',
                      author: alert.city || 'Traffic',
                      readTime: '',
                      timeAgo: getTimeAgo(alert.timestamp),
                      imageUrl: undefined,
                      isBookmarked: false,
                    });
                  }
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.95 : 1,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                })}
                className="py-1"
              >
                <Text
                  className="font-chirp-bold dark:text-white text-black"
                  style={{ 
                    fontWeight: '700', 
                    fontSize: 17, 
                    lineHeight: 24, 
                    letterSpacing: -0.2,
                    marginBottom: 8
                  }}
                  numberOfLines={2}
                >
                  {alert.title}
                </Text>
                <Text
                  className="font-chirp-regular dark:text-white/70 text-gray-600"
                  style={{ 
                    fontSize: 15, 
                    lineHeight: 22, 
                    letterSpacing: 0.1,
                    marginBottom: 10
                  }}
                  numberOfLines={2}
                >
                  {alert.description}
                </Text>
                <Text
                  className="font-chirp-regular dark:text-white/50 text-gray-500"
                  style={{ fontSize: 13, letterSpacing: 0.1 }}
                >
                  {getTimeAgo(alert.timestamp).toLowerCase()} · Traffic{alert.city ? ` · ${alert.city}` : ''}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Fallback to items if no alerts */}
      {!loading && !hasAlerts && items.length > 0 && items.map((item, index) => (
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

      {/* No alerts message */}
      {!loading && !hasAlerts && items.length === 0 && (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          {!district ? (
            <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                  }}
                />
              </View>
              <Text
                className="font-chirp-medium dark:text-white text-black"
                style={{ 
                  fontSize: 16, 
                  fontWeight: '600',
                  textAlign: 'center', 
                  marginBottom: 8,
                  letterSpacing: -0.2,
                }}
              >
                Location Not Available
              </Text>
              <Text
                className="font-chirp-regular dark:text-white/60 text-gray-500"
                style={{ 
                  fontSize: 14, 
                  textAlign: 'center', 
                  marginBottom: 20,
                  lineHeight: 20,
                }}
              >
                Select a city to view local updates, traffic alerts, and weather information
              </Text>
              <Pressable
                onPress={() => {
                  const userId = params.userId as string;
                  router.push({
                    pathname: `/(user)/[userId]/home/LocalPulse/location-suggestion` as any,
                    params: {
                      userId,
                    },
                  });
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  paddingVertical: 14,
                  paddingHorizontal: 28,
                  borderRadius: 12,
                  minWidth: 200,
                })}
              >
                <Text
                  style={{
                    color: isDark ? '#000000' : '#FFFFFF',
                    fontSize: 15,
                    fontWeight: '600',
                    textAlign: 'center',
                    letterSpacing: 0.2,
                  }}
                >
                  Select City
                </Text>
              </Pressable>
            </View>
          ) : (
            <Text
              className="font-chirp-regular dark:text-white/50 text-gray-400"
              style={{ fontSize: 14, textAlign: 'center', paddingHorizontal: 20 }}
            >
              No alerts in your area right now
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
