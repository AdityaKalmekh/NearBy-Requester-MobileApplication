import React, { forwardRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInputProps
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IndiaFlag from '../images/IndianFlag';

interface PhoneInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

const PhoneInput = forwardRef<TextInput, PhoneInputProps>(
  ({ value, onChangeText, onClear, ...props }, ref) => {
    return (
      <View style={styles.container}>
        <View style={styles.countryCodeContainer}>
          <IndiaFlag />
          <Text style={styles.countryCode}>+91</Text>
          {/* <Ionicons name="chevron-down" size={16} color="#888" style={styles.dropdownIcon} /> */}
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            ref={ref}
            style={styles.input}
            placeholder="Phone number"
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChangeText}
            maxLength={10}
            placeholderTextColor="#999999"
            {...props}
          />
          {value.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={onClear}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#0080FF',
    paddingBottom: 0, 
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12, 
    height: 40, 
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginLeft: 8, 
  },
  dropdownIcon: {
    marginLeft: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000',
    padding: 0,
    paddingBottom: 2,
  },
  clearButton: {
    padding: 4, 
    alignSelf: 'center', 
  },
});

export default PhoneInput;
