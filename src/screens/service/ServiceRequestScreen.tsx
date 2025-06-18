import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Import custom components
import ServiceDropdown, { ServiceDropdownRef } from '../../components/service/ServiceDropdown';
import LocationInput, { LocationInputRef } from '../../components/service/LocationInput';
import Button from '../../components/common/Button';
import AvailabilityPicker from '../../components/service/AvailabilityPicker';

// Import types
import { RootStackParamList, ServiceOption } from '../../navigation/types';

// Define route params type
type ServiceRequestScreenRouteProp = RouteProp<RootStackParamList, 'ServiceRequest'>;
type ServiceRequestScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ServiceRequest'>;

export interface AvailabilitySlot {
  date: Date;
  timeSlot: string;
  displayText: string;
}

const ServiceRequestScreen: React.FC = () => {
  const navigation = useNavigation<ServiceRequestScreenNavigationProp>();
  const route = useRoute<ServiceRequestScreenRouteProp>();
  const insets = useSafeAreaInsets();
  
  // Get navigation params
  const { 
    autoOpenServiceDropdown = false, 
    selectedService: preSelectedService 
  } = route.params || {};
  
  // State management
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(preSelectedService || null);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilitySlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationInputFocused, setIsLocationInputFocused] = useState(false);
  
  // Refs for child components
  const serviceDropdownRef = useRef<ServiceDropdownRef>(null);
  const locationInputRef = useRef<LocationInputRef>(null);

  // Service options for dropdown
  const serviceOptions: ServiceOption[] = [
    {
      id: 'plumbing',
      name: 'Plumbing',
      icon: 'water-outline',
      description: 'Pipe repairs, leaks, installations',
      color: '#E8F4FD',
    },
    {
      id: 'electrician',
      name: 'Electrician',
      icon: 'flash-outline',
      description: 'Wiring, repairs, installations',
      color: '#FFF4E6',
    },
    {
      id: 'cleaning',
      name: 'Cleaning',
      icon: 'sparkles-outline',
      description: 'Home and office cleaning',
      color: '#E8F5E8',
    },
    {
      id: 'ac-repair',
      name: 'AC & Appliance Repair',
      icon: 'snow-outline',
      description: 'AC servicing and appliance repairs',
      color: '#F0F8FF',
    },
    {
      id: 'carpenter',
      name: 'Carpenter',
      icon: 'hammer-outline',
      description: 'Furniture, repairs, installations',
      color: '#FFF8E1',
    },
    {
      id: 'painting',
      name: 'Painting',
      icon: 'brush-outline',
      description: 'Interior and exterior painting',
      color: '#F3E8FF',
    },
    {
      id: 'salon-women',
      name: "Women's Salon & Spa",
      icon: 'cut-outline',
      description: 'Beauty and wellness services',
      color: '#FFE8F0',
    },
    {
      id: 'salon-men',
      name: "Men's Salon & Massage",
      icon: 'man-outline',
      description: 'Grooming and massage services',
      color: '#E8FFF4',
    },
    {
      id: 'water-purifier',
      name: 'Water Purifier',
      icon: 'water-outline',
      description: 'Installation and maintenance',
      color: '#E8F4FD',
    },
    {
      id: 'smart-locks',
      name: 'Smart Locks',
      icon: 'lock-closed-outline',
      description: 'Smart home security',
      color: '#F0F4FF',
    },
    {
      id: 'mechanic',
      name: 'Vehicle Service',
      icon: 'car-outline',
      description: 'Vehicle repairs and maintenance',
      color: '#E8F5E8',
    },
    {
      id: 'pest-control',
      name: 'Pest Control',
      icon: 'bug-outline',
      description: 'Pest and termite control',
      color: '#FFF4E6',
    },
  ];

  // Auto-open service dropdown if coming from search
  useEffect(() => {
    if (autoOpenServiceDropdown && serviceDropdownRef.current) {
      const timer = setTimeout(() => {
        serviceDropdownRef.current?.openDropdown();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [autoOpenServiceDropdown]);

  // Reset state when coming back to dropdown mode (no selected service with subcategories)
  useEffect(() => {
    if (!preSelectedService?.selectedSubcategories?.length) {
      setSelectedService(null);
      setSelectedLocation('');
      setSelectedCoordinates(null);
      setSelectedAvailability(null);
    } else {
      setSelectedService(preSelectedService);
    }
  }, [preSelectedService]);

  // Handle state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Use a timeout to ensure all navigation state is settled
      const timeoutId = setTimeout(() => {
        const currentParams = route.params;
        
        if (currentParams?.selectedService) {
          // Use the service from route params
          setSelectedService(currentParams.selectedService);
          
          // If it doesn't have subcategories, we're in dropdown mode
          if (!currentParams.selectedService.selectedSubcategories?.length) {
            setSelectedLocation('');
            setSelectedCoordinates(null);
            setSelectedAvailability(null);
          }
        } else {
          // No route params - check if we need to reset from subcategory mode
          setSelectedService(prev => {
            if (prev?.selectedSubcategories?.length) {
              // Had subcategories, remove them to show dropdown
              const serviceWithoutSubcategories = {
                ...prev,
                selectedSubcategories: undefined
              };
              // Also reset other fields
              setSelectedLocation('');
              setSelectedCoordinates(null);
              setSelectedAvailability(null);
              return serviceWithoutSubcategories;
            }
            return prev;
          });
        }
      }, 50);

      return () => clearTimeout(timeoutId);
    }, [route.params])
  );

  // Auto-focus location input if service is already selected with subcategories
  useEffect(() => {
    if (selectedService?.selectedSubcategories?.length && locationInputRef.current) {
      const timer = setTimeout(() => {
        locationInputRef.current?.focusInput();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [selectedService]);

  const handleBackPress = () => {
    if (selectedService?.selectedSubcategories?.length) {
      // If we have a service with subcategories (location/availability phase), 
      // just go back normally - this will return to the subcategory screen
      navigation.goBack();
    } else {
      // If we're in dropdown phase (no service selected or no subcategories),
      // go back to home screen
      navigation.goBack();
    }
  };

  const handleServiceSelect = (service: ServiceOption) => {
    setSelectedService(service);
    
    // Navigate to subcategory selection screen
    navigation.navigate('ServiceSubcategory', {
      selectedService: service,
      source: 'search' // Track that user came from search/dropdown
    });
  };

  const handleLocationSelect = useCallback((location: string, coordinates?: { latitude: number; longitude: number }) => {
    setSelectedLocation(location);
    setSelectedCoordinates(coordinates || null);
  }, []);

  const handleLocationFocusChange = useCallback((focused: boolean) => {
    setIsLocationInputFocused(focused);
  }, []);

  const handleAvailabilitySelect = useCallback((availability: AvailabilitySlot) => {
    setSelectedAvailability(availability);
  }, []);

  const handleSubmitRequest = async () => {
    if (!selectedService) {
      Alert.alert('Service Required', 'Please select a service type');
      return;
    }

    if (!selectedService.selectedSubcategories?.length) {
      Alert.alert('Service Details Required', 'Please select service details');
      return;
    }

    if (!selectedLocation.trim()) {
      Alert.alert('Location Required', 'Please enter your location');
      return;
    }

    // if (!selectedAvailability) {
    //   Alert.alert('Availability Required', 'Please select your preferred date and time');
    //   return;
    // }

    setIsLoading(true);

    try {
      // TODO: Submit service request to backend
      console.log('Service Request:', {
        service: selectedService,
        location: selectedLocation,
        coordinates: selectedCoordinates,
        availability: selectedAvailability
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Request Submitted',
        `Your ${selectedService.name.toLowerCase()} request has been submitted for ${selectedAvailability?.displayText}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Main', { screen: 'Home' })
          }
        ]
      );
    } catch (error) {
      console.error('Failed to submit request:', error);
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine what to show based on the flow
  const showServiceDropdown = !selectedService || !selectedService.selectedSubcategories?.length;
  const showLocationAndAvailability = selectedService && selectedService.selectedSubcategories && selectedService.selectedSubcategories.length > 0;

  // Check if form is valid for submission
  const isFormValid = selectedService && 
                      selectedService.selectedSubcategories && 
                      selectedService.selectedSubcategories.length > 0 &&
                      selectedLocation.trim().length > 0;
                      // selectedAvailability !== null;
  
  const shouldShowButton = isFormValid && !isLocationInputFocused;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {showLocationAndAvailability ? `Book ${selectedService.name}` : 'Service Request'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.contentContainer,
          !shouldShowButton && styles.contentContainerNoButton
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Service Selection - Only show if no service selected or no subcategories */}
        {showServiceDropdown && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Select Service</Text>
            <ServiceDropdown
              ref={serviceDropdownRef}
              options={serviceOptions}
              selectedOption={selectedService}
              onSelect={handleServiceSelect}
              placeholder="Choose a service type"
            />
          </View>
        )}

        {/* Location & Availability - Only show when service is fully selected */}
        {showLocationAndAvailability && (
          <>
            {/* Location Selection */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>Service Location</Text>
              <LocationInput
                ref={locationInputRef}
                value={selectedLocation}
                onLocationSelect={handleLocationSelect}
                onFocusChange={handleLocationFocusChange}
                placeholder="Where do you need the service?"
              />
            </View>

            {/* Availability Selection - Hide when location input is focused */}
            {!isLocationInputFocused && selectedLocation && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionLabel}>Preferred Date & Time</Text>
                <AvailabilityPicker
                  selectedAvailability={selectedAvailability}
                  onSelect={handleAvailabilitySelect}
                  placeholder="When do you need the service?"
                />
              </View>
            )}

            {/* Final Summary - Only show when all fields are filled and location input is not focused */}
            {selectedLocation && !isLocationInputFocused && (
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Booking Summary</Text>
                
                <View style={styles.summaryRow}>
                  <Ionicons name="construct-outline" size={20} color="#666666" />
                  <Text style={styles.summaryText}>
                    {selectedService.name} ({selectedService?.selectedSubcategories?.length} services)
                  </Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Ionicons name="location-outline" size={20} color="#666666" />
                  <Text style={styles.summaryText} numberOfLines={2}>
                    {selectedLocation}
                  </Text>
                </View>
                
                {selectedAvailability && (
                  <View style={styles.summaryRow}>
                  <Ionicons name="time-outline" size={20} color="#666666" />
                  <Text style={styles.summaryText}>
                    {selectedAvailability?.displayText}
                  </Text>
                </View>
                )}
              </View>
            )}

            {/* Submit Button - Only show when form is valid and location input is not focused */}
            {shouldShowButton && (
              <View style={styles.buttonContainer}>
                <Button
                  title={isLoading ? "Finding Providers..." : "Find Service Providers"}
                  onPress={handleSubmitRequest}
                  disabled={!isFormValid || isLoading}
                  loading={isLoading}
                  style={styles.submitButton}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Fixed Button at Bottom - Show when form is valid but input is focused */}
      {isFormValid && isLocationInputFocused && (
        <View style={styles.fixedButtonContainer}>
          <Button
            title={isLoading ? "Finding Providers..." : "Find Service Providers"}
            onPress={handleSubmitRequest}
            disabled={!isFormValid || isLoading}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  contentContainerNoButton: {
    paddingBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 16,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});

export default ServiceRequestScreen;