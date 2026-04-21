import axios from 'axios';

// Get API URL from environment variables
const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (apiUrl) {
    // Remove trailing slash if present
    return apiUrl.replace(/\/$/, '');
  }

  // If in production and no API URL set, assume same-origin (for Vercel monorepo)
  if (import.meta.env.PROD) {
    return ''; // Relative to current domain
  }

  // Fallback for development
  return 'http://localhost:5001';
};

const api = axios.create({
  baseURL: `${getApiUrl()}/api`,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Response interceptor to handle 401 (Unauthorized) errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, redirect to login
    if (error?.response?.status === 401) {
      const isCheckAuth = error.config?.url?.includes('/auth/check-auth');
      const isLogout = error.config?.url?.includes('/auth/logout');
      const isAuthPage = window.location.pathname.includes('/auth/login') || window.location.pathname.includes('/auth/register');

      if (!isCheckAuth && !isLogout && !isAuthPage) {
        // Clear any stored auth data
        localStorage.removeItem('token');
        sessionStorage.removeItem('auth');
        
        // Redirect to login without showing error
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
