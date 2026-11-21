import axios from 'axios';

// Base API URL from environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s timeout
});

// Interceptor for responses: return data directly, handle errors gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // We reject with the error so consumers can handle with parseApiError
    return Promise.reject(error);
  }
);

export default apiClient;
