import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>HomePage</Text>
        <Text style={styles.subtitle}>Welcome to NearBy</Text>
        <Text style={styles.description}>
          Find service providers near your location
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 16,
    color: '#333333',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default HomeScreen;