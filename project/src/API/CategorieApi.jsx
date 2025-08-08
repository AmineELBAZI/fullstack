import axiosInstance from '../context/axiosInstance';

const API_URL = '/categories';

export const categorieApi = {
  getAll: () => axiosInstance.get(API_URL),
  create: (data) => axiosInstance.post(API_URL, data),
  update: (id, data) => axiosInstance.put(`${API_URL}/${id}`, data),  // <-- ADD THIS
  delete: (id) => axiosInstance.delete(`${API_URL}/${id}`),
};
