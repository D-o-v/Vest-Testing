import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Token getter function to avoid circular dependency
let getToken: (() => string | null) | null = null;
let dispatchLogout: (() => void) | null = null;

// Function to set the token getter (called from store setup)
export const setTokenGetter = (getter: () => string | null) => {
  getToken = getter;
};

export const setLogoutDispatcher = (dispatcher: () => void) => {
  dispatchLogout = dispatcher;
};

// Create and configure axios instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Add request interceptor for auth token
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from the getter function
    const token = getToken?.();

    // Add token to headers if it exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // Handle 401 errors
    if (error.response?.status === 401) {
      // Dispatch logout if dispatcher is available
      dispatchLogout?.();
    }

    throw error;
  }
);

export default instance;