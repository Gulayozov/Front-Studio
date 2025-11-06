import type { RequestConfig } from '@umijs/max';
import { message } from 'antd';
import { tokenStorage } from '@/services/ant-design-pro/api';

// Error handling function
const errorHandler = (error: any) => {
  const { response } = error;
  
  if (response && response.status) {
    const { status, data } = response;
    
    if (status === 401) {
      // Token expired or invalid, clear token and redirect to login
      tokenStorage.remove();
      message.error('Login expired, please login again');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      message.error('No permission to access this resource');
    } else if (status === 404) {
      message.error('Requested resource not found');
    } else if (status >= 500) {
      message.error('Server internal error');
    } else {
      const errorMessage = data?.detail || `Request error ${status}`;
      message.error(errorMessage);
    }
  } else {
    message.error('Network error, please check your network connection');
  }

  throw error;
};

// Request configuration
export const requestConfig: RequestConfig = {
  // Base URL configuration (optional if you want to set a default)
  // baseURL: 'http://localhost:8000',
  
  timeout: 10000,
  
  // Request interceptor
  requestInterceptors: [
    (config: any) => {
      // Add authentication header if token exists
      const token = tokenStorage.get();
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        };
      }
      
      // Ensure Content-Type is set for POST requests
      if (config.method?.toLowerCase() === 'post' && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
      
      return config;
    },
  ],
  
  // Response interceptor
  responseInterceptors: [
    (response) => {
      return response;
    },
  ],
  
  // Error handler
  errorConfig: {
    errorHandler,
  },
};