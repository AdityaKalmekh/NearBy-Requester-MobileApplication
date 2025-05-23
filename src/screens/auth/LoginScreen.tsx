import React, { useState, useRef } from 'react';
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
import { RootStackScreenProps } from '../../navigation/types';
import PhoneInput from '../../components/auth/PhoneInput';
import Button from '../../components/common/Button';
import useHttp from '../../hooks/useHttp';

type LoginScreenProps = RootStackScreenProps<'Auth'>;
type OTPResponse = {
  success: boolean;
  message: string;
  requestId?: string;
};

const LoginScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<TextInput>(null);
  const navigation = useNavigation<LoginScreenProps['navigation']>();
  const windowHeight = Dimensions.get('window').height;

  const { sendRequest, error, clearError } = useHttp<OTPResponse>();
  const handleClearInput = () => {
    setPhoneNumber('');
    inputRef.current?.focus();
  };

  const handleNext = async () => {
    console.log("Handle Next is called");
    
    // Basic validation
    if (phoneNumber.length < 10) {
      // You can add a proper validation message here
      return;
    }

    clearError();
    setIsLoading(true);
    try {
      const requestConfig = {
        url: '/auth/initiate',
        method: 'POST' as 'POST',
        data: {
          phoneNo: phoneNumber,
          authType: 'PhoneNo',
          role: 'requester'
        }
      };

      // console.log(`Server URL -> ${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}${requestConfig.url}`);
      
      // const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}${requestConfig.url}`, {
      //   method: 'POST',
      //   credentials: 'include',
      //   headers: {
      //     'Accept': 'application/json',
      //     'Content-Type': 'application/json',
      //     'Origin': 'http://localhost:19000',
      //     'Access-Control-Request-Method': 'POST',
      //     'Access-Control-Request-Headers': 'Content-Type,Accept'
      //   },
      //   body: JSON.stringify(requestConfig.data)
      // })
      // console.log('Response ---------> ', response);
      // Send the OTP request using the useHttp hook
      const responseData = await sendRequest(
        requestConfig,
        // Success callback
        (data) => {
          // You can perform additional actions with the data here if needed
          console.log('OTP sent successfully', data);
        },
        // Error callback
        (err) => {
          console.error('Failed to send OTP:', err);
          Alert.alert('Error', err.message || 'Failed to send OTP. Please try again.');
        }
      );

      // If we reached here, the request was successful
      if (responseData && responseData.success) {
        // Navigate to OTP screen with phone number and requestId (if your API returns one)
        navigation.navigate('OTP', {
          phoneNumber,
          requestId: responseData.requestId
        });
      } else {
        // Handle case where API returned success: false
        Alert.alert('Error', responseData?.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      // This will catch any errors not handled by the error callback
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }

    // Navigate to OTP screen with phone number
    // navigation.navigate('OTP', { phoneNumber });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidView}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={[styles.contentContainer, { minHeight: windowHeight * 0.7 }]}>
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
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Next"
              onPress={handleNext}
              disabled={phoneNumber.length < 10}
              style={styles.nextButton}
            />
          </View>
        </KeyboardAvoidingView>
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    height: 56,
    justifyContent: 'center',
  },
  backButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
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
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  nextButton: {
    borderRadius: 8, // Slightly more rounded corners
  },
});

export default LoginScreen;