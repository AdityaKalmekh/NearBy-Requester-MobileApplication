import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceOption } from '../../navigation/types';


// interface ServiceOption {
//   id: string;
//   name: string;
//   icon: keyof typeof Ionicons.glyphMap;
//   description: string;
// }

interface ServiceDropdownProps {
  options: ServiceOption[];
  selectedOption: ServiceOption | null;
  onSelect: (option: ServiceOption) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Define ref methods
export interface ServiceDropdownRef {
  openDropdown: () => void;
  closeDropdown: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const ServiceDropdown = forwardRef<ServiceDropdownRef, ServiceDropdownProps>(({
  options,
  selectedOption,
  onSelect,
  placeholder = "Select an option",
  disabled = false,
}, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openDropdown: () => {
      if (!disabled) {
        setIsVisible(true);
      }
    },
    closeDropdown: () => {
      setIsVisible(false);
    },
  }));

  const handleSelect = (option: ServiceOption) => {
    onSelect(option);
    setIsVisible(false);
  };

  const handleOpen = () => {
    if (!disabled) {
      setIsVisible(true);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const renderServiceItem = ({ item }: { item: ServiceOption }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        selectedOption?.id === item.id && styles.selectedOption
      ]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.optionContent}>
        <View style={[
          styles.optionIcon,
          selectedOption?.id === item.id && styles.selectedOptionIcon
        ]}>
          <Ionicons
            name={item.icon}
            size={24}
            color={selectedOption?.id === item.id ? "#FFFFFF" : "#000000"}
          />
        </View>
        <View style={styles.optionText}>
          <Text style={[
            styles.optionName,
            selectedOption?.id === item.id && styles.selectedOptionText
          ]}>
            {item.name}
          </Text>
          <Text style={[
            styles.optionDescription,
            selectedOption?.id === item.id && styles.selectedOptionDescription
          ]}>
            {item.description}
          </Text>
        </View>
        {selectedOption?.id === item.id && (
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
        )}
      </View>
    </TouchableOpacity>
  );

  // Calculate responsive dimensions
  const getResponsiveDimensions = () => {
    const isTablet = screenWidth >= 768;
    const isSmallScreen = screenWidth < 360;

    return {
      dropdownHeight: isTablet ? 56 : 48,
      fontSize: isTablet ? 18 : isSmallScreen ? 14 : 16,
      iconSize: isTablet ? 24 : 20,
      modalPadding: isTablet ? 32 : 20,
    };
  };

  const dimensions = getResponsiveDimensions();

  return (
    <>
      {/* Dropdown Trigger */}
      <TouchableOpacity
        style={[
          styles.dropdownContainer,
          {
            height: dimensions.dropdownHeight,
            opacity: disabled ? 0.5 : 1,
            borderColor: isVisible ? '#000000' : '#E0E0E0', // Highlight when open
          }
        ]}
        onPress={handleOpen}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownContent}>
          {selectedOption ? (
            <View style={styles.selectedContent}>
              <View style={styles.selectedIcon}>
                <Ionicons
                  name={selectedOption.icon}
                  size={dimensions.iconSize}
                  color="#000000"
                />
              </View>
              <Text style={[styles.selectedText, { fontSize: dimensions.fontSize }]}>
                {selectedOption.name}
              </Text>
            </View>
          ) : (
            <Text style={[styles.placeholderText, { fontSize: dimensions.fontSize }]}>
              {placeholder}
            </Text>
          )}
          <Ionicons
            name={isVisible ? "chevron-up" : "chevron-down"}
            size={20}
            color="#666666"
          />
        </View>
      </TouchableOpacity>

      {/* Options Modal */}
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={handleClose}
          />
          <View style={[
            styles.modalContent,
            { marginHorizontal: dimensions.modalPadding }
          ]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Service</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            {/* Options List */}
            <FlatList
              data={options}
              renderItem={renderServiceItem}
              keyExtractor={(item) => item.id}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
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
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedText: {
    color: '#000000',
    fontWeight: '500',
    flex: 1,
  },
  placeholderText: {
    color: '#999999',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  selectedOption: {
    backgroundColor: '#000000',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedOptionIcon: {
    backgroundColor: '#333333',
  },
  optionText: {
    flex: 1,
    marginRight: 12,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  selectedOptionDescription: {
    color: '#CCCCCC',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 20,
  },
});

// Add display name for debugging
ServiceDropdown.displayName = 'ServiceDropdown';

export default ServiceDropdown;