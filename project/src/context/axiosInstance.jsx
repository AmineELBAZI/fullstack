import axios from 'axios';

// Create axios instance with base URL (you can override baseURL in your API files)
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8081/api', // default base URL, can be overridden
});

// Add request interceptor to add Basic Auth header
axiosInstance.interceptors.request.use(config => {
  const userStr = localStorage.getItem('user');
  const password = localStorage.getItem('password'); // you must save password on login

  if (userStr && password) {
    const user = JSON.parse(userStr);
    const token = btoa(`${user.email}:${password}`);
    config.headers.Authorization = `Basic ${token}`;
  }

  return config;
}, error => Promise.reject(error));

export default axiosInstance;
