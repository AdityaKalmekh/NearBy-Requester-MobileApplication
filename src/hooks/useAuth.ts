import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { AuthContextType } from '../types/auth';

/**
 * Custom hook to access auth context
 * Provides authentication state and actions throughout the app
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Make sure to wrap your app or component tree with <AuthProvider>.'
    );
  }
  
  return context;
};

/**
 * Hook to get just the authentication status
 * Useful for components that only need to know if user is logged in
 */
export const useAuthStatus = () => {
  const { authState } = useAuth();
  
  return {
    isAuthenticated: authState.isAuthenticated,
    // isLoading: authState.isLoading,
    isInitializing: authState.isInitializing,
    user: authState.user,
  };
};

/**
 * Hook to get auth token with automatic refresh
 * Automatically attempts to refresh expired tokens
 */
// export const useAuthToken = () => {
//   const { getAuthToken, refreshAuthToken, isTokenExpired, authState } = useAuth();
  
//   const getValidToken = async (): Promise<string | null> => {
//     // If no token exists, return null
//     if (!authState.tokens) {
//       return null;
//     }
    
//     // If token is not expired, return it
//     if (!isTokenExpired()) {
//       return getAuthToken();
//     }
    
//     // Try to refresh the token
//     const refreshSuccess = await refreshAuthToken();
    
//     if (refreshSuccess) {
//       return getAuthToken();
//     }
    
//     // If refresh failed, return null
//     return null;
//   };
  
//   return {
//     getValidToken,
//     getAuthToken,
//     isTokenExpired,
//     hasToken: !!authState.tokens,
//   };
// };

export default useAuth;