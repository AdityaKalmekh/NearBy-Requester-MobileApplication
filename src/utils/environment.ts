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

  // Add debugging
  console.log('=== ENVIRONMENT DEBUG ===');
  console.log('EAS Channel:', channel);
  console.log('Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
  console.log('APP_ENV from process.env:', process.env.APP_ENV);
  console.log('========================');

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

  console.log('Selected Environment:', channel);
  console.log('Backend URL:', urls.backendUrl);
  console.log('========================');

  return {
    name: channel,
    backendUrl: urls.backendUrl,
    isDevelopment: channel === 'development',
    isProduction: channel === 'production',
  };
};

export default getEnvironment();