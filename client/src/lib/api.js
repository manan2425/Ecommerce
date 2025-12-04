import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api`,
  withCredentials: true,
});

// Response interceptor to handle 401 (Unauthorized) errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, redirect to login
    if (error?.response?.status === 401) {
      const isCheckAuth = error.config?.url?.includes('/auth/check-auth');
      const isAuthPage = window.location.pathname.includes('/auth/login') || window.location.pathname.includes('/auth/register');

      if (!isCheckAuth && !isAuthPage) {
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
