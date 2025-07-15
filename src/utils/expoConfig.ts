import Constants from 'expo-constants';
import type { SafeExpoConfig } from '../types/expo';

// Safe access to Expo config with proper typing
export const getExpoConfig = (): SafeExpoConfig => {
  return Constants.expoConfig as SafeExpoConfig || {};
};

// Safe access to EAS channel
export const getEASChannel = (): string | undefined => {
  const config = getExpoConfig();
  return config.extra?.eas?.channel;
};

// Safe access to APP_ENV from extra
export const getAppEnvFromExtra = (): string | undefined => {
  const config = getExpoConfig();
  return config.extra?.APP_ENV;
};

// Safe access to updates URL
export const getUpdatesUrl = (): string | undefined => {
  const config = getExpoConfig();
  return config.updates?.url;
};

// Safe access to app version
export const getAppVersion = (): string | undefined => {
  const config = getExpoConfig();
  return config.version;
};

// Safe access to app name
export const getAppName = (): string | undefined => {
  const config = getExpoConfig();
  return config.name;
};

// Get all environment-related info
export const getEnvironmentInfo = () => {
  return {
    easChannel: getEASChannel(),
    appEnvFromExtra: getAppEnvFromExtra(),
    updatesUrl: getUpdatesUrl(),
    appVersion: getAppVersion(),
    appName: getAppName(),
    isDev: __DEV__,
    executionEnvironment: Constants.executionEnvironment,
    processAppEnv: process.env.APP_ENV,
    expoPublicAppEnv: process.env.EXPO_PUBLIC_APP_ENV,
  };
};