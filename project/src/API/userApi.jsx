import axiosInstance from '../context/axiosInstance';

const URL_base = import.meta.env.VITE_BASE_URL ;
const API_URL = `${URL_base}/api/users`;


export const userApi = {
  getAll: () => axiosInstance.get(API_URL),
  getById: (id) => axiosInstance.get(`${API_URL}/${id}`),
  create: (data) => axiosInstance.post(`${API_URL}/create`, data),
  update: (id, data) => axiosInstance.put(`${API_URL}/${id}`, data),
  delete: (id) => axiosInstance.delete(`${API_URL}/${id}`),
};
