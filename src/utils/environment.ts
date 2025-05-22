// Alternative approach in environment.ts
import Constants from 'expo-constants';

interface Environment {
    name: string;
    backendUrl: string;
    isDevelopment: boolean;
    isProduction: boolean;
}

// Get environment from EAS build profile
const getEnvironment = (): Environment => {
  const channel = Constants.expoConfig?.extra?.eas?.channel || 'development';
  
  // Define URLs for different environments
  const envUrls = {
    development: {
      backendUrl: 'http://192.168.29.178:5000/nearBy',
    },
    preview: {
      backendUrl: 'https://nearby-backend-ougv.onrender.com/nearBy',
    },
    production: {
      backendUrl: 'https://nearby-backend-ougv.onrender.com/nearBy',
    }
  };
  
  const urls = envUrls[channel as keyof typeof envUrls] || envUrls.development;
  
  return {
    name: channel,
    backendUrl: urls.backendUrl,
    isDevelopment: channel === 'development',
    isProduction: channel === 'production',
  };
};

export default getEnvironment();