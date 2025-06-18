import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';

// Import the auth provider
import { AuthProvider } from './src/contexts/AuthContext';
import { useAuthStatus } from './src/hooks/useAuth';

// Import navigation and splash screen
import AppNavigator from './src/navigation/AppNavigator';
import SplashStyle from './src/components/common/SplashStyle';
import Loading from './src/components/common/Loading';

// Create a component that uses auth context inside the provider
const AppContent: React.FC = () => {
  const [splashComplete, setSplashComplete] = useState(false);
  const { isInitializing } = useAuthStatus();
  
  const handleSplashComplete = () => {
    console.log('Splash animation completed');
    setSplashComplete(true);
  };

  const appReady = splashComplete && !isInitializing;

  return (
    <>
      <NavigationContainer>
        {appReady && <AppNavigator />}
        <StatusBar style="auto" />
      </NavigationContainer>
      
      {/* Show splash screen until both splash and auth are ready */}
      {!appReady && (
        <>
          <SplashStyle onAnimationComplete={handleSplashComplete} />
          {/* Show subtle loading indicator if splash is done but auth is still loading */}
          {splashComplete && isInitializing && (
            <View style={styles.authLoadingContainer}>
              <Loading 
                visible={true} 
                size="small"
                backgroundColor="rgba(0, 0, 0, 0.3)"
                dotColor="#ffffff"
              />
            </View>
          )}
        </>
      )}
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  authLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});