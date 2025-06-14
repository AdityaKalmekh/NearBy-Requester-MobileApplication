import { useCallback, useState } from "react";

interface BaseRequestConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    credentials?: RequestCredentials;
}

interface GetRequestConfig extends BaseRequestConfig {
    method: 'GET'
}

interface JsonRequestConfig<T> extends BaseRequestConfig {
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: T;
}

type RequestConfig<T> = GetRequestConfig | JsonRequestConfig<T>;

interface HttpResponse<T> {
    error: Error | null;
    isLoading: boolean;
    sendRequest: <D>(
        config: RequestConfig<D>, 
        applyData: (data: T) => void,
        handleError?: (error: Error) => void,
    ) => Promise<void>;
    clearError: () => void;
}

const useHttp = <T>(): HttpResponse<T> => {
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const clearError = useCallback(() => {
        setError(null);
    },[])

    const sendRequest = useCallback(async <D>(
        requestConfig: RequestConfig<D>,
        applyData: (data: T) => void,
        handleError?: (error: Error) => void
    ) => {
        console.log("Request config data --------> ", requestConfig);
        console.log('Base URL ------------> ', process.env.EXPO_PUBLIC_BACKEND_BASE_URL);
        setIsLoading(true);
        setError(null);

        try {
            const requestOptions: RequestInit = {
                method: requestConfig.method,
                credentials: 'include',
                headers: {
                    ...(!(requestConfig.method === 'GET') &&
                        !('data' in requestConfig && requestConfig.data instanceof FormData) && {
                        'Content-Type': 'application/json',
                    }),
                    'Accept': 'application/json',
                    ...requestConfig.headers,
                },
                mode: 'cors'
            };

            // Add body for non-GET requests
            if ('data' in requestConfig) {
                requestOptions.body = requestConfig.data instanceof FormData
                    ? requestConfig.data
                    : JSON.stringify(requestConfig.data);
            }

            console.log(`Combine both url's ${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/${requestConfig.url}`);
            
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}${requestConfig.url}`, requestOptions);
            const responseData = await response.json();
            
            if (!response.ok) {
                // throw new Error(`Request failed with status ${response.status}`);
                const errorMessage = responseData.message || responseData.error || 'Something went wrong';
                throw new Error(errorMessage);
            }

            applyData(responseData);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Something went wrong')
            setError(error);

            if (handleError) {
                handleError(error);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        error,
        isLoading,
        sendRequest,
        clearError
    };
};

export default useHttp;