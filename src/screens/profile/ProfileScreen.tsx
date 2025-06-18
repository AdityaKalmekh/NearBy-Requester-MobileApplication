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
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Import custom components and hooks
import { useAuth } from '../../hooks/useAuth';
import { RootStackParamList } from '../../navigation/types';

// Types
type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface ProfileField {
  id: string;
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  editable: boolean;
  required?: boolean;
}

interface NameEditModalProps {
  visible: boolean;
  firstName: string;
  lastName: string;
  onClose: () => void;
  onSave: (firstName: string, lastName: string) => void;
  isLoading: boolean;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { authState, updateUserDetails } = useAuth();
  
  // State for name editing
  const [nameEditVisible, setNameEditVisible] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Get user details from auth state
  const getDisplayName = (): string => {
    if (authState.user?.firstName && authState.user?.lastName) {
      return `${authState.user.firstName} ${authState.user.lastName}`;
    }
    if (authState.user?.fullName) {
      return authState.user.fullName;
    }
    return 'User';
  };

  const getPhoneNumber = (): string => {
    return authState.user?.phoneNo || '+91 XXXXXXXXXX';
  };

  // Parse existing name into first and last name
  const parseExistingName = () => {
    if (authState.user?.firstName && authState.user?.lastName) {
      return {
        firstName: authState.user.firstName,
        lastName: authState.user.lastName
      };
    }
    
    // If we have a full name, try to split it
    const fullName = authState.user?.fullName || '';
    const nameParts = fullName.trim().split(' ');
    
    if (nameParts.length >= 2) {
      return {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ')
      };
    } else if (nameParts.length === 1) {
      return {
        firstName: nameParts[0],
        lastName: ''
      };
    }
    
    return {
      firstName: '',
      lastName: ''
    };
  };

  // Format member since date
  const getMemberSinceDate = (): string => {
    if (authState.user?.createdAt) {
      const date = new Date(authState.user.createdAt);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    }
    return 'Recently joined';
  };

  // Profile fields configuration
  const profileFields: ProfileField[] = [
    {
      id: 'name',
      label: 'Name',
      value: getDisplayName(),
      icon: 'person-outline',
      editable: true,
    },
    {
      id: 'phoneNumber',
      label: 'Phone Number',
      value: getPhoneNumber(),
      icon: 'call-outline',
      editable: false,
    },
    {
      id: 'email',
      label: 'Email',
      value: authState.user?.email || '',
      icon: 'mail-outline',
      editable: false, // Not editable as per requirements
    },
    {
      id: 'gender',
      label: 'Gender',
      value: (authState.user as any)?.gender || '',
      icon: 'man-outline',
      editable: false, // Not editable as per requirements
    },
    {
      id: 'dateOfBirth',
      label: 'Date of Birth',
      value: (authState.user as any)?.dateOfBirth || '',
      icon: 'calendar-outline',
      editable: false, // Not editable as per requirements
      required: true,
    },
    {
      id: 'memberSince',
      label: 'Member Since',
      value: getMemberSinceDate(),
      icon: 'star-outline',
      editable: false,
    },
    {
      id: 'emergencyContact',
      label: 'Emergency contact',
      value: (authState.user as any)?.emergencyContact || '',
      icon: 'flash-outline',
      editable: false, // Not editable as per requirements
      required: true,
    },
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleHelpPress = () => {
    Alert.alert('Help', 'Profile help information will be displayed here.');
  };

  const handleFieldPress = (field: ProfileField) => {
    if (!field.editable || field.id !== 'name') return;

    // Open name edit modal
    const { firstName: parsedFirstName, lastName: parsedLastName } = parseExistingName();
    setFirstName(parsedFirstName);
    setLastName(parsedLastName);
    setNameEditVisible(true);
  };

  const handleNameSave = async (newFirstName: string, newLastName: string) => {
    if (!newFirstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return;
    }

    if (!newLastName.trim()) {
      Alert.alert('Error', 'Last name is required');
      return;
    }

    if (!updateUserDetails) {
      Alert.alert('Error', 'Unable to update profile at this time');
      return;
    }

    setIsUpdating(true);

    try {
      console.log('Saving name details:', { firstName: newFirstName, lastName: newLastName });
      
      const success = await updateUserDetails({
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
      });

      if (success) {
        setNameEditVisible(false);
        Alert.alert('Success', 'Name updated successfully');
        console.log('Name updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update name. Please try again.');
      }
    } catch (error) {
      console.error('Name update error:', error);
      Alert.alert('Error', 'Failed to update name. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getFieldDisplayValue = (field: ProfileField): string => {
    if (!field.value && field.required) {
      return 'Required';
    }
    if (!field.value && field.id === 'emergencyContact') {
      return '';
    }
    return field.value || 'Not set';
  };

  const getFieldTextStyle = (field: ProfileField) => {
    if (!field.value && field.required) {
      return [styles.fieldValue, styles.requiredText];
    }
    if (!field.value) {
      return [styles.fieldValue, styles.emptyValue];
    }
    return styles.fieldValue;
  };

  const renderField = (field: ProfileField) => {
    const displayValue = getFieldDisplayValue(field);
    const showAddButton = field.id === 'emergencyContact' && !field.value;

    return (
      <TouchableOpacity
        key={field.id}
        style={styles.fieldContainer}
        onPress={() => handleFieldPress(field)}
        disabled={!field.editable}
        activeOpacity={field.editable ? 0.7 : 1}
      >
        <View style={styles.fieldContent}>
          <Ionicons
            name={field.icon}
            size={24}
            color="#666666"
            style={styles.fieldIcon}
          />
          <View style={styles.fieldTextContainer}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <Text style={getFieldTextStyle(field)}>
              {displayValue}
            </Text>
          </View>
          
          {/* Show appropriate action button */}
          {showAddButton ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleFieldPress(field)}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          ) : field.editable ? (
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#666666"
            />
          ) : null}
        </View>
        
        {/* Separator line */}
        <View style={styles.separator} />
      </TouchableOpacity>
    );
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
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={handleHelpPress}
          activeOpacity={0.7}
        >
          <View style={styles.helpContainer}>
            <Ionicons name="help-circle-outline" size={20} color="#666666" />
            <Text style={styles.helpText}>Help</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Profile Fields */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.fieldsContainer}>
          {profileFields.map(renderField)}
        </View>
      </ScrollView>

      {/* Name Edit Modal */}
      <NameEditModal
        visible={nameEditVisible}
        firstName={firstName}
        lastName={lastName}
        onClose={() => setNameEditVisible(false)}
        onSave={handleNameSave}
        isLoading={isUpdating}
      />
    </SafeAreaView>
  );
};

// Name Edit Modal Component
const NameEditModal: React.FC<NameEditModalProps> = ({
  visible,
  firstName: initialFirstName,
  lastName: initialLastName,
  onClose,
  onSave,
  isLoading
}) => {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);

  React.useEffect(() => {
    setFirstName(initialFirstName);
    setLastName(initialLastName);
  }, [initialFirstName, initialLastName]);

  const handleSave = () => {
    onSave(firstName, lastName);
  };

  const handleClose = () => {
    // Reset to initial values when closing
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Name</Text>
            <TouchableOpacity onPress={handleClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            {/* First Name Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="person-outline" size={20} color="#666666" />
              </View>
              <TextInput
                style={styles.modalInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Aditya"
                autoCapitalize="words"
                editable={!isLoading}
              />
              {firstName.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearInputButton}
                  onPress={() => setFirstName('')}
                >
                  <Ionicons name="close" size={16} color="#999999" />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Last Name Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="person-outline" size={20} color="#666666" />
              </View>
              <TextInput
                style={styles.modalInput}
                value={lastName}
                onChangeText={setLastName}
                placeholder="kalmekh"
                autoCapitalize="words"
                editable={!isLoading}
              />
              {lastName.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearInputButton}
                  onPress={() => setLastName('')}
                >
                  <Ionicons name="close" size={16} color="#999999" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.saveButton, { opacity: isLoading ? 0.7 : 1 }]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  helpButton: {
    padding: 8,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  helpText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  fieldsContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 1,
  },
  fieldContainer: {
    paddingHorizontal: 20,
  },
  fieldContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  fieldIcon: {
    marginRight: 16,
    width: 24,
  },
  fieldTextContainer: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 20,
  },
  requiredText: {
    color: '#FF6B6B',
    fontWeight: '500',
  },
  emptyValue: {
    color: '#999999',
    fontStyle: 'italic',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 56,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: '80%',
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
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    paddingVertical: 0,
  },
  clearInputButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalActions: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProfileScreen;