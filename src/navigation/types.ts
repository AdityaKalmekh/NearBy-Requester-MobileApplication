import { NavigatorScreenParams } from '@react-navigation/native';

// Auth navigator types
export type AuthStackParamList = {
  Login: undefined;
  OTP: { phoneNumber: string };
  Signup: undefined;
};

// Main tab navigator types (will be expanded later)
export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
};

// Service flow navigator types (will be implemented later)
export type ServiceStackParamList = {
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
};

// Screen props for type safety throughout the app
export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: any;
  route: any;
};