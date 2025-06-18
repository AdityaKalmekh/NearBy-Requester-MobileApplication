import axios, { AxiosError } from 'axios';
import Environment from '../utils/environment';

// Google Places API Configuration
const GOOGLE_PLACES_API_KEY = Environment.googleMapsApiKey;
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// Types for Google Places API responses
export interface PlaceAutocompletePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
    main_text_matched_substrings?: Array<{
      offset: number;
      length: number;
    }>;
  };
  types: string[];
  terms: Array<{
    offset: number;
    value: string;
  }>;
}

export interface PlaceAutocompleteResponse {
  predictions: PlaceAutocompletePrediction[];
  status: string;
}

export interface PlaceDetailsResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  types: string[];
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export interface PlaceDetailsResponse {
  result: PlaceDetailsResult;
  status: string;
}

export interface LocationSuggestion {
  id: string;
  title: string;
  subtitle: string;
  fullAddress: string;
  placeId: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Request cache to avoid duplicate API calls
interface CacheItem {
  data: LocationSuggestion[];
  timestamp: number;
}

class GooglePlacesService {
  private apiKey: string;
  private requestCache: Map<string, CacheItem> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly BASE_TIMEOUT = 8000; // 8 seconds base timeout

  constructor() {
    this.apiKey = GOOGLE_PLACES_API_KEY;
    
    if (!this.apiKey) {
      console.warn('⚠️ Google Places API key not configured. Please add EXPO_PUBLIC_GOOGLE_PLACES_API_KEY to your environment variables.');
    }
  }

  /**
   * Check if we have a valid cached response
   */
  private getCachedResponse(cacheKey: string): LocationSuggestion[] | null {
    const cached = this.requestCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log('📎 Using cached Google Places response');
      return cached.data;
    }
    return null;
  }

  /**
   * Cache the response
   */
  private setCachedResponse(cacheKey: string, data: LocationSuggestion[]): void {
    this.requestCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    // Clean old cache entries
    this.cleanCache();
  }

  /**
   * Clean expired cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of this.requestCache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.requestCache.delete(key);
      }
    }
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries: number = this.MAX_RETRIES
  ): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        const isLastAttempt = attempt === retries;
        const axiosError = error as AxiosError;
        
        // Don't retry for certain error types
        if (axiosError.code === 'ENOTFOUND' || 
            axiosError.response?.status === 403 || 
            axiosError.response?.status === 400) {
          console.error(`❌ Non-retryable error: ${axiosError.message}`);
          throw error;
        }
        
        if (isLastAttempt) {
          console.error(`❌ Max retries (${retries}) exceeded for Google Places API`);
          throw error;
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`⚠️ Request failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Unexpected error in retry logic');
  }

  /**
   * Check network connectivity (basic check)
   */
  private async checkConnectivity(): Promise<boolean> {
    try {
      // Simple connectivity check using Google's public DNS
      const response = await axios.get('https://dns.google/resolve?name=google.com&type=A', {
        timeout: 3000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Get autocomplete suggestions for a given input
   */
  async getAutocompleteSuggestions(
    input: string,
    location?: { latitude: number; longitude: number },
    radius?: number
  ): Promise<LocationSuggestion[]> {
    if (!this.apiKey) {
      console.warn('Google Places API key not configured, returning mock data');
      return this.getMockSuggestions(input);
    }

    if (input.length < 2) {
      return [];
    }

    // Create cache key
    const cacheKey = `autocomplete_${input}_${location?.latitude}_${location?.longitude}_${radius}`;
    
    // Check cache first
    const cachedResult = this.getCachedResponse(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      // Check network connectivity
      const isConnected = await this.checkConnectivity();
      if (!isConnected) {
        console.warn('⚠️ No network connectivity detected, using mock data');
        return this.getMockSuggestions(input);
      }

      const suggestions = await this.retryRequest(async () => {
        const params = new URLSearchParams({
          input,
          key: this.apiKey,
          types: 'establishment|geocode',
          language: 'en',
        });

        // Add location bias if provided
        if (location) {
          params.append('location', `${location.latitude},${location.longitude}`);
          params.append('radius', (radius || 5000).toString());
        }

        // Add session token for better billing
        const sessionToken = this.generateSessionToken();
        params.append('sessiontoken', sessionToken);

        // console.log('🌐 Making Google Places API request...');
        
        const response = await axios.get<PlaceAutocompleteResponse>(
          `${GOOGLE_PLACES_BASE_URL}/autocomplete/json?${params.toString()}`,
          {
            timeout: this.BASE_TIMEOUT,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'NearByRequester/1.0',
            },
          }
        );

        if (response.data.status === 'OK') {
          console.log('✅ Google Places API request successful');
          return this.transformPredictionsToSuggestions(response.data.predictions);
        } else if (response.data.status === 'ZERO_RESULTS') {
          console.log('📍 No results found for this location');
          return [];
        } else {
          console.error('Google Places API error:', response.data.status);
          throw new Error(`Google Places API returned status: ${response.data.status}`);
        }
      });

      // Cache the successful response
      this.setCachedResponse(cacheKey, suggestions);
      return suggestions;
      
    } catch (error) {
      const axiosError = error as AxiosError;
      
      // Detailed error logging
      if (axiosError.response) {
        console.error('❌ Google Places API Error:', {
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          data: axiosError.response.data,
        });
      } else if (axiosError.request) {
        console.error('❌ Network Error - No response received:', axiosError.message);
      } else {
        console.error('❌ Request Error:', axiosError.message);
      }
      
      // Fallback to mock data
      console.log('🔄 Falling back to mock suggestions');
      return this.getMockSuggestions(input);
    }
  }

  /**
   * Get detailed information about a place using place_id
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetailsResult | null> {
    if (!this.apiKey) {
      console.warn('Google Places API key not configured');
      return null;
    }

    try {
      const placeDetails = await this.retryRequest(async () => {
        const params = new URLSearchParams({
          place_id: placeId,
          key: this.apiKey,
          fields: 'place_id,formatted_address,geometry,name,types,address_components',
        });

        console.log('🌐 Getting place details...');
        
        const response = await axios.get<PlaceDetailsResponse>(
          `${GOOGLE_PLACES_BASE_URL}/details/json?${params.toString()}`,
          {
            timeout: this.BASE_TIMEOUT,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'NearByRequester/1.0',
            },
          }
        );

        if (response.data.status === 'OK') {
          // console.log('✅ Place details retrieved successfully');
          return response.data.result;
        } else {
          console.error('Google Places Details API error:', response.data.status);
          throw new Error(`Place details API returned status: ${response.data.status}`);
        }
      });

      return placeDetails;
      
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('❌ Failed to fetch place details:', axiosError.message);
      return null;
    }
  }

  /**
   * Transform Google Places predictions to our LocationSuggestion format
   */
  private transformPredictionsToSuggestions(
    predictions: PlaceAutocompletePrediction[]
  ): LocationSuggestion[] {
    return predictions.map((prediction) => ({
      id: prediction.place_id,
      title: prediction.structured_formatting.main_text,
      subtitle: prediction.structured_formatting.secondary_text || '',
      fullAddress: prediction.description,
      placeId: prediction.place_id,
    }));
  }

  /**
   * Generate a session token for Google Places API
   */
  private generateSessionToken(): string {
    return 'session_' + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Enhanced mock suggestions with more realistic data
   */
  private getMockSuggestions(input: string): LocationSuggestion[] {
    const mockData: LocationSuggestion[] = [
      {
        id: 'mock_1',
        title: 'Janpath Society',
        subtitle: 'Bhadwatnagar, Maninagar, Ahmedabad',
        fullAddress: 'Janpath Society, Bhadwatnagar, Maninagar, Ahmedabad, Gujarat, India',
        placeId: 'mock_place_1',
        coordinates: { latitude: 23.0225, longitude: 72.5714 }
      },
      {
        id: 'mock_2',
        title: 'Maninagar Railway Station',
        subtitle: 'Maninagar, Ahmedabad',
        fullAddress: 'Maninagar Railway Station, Maninagar, Ahmedabad, Gujarat, India',
        placeId: 'mock_place_2',
        coordinates: { latitude: 23.0076, longitude: 72.5898 }
      },
      {
        id: 'mock_3',
        title: 'Kankaria Lake',
        subtitle: 'Maninagar, Ahmedabad',
        fullAddress: 'Kankaria Lake, Maninagar, Ahmedabad, Gujarat, India',
        placeId: 'mock_place_3',
        coordinates: { latitude: 23.0076, longitude: 72.5898 }
      },
      {
        id: 'mock_4',
        title: 'Law Garden',
        subtitle: 'Navrangpura, Ahmedabad',
        fullAddress: 'Law Garden, Navrangpura, Ahmedabad, Gujarat, India',
        placeId: 'mock_place_4',
        coordinates: { latitude: 23.0295, longitude: 72.5659 }
      },
      {
        id: 'mock_5',
        title: 'Sabarmati Ashram',
        subtitle: 'Ashram Road, Ahmedabad',
        fullAddress: 'Sabarmati Ashram, Ashram Road, Ahmedabad, Gujarat, India',
        placeId: 'mock_place_5',
        coordinates: { latitude: 23.0618, longitude: 72.5805 }
      },
    ];

    // Filter mock data based on input and return top 5
    const filtered = mockData.filter(
      (item) =>
        item.title.toLowerCase().includes(input.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);

    console.log(`📍 Returning ${filtered.length} mock suggestions for "${input}"`);
    return filtered;
  }

  /**
   * Clear the request cache
   */
  clearCache(): void {
    this.requestCache.clear();
    console.log('🧹 Google Places cache cleared');
  }

  /**
   * Get current location using device GPS
   */
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      // This would be implemented using expo-location
      // For now, return Ahmedabad coordinates as fallback
      return {
        latitude: 23.0225,
        longitude: 72.5714,
      };
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();
export default GooglePlacesService;