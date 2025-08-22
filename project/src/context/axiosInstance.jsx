import axios from 'axios';

// Use VITE_BASE_URL from environment variables or fallback to localhost
const BASE_URL = import.meta.env.VITE_BASE_URL  ;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // if you need cookies/session support
});

// Add request interceptor to add Basic Auth header
axiosInstance.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    const password = localStorage.getItem('password'); // Make sure you save this securely on login!

    if (userStr && password) {
      const user = JSON.parse(userStr);
      const token = btoa(`${user.email}:${password}`);
      config.headers.Authorization = `Basic ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
