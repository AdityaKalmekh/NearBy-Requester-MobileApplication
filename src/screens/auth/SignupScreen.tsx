import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SignupScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Signup Screen</Text>
      <Text style={styles.subText}>This is a placeholder for the signup functionality</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default SignupScreen;