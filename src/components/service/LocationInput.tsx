import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Import Google Places service
import { googlePlacesService, LocationSuggestion } from '../../services/GooglePlacesService';

interface LocationInputProps {
  value: string;
  onLocationSelect: (location: string, coordinates?: { latitude: number; longitude: number }) => void;
  onFocusChange?: (focused: boolean) => void; // New prop to notify parent about focus state
  placeholder?: string;
  disabled?: boolean;
}

// Define ref methods
export interface LocationInputRef {
  focusInput: () => void;
  blurInput: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const LocationInput = forwardRef<LocationInputRef, LocationInputProps>(({
  value,
  onLocationSelect,
  onFocusChange,
  placeholder = "Enter your location",
  disabled = false,
}, ref) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const inputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    focusInput: () => {
      inputRef.current?.focus();
    },
    blurInput: () => {
      inputRef.current?.blur();
    },
  }));

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Update internal value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Add current location option at the top
  const getCurrentLocationOption = () => ({
    id: 'current-location',
    title: 'Use current location',
    subtitle: 'Detect my location automatically',
    fullAddress: 'Use current location',
    placeId: 'current_location',
  });

  const getCurrentLocation = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (text.length > 1) {
      setIsLoading(true);
      
      // Debounce the API call to avoid too many requests
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const placeSuggestions = await googlePlacesService.getAutocompleteSuggestions(
            text,
            currentLocation || undefined,
            5000 // 5km radius
          );
          
          // Limit to 5 Google Places suggestions so we have 6 total (including current location)
          const limitedPlaceSuggestions = placeSuggestions.slice(0, 5);
          
          // Combine current location + Google Places suggestions (max 6 total)
          const allSuggestions = [
            getCurrentLocationOption(),
            ...limitedPlaceSuggestions,
          ];
          
          setSuggestions(allSuggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching location suggestions:', error);
          // Fallback with current location only
          setSuggestions([getCurrentLocationOption()]);
          setShowSuggestions(true);
        } finally {
          setIsLoading(false);
        }
      }, 300); // 300ms debounce
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = async (suggestion: LocationSuggestion) => {
    try {
      // Handle special case for current location
      if (suggestion.id === 'current-location') {
        await handleCurrentLocationSelect();
        return;
      }
      
      // Handle regular location selection
      setInputValue(suggestion.title);
      
      // Set cursor to the beginning of the text after a short delay
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelection(0, 0);
        }
      }, 50);
      
      // Get detailed place information if it's a real Google Places result
      if (suggestion.placeId && !suggestion.placeId.startsWith('mock_')) {
        try {
          const placeDetails = await googlePlacesService.getPlaceDetails(suggestion.placeId);
          if (placeDetails) {
            onLocationSelect(suggestion.fullAddress, {
              latitude: placeDetails.geometry.location.lat,
              longitude: placeDetails.geometry.location.lng,
            });
          } else {
            onLocationSelect(suggestion.fullAddress);
          }
        } catch (error) {
          console.error('Error getting place details:', error);
          onLocationSelect(suggestion.fullAddress);
        }
      } else {
        onLocationSelect(suggestion.fullAddress, suggestion.coordinates);
      }
      
      setShowSuggestions(false);
      inputRef.current?.blur();
    } catch (error) {
      console.error('Error selecting location:', error);
      Alert.alert('Error', 'Failed to select location. Please try again.');
    }
  };

  const handleCurrentLocationSelect = async () => {
    try {
      setIsLoading(true);
      
      // Request location permissions if not already granted
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to use your current location.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        return;
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        const formattedAddress = [
          address.name,
          address.street,
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');

        setInputValue(formattedAddress);
        
        // Set cursor to the beginning of the text after a short delay
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelection(0, 0);
          }
        }, 50);
        
        onLocationSelect(formattedAddress, { latitude, longitude });
        setCurrentLocation({ latitude, longitude });
      } else {
        const fallbackAddress = `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setInputValue(fallbackAddress);
        
        // Set cursor to the beginning of the text after a short delay
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelection(0, 0);
          }
        }, 50);
        
        onLocationSelect(fallbackAddress, { latitude, longitude });
      }

      setShowSuggestions(false);
      inputRef.current?.blur();
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Location Error',
        'Failed to get your current location. Please check your location settings and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocusChange?.(true); // Notify parent about focus
    if (inputValue.length > 1) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    onFocusChange?.(false); // Notify parent about blur
    // Delay hiding suggestions to allow for suggestion tap
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  const handleClearInput = () => {
    setInputValue('');
    onLocationSelect('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Calculate responsive dimensions
  const getResponsiveDimensions = () => {
    const isTablet = screenWidth >= 768;
    const isSmallScreen = screenWidth < 360;

    return {
      inputHeight: isTablet ? 56 : 48,
      fontSize: isTablet ? 18 : isSmallScreen ? 14 : 16,
      iconSize: isTablet ? 24 : 20,
    };
  };

  const dimensions = getResponsiveDimensions();

  const calculateSuggestionsHeight = () => {
    if (suggestions.length === 0) return 0;
    
    const isTablet = screenWidth >= 768;
    const itemHeight = isTablet ? 80 : 70; // Responsive height per item
    const maxItems = 6; // Always show up to 6 items
    const minHeight = itemHeight; // Minimum height for at least one item
    const maxHeight = isTablet ? 480 : 420; // Responsive max height (6 * 80 = 480, 6 * 70 = 420)
    
    const actualItems = Math.min(suggestions.length, maxItems);
    const calculatedHeight = actualItems * itemHeight;
    
    return Math.max(minHeight, Math.min(calculatedHeight, maxHeight));
  };

  const getSuggestionItemStyle = () => {
    const isTablet = screenWidth >= 768;
    return [
      styles.suggestionItem,
      { paddingVertical: isTablet ? 18 : 15 }
    ];
  };

  return (
    <View style={styles.container}>
      {/* Input Container */}
      <View style={[
        styles.inputContainer,
        {
          height: dimensions.inputHeight,
          borderColor: isFocused ? '#000000' : '#E0E0E0',
          opacity: disabled ? 0.5 : 1,
        }
      ]}>
        <View style={styles.inputContent}>
          <Ionicons
            name="search-outline"
            size={dimensions.iconSize}
            color="#666666"
            style={styles.searchIcon}
          />
          <TextInput
            ref={inputRef}
            style={[styles.textInput, { fontSize: dimensions.fontSize }]}
            value={inputValue}
            onChangeText={handleInputChange}
            placeholder={placeholder}
            placeholderTextColor="#999999"
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            autoComplete="street-address"
            autoCapitalize="words"
            returnKeyType="search"
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <ActivityIndicator 
              size="small" 
              color="#666666" 
              style={styles.loadingIndicator} 
            />
          )}
          
          {/* Clear Button */}
          {inputValue.length > 0 && !isLoading && (
            <TouchableOpacity
              onPress={handleClearInput}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Suggestions List */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={[
          styles.suggestionsContainer,
          { height: calculateSuggestionsHeight() }
        ]}>
          <ScrollView
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={suggestions.length > 6}
            nestedScrollEnabled={true}
          >
            {suggestions.map((item, index) => {
              const isCurrentLocation = item.id === 'current-location';
              const showSeparator = index < suggestions.length - 1;
              
              return (
                <View key={item.id}>
                  <TouchableOpacity
                    style={getSuggestionItemStyle()}
                    onPress={() => handleSuggestionSelect(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.suggestionIcon}>
                      <Ionicons 
                        name={isCurrentLocation ? "navigate-outline" : "location-outline"} 
                        size={16} 
                        color="#666666" 
                      />
                    </View>
                    <View style={styles.suggestionContent}>
                      <Text 
                        style={styles.suggestionTitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.title}
                      </Text>
                      {item.subtitle && (
                        <Text 
                          style={styles.suggestionSubtitle}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  {showSeparator && (
                    <View style={styles.separator} />
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* No suggestions message */}
      {showSuggestions && inputValue.length > 1 && suggestions.length === 0 && !isLoading && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No locations found</Text>
          <Text style={styles.noResultsSubtext}>
            Try entering a different location
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  inputContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: '#000000',
    paddingVertical: 0,
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#F8F9FA',
    zIndex: 1000,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 15,
    backgroundColor: '#F8F9FA',
  },
  suggestionIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  suggestionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
    lineHeight: 20,
  },
  suggestionSubtitle: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 44,
  },
  noResultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#F8F9FA',
    paddingVertical: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999999',
  },
});

// Add display name for debugging
LocationInput.displayName = 'LocationInput';

export default LocationInput;