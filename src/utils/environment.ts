import { getEnvironmentInfo } from './expoConfig';

// Define environment types
export type EnvironmentName = 'development' | 'preview' | 'production';

export interface Environment {
  name: EnvironmentName;
  backendUrl: string;
  googleMapsApiKey: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isPreview: boolean;
}

// Define environment configurations with strict typing
const environments: Record<EnvironmentName, Environment> = {
  development: {
    name: 'development',
    backendUrl: 'http://192.168.29.178:5000/nearBy',
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    isDevelopment: true,
    isProduction: false,
    isPreview: false,
  },
  preview: {
    name: 'preview',
    backendUrl: 'https://nearby-backend-ougv.onrender.com/nearBy',
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    isDevelopment: false,
    isProduction: false,
    isPreview: true,
  },
  production: {
    name: 'production',
    backendUrl: 'https://nearby-backend-ougv.onrender.com/nearBy',
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    isDevelopment: false,
    isProduction: true,
    isPreview: false,
  },
};

// Type guard to check if a string is a valid environment name
const isValidEnvironmentName = (env: string): env is EnvironmentName => {
  return env in environments;
};

// Get environment configuration with proper typing
const getEnvironment = (): Environment => {
  let appEnv: string;
  
  // Get environment info using safe utilities
  const envInfo = getEnvironmentInfo();
  
  // Check if we're in a built app (not development)
  if (!__DEV__) {
    // For built apps, get environment from build-time configuration
    appEnv = envInfo.easChannel || 
             envInfo.appEnvFromExtra ||
             envInfo.processAppEnv ||
             'production';
             
    console.log('🔥 Built App Environment Detection:');
    console.log('🔥 EAS Channel:', envInfo.easChannel);
    console.log('🔥 Extra APP_ENV:', envInfo.appEnvFromExtra);
    console.log('🔥 Process ENV:', envInfo.processAppEnv);
  } else {
    // For development, use manual switching or environment variable
    appEnv = envInfo.expoPublicAppEnv || 
             envInfo.processAppEnv || 
             'development';
             
    // MANUAL OVERRIDE FOR DEVELOPMENT TESTING
    // Uncomment the line below when you want to test different environments in development
    // appEnv = 'preview'; // <-- Uncomment this for preview testing in development
    
    // console.log('🔥 Development Environment Detection:');
    // console.log('🔥 EXPO_PUBLIC_APP_ENV:', envInfo.expoPublicAppEnv);
    // console.log('🔥 APP_ENV:', envInfo.processAppEnv);
  }

  // console.log('🔥 __DEV__ mode:', envInfo.isDev);
  // console.log('🔥 Selected Environment (raw):', appEnv);
  // console.log('🔥 Constants.executionEnvironment:', envInfo.executionEnvironment);

  // Validate and get environment configuration
  const validEnv: EnvironmentName = isValidEnvironmentName(appEnv) ? appEnv : 'development';
  const config: Environment = environments[validEnv];

  if (!config.googleMapsApiKey) {
    console.warn('⚠️ Google Places API key not configured. Location suggestions will use mock data.');
    console.warn('⚠️ Add EXPO_PUBLIC_GOOGLE_PLACES_API_KEY to your environment variables.');
  } else {
    console.log('✅ Google Places API key configured');
  }

  // console.log('🔥 Final Configuration:');
  // console.log('🔥 Environment Name:', config.name);
  // console.log('🔥 Backend URL:', config.backendUrl);
  // console.log('🔥 Is Development:', config.isDevelopment);
  // console.log('🔥 Is Production:', config.isProduction);
  // console.log('🔥 Is Preview:', config.isPreview);
  // console.log('========================');

  return config;      
};

// Export the environment instance
export default getEnvironment();

// Export the getter function for dynamic access if needed
export { getEnvironment };