import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ServiceOption {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  color?: string; // Optional background color for service cards
}

interface ServiceGridProps {
  services: ServiceOption[];
  onServicePress: (service: ServiceOption) => void;
  numColumns?: number; // Allow customizable columns
}

const { width: screenWidth } = Dimensions.get('window');

const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  onServicePress,
  numColumns,
}) => {
  // Calculate responsive dimensions
  const getResponsiveDimensions = () => {
    const isTablet = screenWidth >= 768;
    const isLargePhone = screenWidth >= 414;
    const isSmallScreen = screenWidth < 360;

    // Determine optimal number of columns based on screen size
    let columns = numColumns;
    if (!columns) {
      if (isTablet) {
        columns = 4; // 4 columns on tablets
      } else if (isLargePhone) {
        columns = 3; // 3 columns on large phones
      } else if (isSmallScreen) {
        columns = 2; // 2 columns on small screens
      } else {
        columns = 3; // 3 columns default
      }
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

  // Default colors for service cards
  const getServiceCardColor = (serviceId: string, index: number): string => {
    const colors = [
      '#E8F5E8', // Light green
      '#E8F4FD', // Light blue
      '#FFF4E6', // Light orange
      '#F3E8FF', // Light purple
      '#FFE8E8', // Light red
      '#E8FFF4', // Light mint
      '#FFF8E1', // Light yellow
      '#F0F4FF', // Light indigo
    ];
    
    // Use a consistent color based on service ID or index
    return colors[index % colors.length];
  };

  const getIconColor = (serviceId: string): string => {
    const iconColors: { [key: string]: string } = {
      'plumbing': '#2196F3',
      'electrician': '#FF9800',
      'painting': '#9C27B0',
      'mechanic': '#4CAF50',
      'carpenter': '#795548',
      'cleaning': '#00BCD4',
    };
    
    return iconColors[serviceId] || '#666666';
  };

  // Render service cards in rows
  const renderServiceRows = () => {
    const rows = [];
    for (let i = 0; i < services.length; i += dimensions.columns) {
      const rowServices = services.slice(i, i + dimensions.columns);
      
      rows.push(
        <View key={i} style={[styles.serviceRow, { marginBottom: dimensions.cardSpacing }]}>
          {rowServices.map((service, index) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                {
                  width: dimensions.cardWidth,
                  height: dimensions.cardHeight,
                  backgroundColor: service.color || getServiceCardColor(service.id, i + index),
                  borderRadius: dimensions.borderRadius,
                  marginRight: index < rowServices.length - 1 ? dimensions.cardSpacing : 0,
                }
              ]}
              onPress={() => onServicePress(service)}
              activeOpacity={0.7}
              accessibilityLabel={`${service.name} service`}
              accessibilityRole="button"
            >
              <View style={styles.serviceCardContent}>
                {/* Service Icon */}
                <View style={[
                  styles.serviceIconContainer,
                  {
                    width: dimensions.iconSize + 16,
                    height: dimensions.iconSize + 16,
                    borderRadius: (dimensions.iconSize + 16) / 2,
                  }
                ]}>
                  <Ionicons
                    name={service.icon}
                    size={dimensions.iconSize}
                    color={getIconColor(service.id)}
                  />
                </View>

                {/* Service Name */}
                <Text
                  style={[
                    styles.serviceName,
                    { fontSize: dimensions.fontSize }
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {service.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Fill remaining space if last row has fewer items */}
          {rowServices.length < dimensions.columns && (
            <View style={{ flex: 1 }} />
          )}
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={[styles.container, { paddingHorizontal: dimensions.horizontalPadding }]}>
      {renderServiceRows()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    // Shadow for iOS and Android
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
  serviceCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  serviceIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    // Subtle shadow for icon container
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
  serviceName: {
    color: '#000000',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
    includeFontPadding: false,
  },
});

export default ServiceGrid;