import React, { useState, useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
// import { Provider } from 'react-redux';
// import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashStyle from './src/components/common/SplashStyle';
import * as SplashScreen from 'expo-splash-screen';
import Environment from './src/utils/environment';
import 'react-native-gesture-handler';

// Keep native splash screen visible until we're ready
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  if (__DEV__) { 
    console.log('Environment:', Environment);
  }
  useEffect(() => {
    async function prepare() {
      try {
        // Load any resources, check authentication state, pre-load data
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error during app initialization:', e);
      } finally {
        setIsAppReady(true);
      }
    }

    prepare();
  }, []);

  const onSplashAnimationComplete = () => {
    setIsSplashComplete(true);
  };

  if (!isAppReady) {
    return null;
  }

  return (
    // <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#000000" 
          translucent={false} 
        />
        <View style={{ flex: 1 }}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
          
          {!isSplashComplete && (
            <SplashStyle onAnimationComplete={onSplashAnimationComplete} />
          )}
        </View>
      </SafeAreaProvider>
    // </Provider>
  );
}