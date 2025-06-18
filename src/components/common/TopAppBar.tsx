import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TopAppBarProps {
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  searchPlaceholder?: string;
  backgroundColor?: string;
  showSearch?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const TopAppBar: React.FC<TopAppBarProps> = ({
  onMenuPress,
  onSearchPress,
  searchPlaceholder = "Where are you going?",
  backgroundColor = "#FFFFFF",
  showSearch = true,
}) => {
  const insets = useSafeAreaInsets();

  // Calculate responsive dimensions
  const getResponsiveDimensions = () => {
    const isTablet = screenWidth >= 768;
    const isSmallScreen = screenWidth < 360;

    return {
      horizontalPadding: isTablet ? 24 : isSmallScreen ? 12 : 16,
      searchBarHeight: isTablet ? 50 : 44,
      fontSize: isTablet ? 18 : isSmallScreen ? 14 : 16,
      iconSize: isTablet ? 28 : 24,
      borderRadius: isTablet ? 12 : 8,
    };
  };

  const dimensions = getResponsiveDimensions();

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    } else {
      console.log('Menu pressed - implement navigation drawer');
    }
  };

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      console.log('Search pressed - implement search functionality');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      {/* Status bar background for Android */}
      {Platform.OS === 'android' && (
        <StatusBar
          backgroundColor={backgroundColor}
          barStyle="dark-content"
          translucent={false}
        />
      )}
      
      <View style={[
        styles.appBarContent,
        { paddingHorizontal: dimensions.horizontalPadding }
      ]}>
        {/* Menu Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleMenuPress}
          activeOpacity={0.7}
          accessibilityLabel="Open menu"
          accessibilityRole="button"
        >
          <Ionicons
            name="menu"
            size={dimensions.iconSize}
            color="#000000"
          />
        </TouchableOpacity>

        {/* Search Bar */}
        {showSearch && (
          <TouchableOpacity
            style={[
              styles.searchContainer,
              {
                height: dimensions.searchBarHeight,
                borderRadius: dimensions.borderRadius,
              }
            ]}
            onPress={handleSearchPress}
            activeOpacity={0.8}
            accessibilityLabel={`Search: ${searchPlaceholder}`}
            accessibilityRole="button"
          >
            <Ionicons
              name="search"
              size={20}
              color="#666666"
              style={styles.searchIcon}
            />
            <Text
              style={[
                styles.searchPlaceholder,
                { fontSize: dimensions.fontSize }
              ]}
              numberOfLines={1}
            >
              {searchPlaceholder}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    // Shadow for iOS
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
        elevation: 4,
      },
    }),
    zIndex: 1000,
  },
  appBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: 56, // Standard Material Design app bar height
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // Add touch feedback for better UX
    ...Platform.select({
      android: {
        // Android ripple effect handled by TouchableOpacity
      },
      ios: {
        // iOS already has good default feedback
      },
    }),
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    // Ensure consistent appearance across platforms
    ...Platform.select({
      android: {
        elevation: 1,
      },
      ios: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    flex: 1,
    color: '#666666',
    fontWeight: '400',
    // Ensure text doesn't get cut off
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default TopAppBar;