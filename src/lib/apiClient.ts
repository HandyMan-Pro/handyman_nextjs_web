import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://handyman-backend-cnxa.onrender.com/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor — attach auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — normalize errors from Render.com cold-start timeouts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return Promise.reject(new Error('Server is waking up — please retry in a moment.'));
    }
    if (!error.response) {
      return Promise.reject(new Error('Network error — please check your connection.'));
    }
    return Promise.reject(error);
  }
);
