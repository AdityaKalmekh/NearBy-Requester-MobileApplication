import React, { createContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import useHttp from '../hooks/useHttp';
import {
  AuthState,
  AuthContextType,
  LoginCredentials,
  OTPInitiationData,
  OTPInitiationResponse,
  LoginResponse,
  User,
  RefreshTokenRequest,
  RefreshTokenResponse,
  AuthTokens,
  UserDetailsUpdate,
  UserDetailsResponse
} from '../types/auth';

// Action types for the auth reducer
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: AuthTokens }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER_DETAILS'; payload: { firstName: string; lastName: string } };

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitializing: true,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_INITIALIZING':
      return { ...state, isInitializing: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        tokens: action.payload,
        error: null,
      };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'UPDATE_USER_DETAILS':
       if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          fullName: `${action.payload.firstName} ${action.payload.lastName}`,
        },
      };

    default:
      return state;
  }
};

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  USER: 'user_data',
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  SESSION_ID: 'session_id',
  EXPIRES_AT: 'token_expires_at',
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);
  const { sendRequest } = useHttp<OTPInitiationResponse | LoginResponse | UserDetailsResponse>();

  // Utility function to store auth data securely
  const storeAuthData = async (user: User, tokens: AuthTokens): Promise<void> => {
    try {
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user)),
        SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, tokens.authToken),
        SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
        SecureStore.setItemAsync(STORAGE_KEYS.SESSION_ID, tokens.sessionId),
        SecureStore.setItemAsync(STORAGE_KEYS.EXPIRES_AT, tokens.expiresAt.toString())
      ]);
      console.log('Auth data stored successfully');
    } catch (error) {
      console.error('Failed to store auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  };

  // Utility function to clear stored auth data
  const clearStoredAuthData = async (): Promise<void> => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER),
        SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION_ID),
        SecureStore.deleteItemAsync(STORAGE_KEYS.EXPIRES_AT),
      ]);
      console.log('Auth data cleared successfully');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  };

  // Utility function to load stored auth data
  const loadStoredAuthData = async (): Promise<{ user: User; tokens: AuthTokens } | null> => {
    try {
      const [userJson, authToken, refreshToken, sessionId, expiresAtStr] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.USER),
        SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.SESSION_ID),
        SecureStore.getItemAsync(STORAGE_KEYS.EXPIRES_AT),
      ]);

      if (!userJson || !authToken || !refreshToken || !sessionId || !expiresAtStr) {
        return null;
      }

      let user: User;
      let expiresAt: number;

      try {
        user = JSON.parse(userJson);
        expiresAt = parseInt(expiresAtStr, 10);

        if (isNaN(expiresAt)) {
          throw new Error('Invalid expiration time');
        }
      } catch (parseError) {
        console.error('Failed to parse stored auth data:', parseError);
        await clearStoredAuthData(); // Clear corrupted data
        return null;
      }

      const tokens: AuthTokens = {
        authToken,
        refreshToken,
        sessionId,
        expiresAt
      };
      return { user, tokens };
    } catch (error) {
      console.error('Failed to load stored auth data:', error);
      await clearStoredAuthData();
      return null;
    }
  };

  // Check if token is expired
  const isTokenExpired = useCallback((): boolean => {
    if (!authState.tokens) return true;

    const now = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    return now >= (authState.tokens.expiresAt - bufferTime);
  }, [authState.tokens]);

  // Get current auth token
  const getAuthToken = useCallback((): string | null => {
    if (!authState.tokens || isTokenExpired()) {
      return null;
    }
    return authState.tokens.authToken;
  }, [authState.tokens, isTokenExpired]);

  // Initialize auth state from stored data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAuthData = await loadStoredAuthData();

        if (storedAuthData) {
          const { user, tokens } = storedAuthData;

          // Check if token is expired
          if (Date.now() < tokens.expiresAt) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, tokens },
            });
          } else {
            // Token expired, try to refresh or clear data
            await clearStoredAuthData();
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        await clearStoredAuthData();
      } finally {
        dispatch({ type: 'SET_INITIALIZING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Initiate OTP
  const initiateOTP = useCallback(async (data: OTPInitiationData): Promise<OTPInitiationResponse> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
   
    try {
      const response = await sendRequest(
        {
          url: '/auth/initiate',
          method: 'POST',
          data,
        }
      );

      if (!response) {
        throw new Error('No response received from server');
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      console.log('OTP initiation response:', response);
      return response as OTPInitiationResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      console.error('Initiate OTP failed:', errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [sendRequest]);

  // Verify OTP and login
  const verifyOTP = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await sendRequest(
        {
          url: '/auth/verify',
          method: 'POST',
          data: {
            // phoneNo: credentials.phoneNumber,
            otp: credentials.otp,
            userId: credentials.requestId,
            isNewUser: credentials.isNewUser,
            role: 1,
            authType: 'PhoneNo'
          },
        }
      );

      if (!response) {
        throw new Error('No response received from server');
      }

      // console.log("Response ==============> ", response);
      const loginResponse = response as LoginResponse;
      // console.log("Login Response ===============> ", loginResponse);

      if (!loginResponse.success) {
        throw new Error(loginResponse.message || 'Login failed');
      }

      // Calculate token expiration time
      const expiresAt = Date.now() + (60 * 60 * 1000);

      const tokens: AuthTokens = {
        authToken: loginResponse.authToken,
        refreshToken: loginResponse.refreshToken,
        sessionId: loginResponse.session_id,
        expiresAt,
      };

      const userWithPhone = {
        ...loginResponse.user,
        phoneNo: credentials.phoneNo
      }
      // Store auth data
      await storeAuthData(userWithPhone, tokens);

      // Update state
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: userWithPhone,
          tokens,
        },
      });
      console.log('Login successful for user:', loginResponse.user.phoneNo);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [sendRequest]);

  const updateUserDetails = useCallback(async (details: UserDetailsUpdate): Promise<boolean> => {
    try {
      const response = await sendRequest({
        url: '/details',
        method: 'PATCH',
        data: details,
        requireAuth: true,
      });

      if (response && response.success) {
      
        dispatch({
          type: 'UPDATE_USER_DETAILS',
          payload: {
            firstName: details.firstName,
            lastName: details.lastName,
          },
        });

        // Also update stored user data
        if (authState.tokens) {
          const updatedUser = {
            ...authState.user,
            firstName: details.firstName,
            lastName: details.lastName,
            fullName : `${details.firstName} ${details.lastName}`,
          };

          try {
            await SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser));
          } catch (error) {
            console.error('Failed to update stored user data:', error);
          }
        }

        console.log('User details updated successfully');
        return true;
      } else {
        console.error('Failed to update user details:', response?.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating user details:', error);
      return false;
    }
  }, [authState.user, authState.tokens, sendRequest]);


  // Logout
  const logout = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Optionally call logout endpoint on server
      if (authState.tokens?.authToken) {
        await sendRequest(
          {
            url: '/auth/logout',
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authState.tokens.authToken}`,
            },
          }
        );
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear stored data and update state
      await clearStoredAuthData();
      dispatch({ type: 'LOGOUT' });
    }
  }, [authState.tokens, sendRequest]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const contextValue: AuthContextType = {
    authState,
    initiateOTP,
    verifyOTP,
    logout,
    // refreshAuthToken,
    clearError,
    isTokenExpired,
    getAuthToken,
    updateUserDetails
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};