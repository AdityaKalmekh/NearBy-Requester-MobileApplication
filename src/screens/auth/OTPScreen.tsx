import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

// Import custom components
import OTPInput from '../../components/auth/OTPInput';

// Import types
import { AuthStackParamList } from '../../navigation/types';
import useAuth from '../../hooks/useAuth';

type OTPScreenRouteProp = RouteProp<AuthStackParamList, 'OTP'>;

const OTPScreen: React.FC = () => {
  const route = useRoute<OTPScreenRouteProp>();
  const { phoneNo, requesterId, isNewUser } = route.params;

  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [timer, setTimer] = useState<number>(120); // 2 minutes in seconds
  const [isButtonActive, setIsButtonActive] = useState<boolean>(false);
  const [isResendAvailable, setIsResendAvailable] = useState<boolean>(false);

  // Use auth context
  const { authState, verifyOTP, initiateOTP, clearError } = useAuth();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if all OTP digits are filled
    const isComplete = otp.every((digit) => digit !== '');
    setIsButtonActive(isComplete);
  }, [otp]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleLogin = async() => {
    const otpValue = otp.join('');
    
    // Clear any existing errors
    clearError();

    try {
      // Use the auth context to verify OTP
      const success = await verifyOTP({
        phoneNo,
        otp: otpValue,
        requestId: requesterId,
        isNewUser
      });

      if (success) {
        console.log('Login successful');
        // Navigation will be handled automatically by AppNavigator 
        // when authState.isAuthenticated becomes true
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP. Please try again.';
      Alert.alert('Verification Failed', errorMessage);
      
      // Clear OTP fields to allow retry
      setOtp(['', '', '', '']);
    }
  };

  const handleResendOtp = () => {
    // Reset OTP fields
    setOtp(['', '', '', '']);
    // Reset timer
    setTimer(120);

    // API call to resend OTP would go here
    console.log('Resending OTP to:', phoneNo);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.contentContainer}>
          <View style={styles.verificationContainer}>
            <Text style={styles.title}>Verification Code</Text>

            <Text style={styles.subtitle}>
              Please enter the 4-digit code sent on
            </Text>
            <Text style={styles.phoneNumber}>{phoneNo}</Text>

            <OTPInput
              code={otp}
              setCode={setOtp}
              maxLength={4}
              keyboardType="number-pad"
            />

            <Text style={styles.timer}>{formatTime(timer)}</Text>

            {timer === 0 && (
              <TouchableOpacity onPress={handleResendOtp}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.loginButton,
            isButtonActive ? styles.loginButtonActive : {}
          ]}
          disabled={!isButtonActive}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: windowHeight * 0.05, // Adjust based on screen height
  },
  verificationContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  timer: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 30,
    color: '#333',
  },
  resendText: {
    fontSize: 16,
    color: '#000',
    marginTop: 15,
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  loginButtonActive: {
    backgroundColor: '#000',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OTPScreen;