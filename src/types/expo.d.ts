import { ExpoConfig } from 'expo/config';

// Extended Expo config interface with custom properties
declare module 'expo-constants' {
  interface ExpoConfigExtra {
    eas?: {
      projectId?: string;
      channel?: string;
    };
    APP_ENV?: 'development' | 'preview' | 'production';
    [key: string]: any;
  }

  interface CustomExpoConfig extends ExpoConfig {
    extra?: ExpoConfigExtra;
  }
}

// Utility type for safe access to nested properties
export type SafeExpoConfig = {
  extra?: {
    eas?: {
      projectId?: string;
      channel?: string;
    };
    APP_ENV?: string;
    [key: string]: any;
  };
  updates?: {
    enabled?: boolean;
    checkAutomatically?: 'ON_ERROR_RECOVERY' | 'ON_LOAD' | 'WIFI_ONLY' | 'NEVER';
    fallbackToCacheTimeout?: number;
    url?: string;
    [key: string]: any;
  };
  version?: string;
  name?: string;
  [key: string]: any;
};