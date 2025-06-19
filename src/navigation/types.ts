import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Service option interface for navigation
export interface ServiceOption {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  color?: string;
  selectedSubcategories?: ServiceSubcategory[];
}

// Service subcategory interface
export interface ServiceSubcategory{
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  description?: string;
}

// Auth navigator types
export type AuthStackParamList = {
  Login: undefined;
  OTP: {
    phoneNo: string,
    requesterId: string,
    isNewUser: boolean
  };
  Signup: undefined;
};

// Main tab navigator types (will be expanded later)
export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
  ServiceRequest: {
    autoOpenServiceDropdown?: boolean;
    selectedService?: ServiceOption;
    preSelectedLocation?: string;
  };
  Services: undefined;
  Requests: undefined;
};

// Service flow navigator types (will be implemented later)
export type ServiceStackParamList = {
  ServiceRequests: undefined;
  ServiceType: undefined;
  Location: { serviceType: string };
  Request: { serviceType: string; location: string };
  Provider: { requestId: string };
};

// Root navigator types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Service: NavigatorScreenParams<ServiceStackParamList>;

  // Direct stack screens
  ServiceRequest: {
    autoOpenServiceDropdown?: boolean;
    selectedService?: ServiceOption;
    preSelectedLocation?: string;
  };

  // Subcategory screen
  ServiceSubcategory: {
    selectedService: ServiceOption;
    source?: 'home' | 'search'
  }

  Profile: undefined;
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;
export type ServiceRequestNavigationProp = StackNavigationProp<RootStackParamList, 'ServiceRequest'>;
export type ServiceSubcategoryNavigationProp = StackNavigationProp<RootStackParamList, 'ServiceSubcategory'>;
export type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

// Screen props for type safety throughout the app
export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: StackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = {
  navigation: StackNavigationProp<MainTabParamList, T>;
  route: RouteProp<MainTabParamList, T>;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = {
  navigation: StackNavigationProp<AuthStackParamList, T>;
  route: RouteProp<AuthStackParamList, T>;
};