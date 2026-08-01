import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if unauthenticated on protected route
      if (!window.location.pathname.startsWith('/login') && 
          !window.location.pathname.startsWith('/register') && 
          !window.location.pathname.startsWith('/share')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
