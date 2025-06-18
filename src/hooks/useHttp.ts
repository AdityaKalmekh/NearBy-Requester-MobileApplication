import { useState, useCallback, useRef } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import Environment from '../utils/environment';
import * as SecureStore from 'expo-secure-store';

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: Environment.backendUrl,
  withCredentials: true, // Equivalent to credentials: 'include'
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

axiosInstance.interceptors.request.use(request => {
  console.log('🚀 API Request:', request.baseURL);
  console.log('📤 Request Headers:', request.method);
  console.log(' Targated URL: ', request.url);
  if (request.data) console.log('📦 Request Data:', request.data);
  return request;
});

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestConfig<T> extends Omit<AxiosRequestConfig, 'data' | 'method'> {
  url: string;
  method: HttpMethod;
  data?: T;
  requireAuth?: boolean;
}

interface HttpResponse<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  progress: number;
  sendRequest: <D>(
    config: RequestConfig<D>,
    applyData?: (data: T) => void,
    handleError?: (error: Error) => void,
  ) => Promise<T | undefined>;
  cancelRequest: () => void;
  clearError: () => void;
}

const getStoredAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('auth_token');
  } catch (error) {
    console.error('Failed to get stored auth token:', error);
    return null;
  }
};

const useHttp = <T>(): HttpResponse<T> => {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<T | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const cancelRequest = useCallback(() => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Request cancelled by user');
      cancelTokenRef.current = null;
    }
  }, []);

  const sendRequest = useCallback(async <D>(
    requestConfig: RequestConfig<D>,
    applyData?: (data: T) => void,
    handleError?: (error: Error) => void
  ): Promise<T | undefined> => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    // Create a new cancel token for this request
    cancelTokenRef.current = axios.CancelToken.source();

    // Create a properly typed headers object
    let axiosConfig: AxiosRequestConfig = {
      ...requestConfig,
      cancelToken: cancelTokenRef.current.token,
      headers: {
        ...requestConfig.headers,
        'X-Client-Type': 'mobile', 
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      },
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      }
    };

    try {
      // Auto-inject auth headers for protected routes
      if (requestConfig.requireAuth !== false && !requestConfig.url.includes('/auth/')) {
        const [authToken, refreshToken, sessionId] = await Promise.all([
          getStoredAuthToken(),
          SecureStore.getItemAsync('refresh_token'),
          SecureStore.getItemAsync('session_id')
        ]);

        if (authToken) {
          // If we have an auth token, send only the Authorization header
          axiosConfig.headers = {
            ...axiosConfig.headers,
            'X-Session-ID': sessionId,
            'Authorization': `Bearer ${authToken}`,
          };
        } else if (refreshToken) {
          axiosConfig.headers = {
            ...axiosConfig.headers,
            'X-Session-ID': sessionId,
            'X-Refresh-Token': refreshToken
          };
        }
      }

      // If sending FormData, remove the Content-Type header to let the browser set it
      if (requestConfig.data instanceof FormData) {
        axiosConfig.headers = {
          ...(requestConfig.headers || {}),
          'Content-Type': undefined // This will effectively remove the header
        };
      }

      const response: AxiosResponse<T> = await axiosInstance(axiosConfig);

      const responseData = response.data;
      setData(responseData);

      if (applyData) {
        applyData(responseData);
      }

      return responseData;
    } catch (err) {
      // Handle errors, including cancellation
      // Handle errors, including cancellation
      if (axios.isCancel(err)) {
        console.log('Request canceled:', err.message);
      } else if (axios.isAxiosError(err) && err.response?.status === 401) {
        // Handle 401 - Token expired or invalid
        console.log('Auth token expired or invalid, attempting refresh...');

        // Check if server provided a new auth token via middleware refresh
        const newAuthToken = err.response.headers['x-new-auth-token'] ||
          err.response.headers['X-New-Auth-Token'];

        if (newAuthToken && requestConfig.requireAuth !== false) {
          console.log('Server auto-refreshed token, retrying request...');

          // Store the new auth token
          try {
            await SecureStore.setItemAsync('auth_token', newAuthToken);
          } catch (storeError) {
            console.error('Failed to store new auth token:', storeError);
          }

          // Retry the request with new token
          try {
            const sessionId = await SecureStore.getItemAsync('session_id');

            const retryConfig: AxiosRequestConfig = {
              ...axiosConfig,
              headers: {
                ...axiosConfig.headers,
                'Authorization': `Bearer ${newAuthToken}`,
                'X-Session-ID': sessionId, // Always include sessionId
                // Remove refresh token for retry since we now have a valid auth token
                'X-Refresh-Token': undefined,
              }
            };

            const retryResponse: AxiosResponse<T> = await axiosInstance(retryConfig);
            const responseData = retryResponse.data;
            setData(responseData);

            if (applyData) {
              applyData(responseData);
            }

            setIsLoading(false);
            return responseData;
          } catch (retryError) {
            console.error('Retry request failed:', retryError);
            // Fall through to refresh attempt
          }
        }

        // If no new token in response, try to refresh manually
        if (requestConfig.requireAuth !== false && !requestConfig.url.includes('/auth/')) {
          try {
            const [refreshToken, sessionId] = await Promise.all([
              SecureStore.getItemAsync('refresh_token'),
              SecureStore.getItemAsync('session_id')
            ]);

            if (refreshToken && sessionId) {
              console.log('Retrying request with refresh token...');

              // Retry request with refresh token (no auth token)
              const refreshRetryConfig = {
                ...axiosConfig,
                headers: {
                  ...axiosConfig.headers,
                  'Authorization': undefined, // Remove expired auth token
                  'X-Refresh-Token': refreshToken,
                  'X-Session-ID': sessionId, // Always include sessionId
                }
              };

              const refreshResponse: AxiosResponse<T> = await axiosInstance(refreshRetryConfig);

              // Check if server provided new auth token
              const refreshedAuthToken = refreshResponse.headers['x-new-auth-token'] ||
                refreshResponse.headers['X-New-Auth-Token'];

              if (refreshedAuthToken) {
                await SecureStore.setItemAsync('auth_token', refreshedAuthToken);
                console.log('Token refreshed successfully via retry');
              }

              const responseData = refreshResponse.data;
              setData(responseData);

              if (applyData) {
                applyData(responseData);
              }

              setIsLoading(false);
              return responseData;
            }
          } catch (refreshRetryError) {
            console.error('Refresh retry failed:', refreshRetryError);
            // Fall through to logout
          }
        }

        // If all refresh attempts failed, clear stored tokens and logout
        console.log('All refresh attempts failed - clearing stored data');

        try {
          await Promise.all([
            SecureStore.deleteItemAsync('auth_token'),
            SecureStore.deleteItemAsync('refresh_token'),
            SecureStore.deleteItemAsync('session_id'),
            SecureStore.deleteItemAsync('user_data'),
            SecureStore.deleteItemAsync('token_expires_at'),
          ]);
        } catch (clearError) {
          console.error('Failed to clear tokens:', clearError);
        }

        // Create authentication error
        const error = new Error('Session expired. Please login again.');
        setError(error);

        if (handleError) {
          handleError(error);
        }
      } else {
        let errorMessage = 'Something went wrong';

        // Extract error message from axios error response if available
        if (axios.isAxiosError(err) && err.response?.data) {
          const responseData = err.response.data;
          errorMessage =
            (typeof responseData === 'object' && responseData !== null)
              ? (responseData.message || responseData.error || `Error ${err.response.status}: ${err.response.statusText}`)
              : `Error ${err.response.status}: ${err.response.statusText}`;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        const error = new Error(errorMessage);
        setError(error);

        if (handleError) {
          handleError(error);
        }
      }
    } finally {
      setIsLoading(false);
      cancelTokenRef.current = null;
    }
  }, []);

  return {
    data,
    error,
    isLoading,
    progress,
    sendRequest,
    cancelRequest,
    clearError
  };
};

axiosInstance.interceptors.request.use(
  (config) => {
    // You can add authentication headers here once the user is logged in
    // Example: const token = await AsyncStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common error scenarios
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors like 401 (Unauthorized)
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        // Handle token expiration, logout user, redirect to login, etc.
        // Example: store.dispatch(logout());
        console.log('Session expired. Please login again.');
      }
    }
    return Promise.reject(error);
  }
);

export default useHttp;