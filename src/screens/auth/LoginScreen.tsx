import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthStackParamList, RootStackScreenProps } from '../../navigation/types';
import PhoneInput from '../../components/auth/PhoneInput';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import useAuth from '../../hooks/useAuth';
import { StackNavigationProp } from '@react-navigation/stack';

type LoginScreenProps = RootStackScreenProps<'Auth'>;
type OTPResponse = {
  success: boolean;
  message: string;
  requestId?: string;
};

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const inputRef = useRef<TextInput>(null);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const windowHeight = Dimensions.get('window').height;
  const insets = useSafeAreaInsets();

  // Use auth context
  const { authState, initiateOTP, clearError } = useAuth();

  // Clear any existing errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Auto-dismiss keyboard when 10 digits are entered
  useEffect(() => {
    if (phoneNumber.length === 10) {
      // Add a small delay to ensure the last digit is properly entered
      const timer = setTimeout(() => {
        Keyboard.dismiss(); // Hide keyboard
        inputRef.current?.blur(); // Remove focus (cursor disappears)
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [phoneNumber]);

  const handleClearInput = () => {
    setPhoneNumber('');
    inputRef.current?.focus();
  };

  const handleNext = async () => {
    // Basic validation
    if (phoneNumber.length < 10) {
      // You can add a proper validation message here
      return;
    }

    clearError();
    try {
      // Use the auth context to initiate OTP
      const response = await initiateOTP({
        phoneNo: phoneNumber,
        authType: 'PhoneNo',
        role: 'requester'
      });

      // If we reached here, the request was successful
      if (response && response.success) {
        // Navigate to OTP screen with phone number and requestId (if your API returns one)
        console.log("Login OTP Response --------> ", response);
        navigation.navigate('OTP', {
          phoneNo: phoneNumber,
          requesterId: response.user.userId,
          isNewUser: response.user.isNewUser
        });
      } else {
        // Handle case where API returned success: false
        Alert.alert('Error', response?.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      // Error handling is managed by the auth context
      console.error('Failed to send OTP:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP. Please try again.';
      Alert.alert('Error', errorMessage);      
    } 
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidView}
        >
          <View style={[
            styles.contentContainer, 
            { 
              minHeight: windowHeight * 0.7,
              paddingBottom: phoneNumber.length === 10 ? 120 : 40 // More space when button is visible
            }
          ]}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Enter Phone number for verification</Text>
              <Text style={styles.subtitle}>
                This number will be used for all ride-related communication. You shall receive an SMS with code for verification.
              </Text>
            </View>

            <PhoneInput
              ref={inputRef}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              onClear={handleClearInput}
              autoFocus
            />

            {authState.error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{authState.error}</Text>
              </View>
            )}
          </View>

          {/* Next Button - Only visible when 10 digits are entered */}
          {phoneNumber.length === 10 && (
            <View style={styles.buttonContainer}>
              <Button
                title="Next"
                onPress={handleNext}
                style={styles.nextButton}
              />
            </View>
          )}
        </KeyboardAvoidingView>

        <Loading
          visible={authState.isLoading}
          backgroundColor="rgba(255, 255, 255, 0.75)"
          dotColor="#000000"
          size="small"
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  titleContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20, // Fixed bottom padding for consistent spacing across all devices
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    borderRadius: 8,
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    fontWeight: '500',
  }
});

export default LoginScreen;