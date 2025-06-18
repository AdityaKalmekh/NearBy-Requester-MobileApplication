declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_ENV?: 'development' | 'preview' | 'production';
      EXPO_PUBLIC_APP_ENV?: 'development' | 'preview' | 'production';
      EXPO_PUBLIC_BACKEND_BASE_URL?: string;
    }
  }
}

declare module '@env' {
  export const APP_ENV: 'development' | 'preview' | 'production';
  export const EXPO_PUBLIC_APP_ENV: 'development' | 'preview' | 'production';
  export const EXPO_PUBLIC_BACKEND_BASE_URL: string;
}