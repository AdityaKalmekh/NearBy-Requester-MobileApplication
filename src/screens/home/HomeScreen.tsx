import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Import types
import { RootStackParamList } from '../../navigation/types';

// Import components
import TopAppBar from '../../components/common/TopAppBar';
import DrawerMenu from '../../components/common/DrawerMenu';
import ServiceGrid, { ServiceOption } from '../../components/service/ServiceGrid';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  // Service options with custom colors matching the design
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

  const handleMenuPress = () => {
    setIsDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerVisible(false);
  };

  const handleNavigate = (screen: string) => {
    // TODO: Implement actual navigation to different screens
    Alert.alert('Navigation', `Navigate to ${screen} screen`);
  };

  const handleSearchPress = () => {
    // Navigate to ServiceRequestScreen with auto-open service dropdown
    navigation.navigate('ServiceRequest', { 
      autoOpenServiceDropdown: true 
    });
  };

  const handleServicePress = (service: ServiceOption) => {
    // Navigate directly to ServiceSubcategoryScreen (no longer go to ServiceRequestScreen first)
    navigation.navigate('ServiceSubcategory', { 
      selectedService: service,
      source: 'home' // Track that user came from home screen
    });
    
    console.log('Selected service:', service.name);
  };

  // Calculate responsive dimensions
  const getResponsiveDimensions = () => {
    const isTablet = screenWidth >= 768;
    const isSmallScreen = screenWidth < 360;

    return {
      horizontalPadding: isTablet ? 24 : 16,
      sectionSpacing: isTablet ? 32 : 24,
      titleFontSize: isTablet ? 36 : 28,
      subtitleFontSize: isTablet ? 24 : 18,
      descriptionFontSize: isTablet ? 18 : 16,
      sectionTitleFontSize: isTablet ? 24 : 20,
    };
  };

  const dimensions = getResponsiveDimensions();

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <TopAppBar
        onMenuPress={handleMenuPress}
        onSearchPress={handleSearchPress}
        searchPlaceholder="Find services near you"
        backgroundColor="#FFFFFF"
        showSearch={true}
      />

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingHorizontal: dimensions.horizontalPadding }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={[styles.welcomeSection, { marginBottom: dimensions.sectionSpacing }]}>
          <Text style={[styles.title, { fontSize: dimensions.titleFontSize }]}>
            Welcome to NearBy
          </Text>
          <Text style={[styles.subtitle, { fontSize: dimensions.subtitleFontSize }]}>
            Find service providers near you
          </Text>
          <Text style={[styles.description, { fontSize: dimensions.descriptionFontSize }]}>
            Connect with local electricians, plumbers, carpenters and more
          </Text>
        </View>

        {/* Services Section */}
        <View style={[styles.servicesSection, { marginBottom: dimensions.sectionSpacing }]}>
          <Text style={[styles.sectionTitle, { fontSize: dimensions.sectionTitleFontSize }]}>
            Our Services
          </Text>
          <Text style={styles.sectionSubtitle}>
            Choose from our wide range of home services
          </Text>
          
          {/* Service Grid */}
          <View style={styles.serviceGridContainer}>
            <ServiceGrid
              services={serviceOptions}
              onServicePress={handleServicePress}
              // numColumns will be automatically calculated based on screen size
            />
          </View>
        </View>

        {/* Recent Requests Section - Placeholder for future implementation */}
        <View style={[styles.recentSection, { marginBottom: dimensions.sectionSpacing }]}>
          <Text style={[styles.sectionTitle, { fontSize: dimensions.sectionTitleFontSize }]}>
            Recent Requests
          </Text>
          <Text style={styles.sectionSubtitle}>
            Your recent service requests will appear here
          </Text>
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholderText}>
              No recent requests yet. Book a service to get started!
            </Text>
          </View>
        </View>

        {/* Promotional Section - Optional */}
        <View style={[styles.promoSection, { marginBottom: dimensions.sectionSpacing }]}>
          <Text style={[styles.sectionTitle, { fontSize: dimensions.sectionTitleFontSize }]}>
            Special Offers
          </Text>
          <View style={styles.promoCard}>
            <Text style={styles.promoTitle}>🎉 Welcome Offer</Text>
            <Text style={styles.promoDescription}>
              Get 20% off on your first service booking
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Drawer Menu */}
      <DrawerMenu
        visible={isDrawerVisible}
        onClose={handleCloseDrawer}
        // onNavigate={handleNavigate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 100, // Extra padding for bottom tab navigation
  },
  welcomeSection: {
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
    textAlign: 'center',
  },
  description: {
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  servicesSection: {
    // No background color, let the service cards show their individual colors
  },
  serviceGridContainer: {
    marginTop: 16,
    // Remove horizontal padding since ServiceGrid handles its own padding
    marginHorizontal: -16, // Compensate for parent padding
  },
  recentSection: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  promoSection: {
    // No background, let the promo card have its own styling
  },
  promoCard: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  promoDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#000000',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 4,
  },
  placeholderContent: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default HomeScreen;