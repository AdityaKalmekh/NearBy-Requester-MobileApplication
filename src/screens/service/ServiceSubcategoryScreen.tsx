import React, { useState } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Import custom components
import Button from '../../components/common/Button';

// Import types
import { RootStackParamList, ServiceOption, ServiceSubcategory } from '../../navigation/types';

// Define route params type
type ServiceSubcategoryScreenRouteProp = RouteProp<RootStackParamList, 'ServiceSubcategory'>;
type ServiceSubcategoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ServiceSubcategory'>;

const ServiceSubcategoryScreen: React.FC = () => {
  const navigation = useNavigation<ServiceSubcategoryScreenNavigationProp>();
  const route = useRoute<ServiceSubcategoryScreenRouteProp>();
  const insets = useSafeAreaInsets();

  const { selectedService, source } = route.params;

  // State for tracking selected subcategories
  const [selectedSubcategories, setSelectedSubcategories] = useState<ServiceSubcategory[]>(
    selectedService.selectedSubcategories || []
  );

  // Define subcategories for each service type
  const getSubcategories = (serviceId: string): ServiceSubcategory[] => {
    const subcategoryData: { [key: string]: ServiceSubcategory[] } = {
      'plumbing': [
        {
          id: 'bath-fittings',
          name: 'Bath fittings',
          icon: 'water-outline',
          description: 'Shower heads, taps, bath accessories'
        },
        {
          id: 'basin-sink',
          name: 'Basin & sink',
          icon: 'ellipse-outline',
          description: 'Installation and repairs'
        },
        {
          id: 'grouting',
          name: 'Grouting',
          icon: 'grid-outline',
          description: 'Tile grouting and sealing'
        },
        {
          id: 'water-filter',
          name: 'Water filter',
          icon: 'funnel-outline',
          description: 'Installation and maintenance'
        },
        {
          id: 'drainage',
          name: 'Drainage',
          icon: 'arrow-down-circle-outline',
          description: 'Drain cleaning and repairs'
        },
        {
          id: 'toilet',
          name: 'Toilet',
          icon: 'home-outline',
          description: 'Installation and repairs'
        },
        {
          id: 'tap-mixer',
          name: 'Tap & mixer',
          icon: 'options-outline',
          description: 'Faucet installation and repairs'
        },
        {
          id: 'water-tank',
          name: 'Water tank',
          icon: 'cube-outline',
          description: 'Tank installation and cleaning'
        },
        {
          id: 'motor',
          name: 'Motor',
          icon: 'cog-outline',
          description: 'Water pump installation and repair'
        },
        {
          id: 'water-pipes',
          name: 'Water pipes',
          icon: 'git-network-outline',
          description: 'Pipe installation and repairs'
        },
        {
          id: 'book-visit',
          name: 'Book a visit',
          icon: 'person-outline',
          description: 'Schedule a consultation'
        }
      ],
      'electrician': [
        {
          id: 'wiring',
          name: 'Wiring',
          icon: 'flash-outline',
          description: 'House wiring and rewiring'
        },
        {
          id: 'switches-sockets',
          name: 'Switches & Sockets',
          icon: 'toggle-outline',
          description: 'Installation and replacement'
        },
        {
          id: 'ceiling-fan',
          name: 'Ceiling Fan',
          icon: 'sync-outline',
          description: 'Installation and repair'
        },
        {
          id: 'lighting',
          name: 'Lighting',
          icon: 'bulb-outline',
          description: 'Light fixtures and LED installation'
        },
        {
          id: 'inverter-ups',
          name: 'Inverter & UPS',
          icon: 'battery-charging-outline',
          description: 'Power backup solutions'
        },
        {
          id: 'mcb-fuse',
          name: 'MCB & Fuse',
          icon: 'shield-outline',
          description: 'Circuit breaker installation'
        },
        {
          id: 'appliance-repair',
          name: 'Appliance Repair',
          icon: 'build-outline',
          description: 'Electrical appliance fixing'
        },
        {
          id: 'book-visit',
          name: 'Book a visit',
          icon: 'person-outline',
          description: 'Schedule a consultation'
        }
      ],
      'cleaning': [
        {
          id: 'deep-cleaning',
          name: 'Deep Cleaning',
          icon: 'sparkles-outline',
          description: 'Complete house deep cleaning'
        },
        {
          id: 'bathroom-cleaning',
          name: 'Bathroom Cleaning',
          icon: 'water-outline',
          description: 'Deep bathroom sanitization'
        },
        {
          id: 'kitchen-cleaning',
          name: 'Kitchen Cleaning',
          icon: 'restaurant-outline',
          description: 'Complete kitchen cleaning'
        },
        {
          id: 'sofa-cleaning',
          name: 'Sofa Cleaning',
          icon: 'bed-outline',
          description: 'Furniture and upholstery cleaning'
        },
        {
          id: 'carpet-cleaning',
          name: 'Carpet Cleaning',
          icon: 'square-outline',
          description: 'Carpet and rug cleaning'
        },
        {
          id: 'post-construction',
          name: 'Post Construction',
          icon: 'construct-outline',
          description: 'After renovation cleaning'
        },
        {
          id: 'book-visit',
          name: 'Book a visit',
          icon: 'person-outline',
          description: 'Schedule a consultation'
        }
      ],
      'carpenter': [
        {
          id: 'furniture-repair',
          name: 'Furniture Repair',
          icon: 'hammer-outline',
          description: 'Chair, table, bed repairs'
        },
        {
          id: 'door-window',
          name: 'Door & Window',
          icon: 'home-outline',
          description: 'Installation and repairs'
        },
        {
          id: 'custom-furniture',
          name: 'Custom Furniture',
          icon: 'cube-outline',
          description: 'Made-to-order furniture'
        },
        {
          id: 'wardrobe',
          name: 'Wardrobe',
          icon: 'shirt-outline',
          description: 'Wardrobe installation and repair'
        },
        {
          id: 'cabinet-drawers',
          name: 'Cabinet & Drawers',
          icon: 'albums-outline',
          description: 'Kitchen and storage solutions'
        },
        {
          id: 'wooden-flooring',
          name: 'Wooden Flooring',
          icon: 'grid-outline',
          description: 'Floor installation and repair'
        },
        {
          id: 'book-visit',
          name: 'Book a visit',
          icon: 'person-outline',
          description: 'Schedule a consultation'
        }
      ],
      'painting': [
        {
          id: 'interior-painting',
          name: 'Interior Painting',
          icon: 'brush-outline',
          description: 'Inside wall and ceiling painting'
        },
        {
          id: 'exterior-painting',
          name: 'Exterior Painting',
          icon: 'home-outline',
          description: 'Outside wall painting'
        },
        {
          id: 'texture-painting',
          name: 'Texture Painting',
          icon: 'color-palette-outline',
          description: 'Decorative wall textures'
        },
        {
          id: 'waterproofing',
          name: 'Waterproofing',
          icon: 'umbrella-outline',
          description: 'Leak-proof painting solutions'
        },
        {
          id: 'book-visit',
          name: 'Book a visit',
          icon: 'person-outline',
          description: 'Schedule a consultation'
        }
      ]
    };

    return subcategoryData[serviceId] || [
      {
        id: 'book-visit',
        name: 'Book a visit',
        icon: 'person-outline',
        description: 'Schedule a consultation'
      }
    ];
  };

  const subcategories = getSubcategories(selectedService.id);

  // Get appropriate background color for the service
  const getServiceBackgroundColor = (serviceId: string): string => {
    const serviceColors: { [key: string]: string } = {
      'plumbing': '#E8F4FD',        // Light blue
      'electrician': '#FFF4E6',     // Light orange
      'cleaning': '#E8F5E8',        // Light green
      'ac-repair': '#F0F8FF',       // Light blue
      'carpenter': '#FFF8E1',       // Light yellow
      'painting': '#F3E8FF',        // Light purple
      'salon-women': '#FFE8F0',     // Light pink
      'salon-men': '#E8FFF4',       // Light mint
      'water-purifier': '#E8F4FD',  // Light blue
      'smart-locks': '#F0F4FF',     // Light indigo
      'mechanic': '#E8F5E8',        // Light green
      'pest-control': '#FFF4E6',    // Light orange
    };

    return serviceColors[serviceId] || '#E8F4FD'; // Default to light blue
  };

  // Get appropriate border color for the service
  const getServiceBorderColor = (serviceId: string): string => {
    const serviceBorderColors: { [key: string]: string } = {
      'plumbing': '#D6E9F7',        // Darker blue
      'electrician': '#F4E6D7',     // Darker orange
      'cleaning': '#D4E9D7',        // Darker green
      'ac-repair': '#E2E9FF',       // Darker blue
      'carpenter': '#F4F0D1',       // Darker yellow
      'painting': '#E8D6F3',        // Darker purple
      'salon-women': '#F4D6E2',     // Darker pink
      'salon-men': '#D6F4E8',       // Darker mint
      'water-purifier': '#D6E9F7',  // Darker blue
      'smart-locks': '#E0E2FF',     // Darker indigo
      'mechanic': '#D4E9D7',        // Darker green
      'pest-control': '#F4E6D7',    // Darker orange
    };

    return serviceBorderColors[serviceId] || '#D6E9F7'; // Default to darker blue
  };

  const handleSubcategoryToggle = (subcategory: ServiceSubcategory) => {
    setSelectedSubcategories(prev => {
      const isSelected = prev.some(item => item.id === subcategory.id);

      if (isSelected) {
        // Remove from selection
        return prev.filter(item => item.id !== subcategory.id);
      } else {
        // Add to selection
        return [...prev, subcategory];
      }
    });
  };

  const isSubcategorySelected = (subcategoryId: string): boolean => {
    return selectedSubcategories.some(item => item.id === subcategoryId);
  };

  const handleContinue = () => {
    if (selectedSubcategories.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one service');
      return;
    }

    // Navigate to ServiceRequestScreen with selected service and subcategories
    // The ServiceRequestScreen will show location/availability inputs
    navigation.navigate('ServiceRequest', {
      selectedService: {
        ...selectedService,
        selectedSubcategories: selectedSubcategories
      }
    });
  };

  const handleBackPress = () => {
    // if (source === 'home') {
    //   // If came directly from home (service card), just go back
    //   navigation.goBack();
    // } else if (source === 'search') {
    //   // If came from search flow, navigate to home to avoid stack issues
    //   // navigation.reset({
    //   //   index: 0,
    //   //   routes: [{ name: 'Main', params: { screen: 'Home' } }],
    //   // });
    //    navigation.navigate('ServiceRequest', {
    //     selectedService: {
    //       ...selectedService,
    //       // Remove subcategories to go back to dropdown mode
    //       selectedSubcategories: undefined
    //     }
    //   });
    // } else {
    //   navigation.goBack();
    // }
    navigation.goBack();
  };

  // Calculate responsive dimensions
  const getResponsiveDimensions = () => {
    const isTablet = screenWidth >= 768;
    const isLargePhone = screenWidth >= 414;
    const isSmallScreen = screenWidth < 360;

    let columns;
    if (isTablet) {
      columns = 3;
    } else if (isLargePhone) {
      columns = 2;
    } else {
      columns = 2;
    }

    const horizontalPadding = isTablet ? 24 : 16;
    const cardSpacing = isTablet ? 16 : 12;
    const availableWidth = screenWidth - (horizontalPadding * 2);
    const cardWidth = (availableWidth - (cardSpacing * (columns - 1))) / columns;

    return {
      columns,
      cardWidth: Math.floor(cardWidth),
      cardHeight: isTablet ? 120 : isSmallScreen ? 100 : 110,
      cardSpacing,
      horizontalPadding,
      iconSize: isTablet ? 32 : isSmallScreen ? 24 : 28,
      fontSize: isTablet ? 14 : isSmallScreen ? 12 : 13,
      borderRadius: isTablet ? 16 : 12,
    };
  };

  const dimensions = getResponsiveDimensions();

  // Render subcategory cards in rows
  const renderSubcategoryRows = () => {
    const rows = [];

    // Get service-specific colors
    const serviceBackgroundColor = getServiceBackgroundColor(selectedService.id);
    const serviceBorderColor = getServiceBorderColor(selectedService.id);

    for (let i = 0; i < subcategories.length; i += dimensions.columns) {
      const rowSubcategories = subcategories.slice(i, i + dimensions.columns);

      rows.push(
        <View key={i} style={[styles.subcategoryRow, { marginBottom: dimensions.cardSpacing }]}>
          {rowSubcategories.map((subcategory, index) => {
            const isSelected = isSubcategorySelected(subcategory.id);

            return (
              <TouchableOpacity
                key={subcategory.id}
                style={[
                  styles.subcategoryCard,
                  {
                    width: dimensions.cardWidth,
                    height: dimensions.cardHeight,
                    backgroundColor: serviceBackgroundColor,
                    borderRadius: dimensions.borderRadius,
                    marginRight: index < rowSubcategories.length - 1 ? dimensions.cardSpacing : 0,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? '#000000' : serviceBorderColor,
                  }
                ]}
                onPress={() => handleSubcategoryToggle(subcategory)}
                activeOpacity={0.7}
                accessibilityLabel={`${subcategory.name} service`}
                accessibilityRole="button"
              >
                <View style={styles.subcategoryCardContent}>
                  {/* Selection indicator */}
                  {isSelected && (
                    <View style={styles.selectionIndicator}>
                      <Ionicons name="checkmark-circle" size={20} color="#000000" />
                    </View>
                  )}

                  {/* Subcategory Icon */}
                  <View style={[
                    styles.subcategoryIconContainer,
                    {
                      width: dimensions.iconSize + 16,
                      height: dimensions.iconSize + 16,
                      borderRadius: (dimensions.iconSize + 16) / 2,
                      backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                    }
                  ]}>
                    <Ionicons
                      name={subcategory.icon}
                      size={dimensions.iconSize}
                      color={isSelected ? "#000000" : "#666666"}
                    />
                  </View>

                  {/* Subcategory Name */}
                  <Text
                    style={[
                      styles.subcategoryName,
                      {
                        fontSize: dimensions.fontSize,
                        color: isSelected ? "#000000" : "#333333",
                        fontWeight: isSelected ? '700' : '600'
                      }
                    ]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {subcategory.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Fill remaining space if last row has fewer items */}
          {rowSubcategories.length < dimensions.columns && (
            <View style={{ flex: 1 }} />
          )}
        </View>
      );
    }
    return rows;
  };

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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{selectedService.name}</Text>
          {selectedSubcategories.length > 0 && (
            <Text style={styles.selectedCount}>
              {selectedSubcategories.length} selected
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
          <Ionicons name="search-outline" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Service Info */}
      <View style={styles.serviceInfoContainer}>
        <Text style={styles.serviceName}>{selectedService.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>4.79 (4.9 M bookings)</Text>
        </View>
      </View>

      {/* Promotional Banners */}
      <View style={styles.promoBannersContainer}>
        <View style={styles.promoBanner}>
          <View style={styles.promoIcon}>
            <Ionicons name="diamond-outline" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoText}>Save 10% on every order</Text>
            <Text style={styles.promoSubtext}>Get Plus now</Text>
          </View>
        </View>

        <View style={styles.promoBanner}>
          <View style={[styles.promoIcon, { backgroundColor: '#10B981' }]}>
            <Text style={styles.promoIconText}>₹</Text>
          </View>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoText}>Up to ₹150</Text>
            <Text style={styles.promoSubtext}>Valid for Pa...</Text>
          </View>
        </View>
      </View>

      {/* Subcategories Grid */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.subcategoriesContainer, { paddingHorizontal: dimensions.horizontalPadding }]}>
          {renderSubcategoryRows()}
        </View>
      </ScrollView>

      {/* Continue Button - Fixed at bottom */}
      <View style={[
        styles.continueButtonContainer,
        { paddingBottom: Math.max(insets.bottom, 16) }
      ]}>
        <Button
          title={selectedSubcategories.length === 0 
            ? "Select services to continue" 
            : `Continue with ${selectedSubcategories.length} service${selectedSubcategories.length !== 1 ? 's' : ''}`
          }
          onPress={handleContinue}
          disabled={selectedSubcategories.length === 0}
          style={{
            ...styles.continueButton,
            ...(selectedSubcategories.length === 0 ? styles.continueButtonDisabled : {})
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  selectedCount: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  searchButton: {
    padding: 8,
    marginRight: 8,
  },
  shareButton: {
    padding: 8,
  },
  serviceInfoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  serviceName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 4,
  },
  promoBannersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  promoBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  promoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  promoIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  promoTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  promoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  promoSubtext: {
    fontSize: 12,
    color: '#666666',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 120, // Extra space for fixed button
  },
  subcategoriesContainer: {
    paddingVertical: 8,
  },
  subcategoryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  subcategoryCard: {
    backgroundColor: '#E8F4FD',
    borderWidth: 1,
    borderColor: '#D6E9F7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  subcategoryCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  subcategoryIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  subcategoryName: {
    color: '#000000',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
    includeFontPadding: false,
  },
  continueButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
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
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: '#000000',
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
});

export default ServiceSubcategoryScreen;