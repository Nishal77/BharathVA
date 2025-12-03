// Cities Service - Fetches Indian cities from backend

import { getLocalPulseServiceURL } from './environment';

const getAPIBaseURL = (): string => {
  return getLocalPulseServiceURL();
};

export interface IndianCity {
  id: number;
  city: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  population?: number;
  rank?: number;
}

export interface CitiesResponse {
  success: boolean;
  cities: IndianCity[];
  totalCount: number;
  message?: string;
}

/**
 * Fetch all Indian cities from backend
 */
export const getAllCities = async (): Promise<CitiesResponse> => {
  try {
    const baseUrl = getAPIBaseURL();
    const url = `${baseUrl}/api/localpulse/cities`;
    console.log('[CitiesService] Fetching cities from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[CitiesService] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CitiesService] API error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const cities = await response.json();
    console.log('[CitiesService] Received cities:', cities?.length || 0);
    
    if (!Array.isArray(cities)) {
      console.error('[CitiesService] Invalid response format, expected array:', cities);
      throw new Error('Invalid response format from API');
    }
    
    const mappedCities = cities.map((city: any) => ({
      id: city.id,
      city: city.city,
      district: city.district,
      state: city.state,
      latitude: city.latitude,
      longitude: city.longitude,
      population: city.population,
      rank: city.rank,
    }));
    
    console.log('[CitiesService] Mapped cities:', mappedCities.length);
    
    return {
      success: true,
      cities: mappedCities,
      totalCount: mappedCities.length,
    };
  } catch (error) {
    console.error('[CitiesService] Error fetching cities:', error);
    console.error('[CitiesService] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      cities: [],
      totalCount: 0,
      message: error instanceof Error ? error.message : 'Failed to fetch cities',
    };
  }
};

/**
 * Search cities by query
 */
export const searchCities = async (query: string): Promise<CitiesResponse> => {
  try {
    const baseUrl = getAPIBaseURL();
    const url = `${baseUrl}/api/localpulse/cities?search=${encodeURIComponent(query)}`;
    console.log('[CitiesService] Searching cities:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[CitiesService] Search response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CitiesService] Search API error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const cities = await response.json();
    console.log('[CitiesService] Search results:', cities?.length || 0);
    
    if (!Array.isArray(cities)) {
      console.error('[CitiesService] Invalid search response format:', cities);
      throw new Error('Invalid response format from API');
    }
    
    const mappedCities = cities.map((city: any) => ({
      id: city.id,
      city: city.city,
      district: city.district,
      state: city.state,
      latitude: city.latitude,
      longitude: city.longitude,
      population: city.population,
      rank: city.rank,
    }));
    
    return {
      success: true,
      cities: mappedCities,
      totalCount: mappedCities.length,
    };
  } catch (error) {
    console.error('[CitiesService] Error searching cities:', error);
    console.error('[CitiesService] Search error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      cities: [],
      totalCount: 0,
      message: error instanceof Error ? error.message : 'Failed to search cities',
    };
  }
};

