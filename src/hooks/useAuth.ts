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

export default useAuth;