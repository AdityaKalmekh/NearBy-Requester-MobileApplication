import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Dimensions,
  KeyboardType,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Keyboard
} from 'react-native';

interface OTPInputProps {
  code: string[];
  setCode: React.Dispatch<React.SetStateAction<string[]>>;
  maxLength: number;
  keyboardType?: KeyboardType;
  autoFocus?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  code,
  setCode,
  maxLength,
  keyboardType = 'number-pad',
  autoFocus = true
}) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [focusedInput, setFocusedInput] = useState<number | null>(0);

  // When all digits are filled, blur all inputs
  useEffect(() => {
    if (code.every(digit => digit !== '') && focusedInput !== null) {
      // All boxes are filled
      Keyboard.dismiss(); // Hide the keyboard
      inputRefs.current[focusedInput]?.blur(); // Remove focus from current input
      setFocusedInput(null); // Clear the focused state
    }
  }, [code, focusedInput]);

  useEffect(() => {
    // Initialize refs array
    inputRefs.current = inputRefs.current.slice(0, maxLength);
  }, [maxLength]);

  const handleChange = (text: string, index: number) => {
    // Only allow numeric input for number-pad keyboard type
    if (keyboardType === 'number-pad' && !/^\d*$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text.slice(0, 1); // Limit to single character
    setCode(newCode);

    // Auto-focus to next input if current field is filled
    if (text.length === 1 && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedInput(index + 1);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    // Handle backspace - move to previous input if current is empty
    if (e.nativeEvent.key === 'Backspace' && index > 0 && code[index] === '') {
      inputRefs.current[index - 1]?.focus();
      setFocusedInput(index - 1);
    }
  };

  const handleFocus = (index: number) => {
    setFocusedInput(index);
    
    // When an input is focused, we'll clear it if the user clicks on it
    if (code[index]) {
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
    }
  };

  return (
    <View style={styles.container}>
      {Array(maxLength)
        .fill(0)
        .map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputRefs.current[index] = ref;
            }}
            style={[
              styles.input,
              code[index] ? styles.inputFilled : {},
              focusedInput === index ? styles.inputActive : {}
            ]}
            value={code[index]}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => handleFocus(index)}
            onBlur={() => {
              // Only clear focus if not all inputs are filled
              if (!code.every(digit => digit !== '')) {
                setFocusedInput(null);
              }
            }}
            keyboardType={keyboardType}
            maxLength={1}
            autoFocus={index === 0}
            textContentType="oneTimeCode" // iOS autofill support
            selectionColor="#000"
          />
        ))}
    </View>
  );
};

const { width } = Dimensions.get('window');
// Make boxes smaller by adjusting the width calculation
const inputWidth = Math.min((width - 100) / 4 - 10, 55); 

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  input: {
    width: inputWidth,
    height: inputWidth,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  inputActive: {
    borderColor: '#000', // Black border for active input
  },
  inputFilled: {
    borderColor: '#DDD',
  },
});

export default OTPInput;