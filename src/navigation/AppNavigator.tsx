import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import AuthNavigator from './AuthNavigator';
import ServiceRequestScreen from '../screens/service/ServiceRequestScreen';
import ServiceSubcategoryScreen from '../screens/service/ServiceSubcategoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Import types
import { RootStackParamList } from './types';

// Import auth hook 
import { useAuthStatus } from '../hooks/useAuth';

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Main tab navigator (will be expanded later)
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          // else if (route.name === 'Services') {
          //   iconName = focused ? 'construct' : 'construct-outline';
          // } else if (route.name === 'Requests') {
          //   iconName = focused ? 'list' : 'list-outline';
          // }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          // backgroundColor: '#ffffff',
          // borderTopWidth: 1,
          // borderTopColor: '#e0e0e0',
          // paddingBottom: 5,
          // paddingTop: 5,
          // height: 60,
          display: 'none'
        }
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      {/* Additional tab screens will be added here as you develop */}
    </Tab.Navigator>
  );
};

// Root stack navigator
const AppNavigator = () => {
  const { isAuthenticated } = useAuthStatus();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // User is authenticated, show main app
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          {/* Service Request Screen - Can show dropdown OR location/availability */}
          <Stack.Screen
            name="ServiceRequest"
            component={ServiceRequestScreen}
            options={{
              presentation: 'card',
              animationTypeForReplace: 'push'
            }}
          />
          {/* Service Subcategory Screen - Subcategory selection */}
          <Stack.Screen
            name="ServiceSubcategory"
            component={ServiceSubcategoryScreen}
            options={{
              presentation: 'card',
              animationTypeForReplace: 'push',
            }}
          />

          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              presentation: 'card',
              animationTypeForReplace: 'push',
            }}
          />
        </>
      ) : (
        // User is not authenticated, show auth flow
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
      {/* Other main stack screens can be added here */}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  // Removed loadingContainer style as it's no longer needed
});

export default AppNavigator;