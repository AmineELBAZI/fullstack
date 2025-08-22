import axiosInstance from '../context/axiosInstance';
const URL_base = import.meta.env.VITE_BASE_URL ;
const API_URL = `${URL_base}/api/categories`;


export const categorieApi = {
  getAll: () => axiosInstance.get(API_URL),
  create: (data) => axiosInstance.post(API_URL, data),
  update: (id, data) => axiosInstance.put(`${API_URL}/${id}`, data),  // <-- ADD THIS
  delete: (id) => axiosInstance.delete(`${API_URL}/${id}`),
};
