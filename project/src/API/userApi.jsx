import axiosInstance from '../context/axiosInstance';

const API_URL = '/users';

export const userApi = {
  getAll: () => axiosInstance.get(API_URL),
  getById: (id) => axiosInstance.get(`${API_URL}/${id}`),
  create: (data) => axiosInstance.post(`${API_URL}/create`, data),
  update: (id, data) => axiosInstance.put(`${API_URL}/${id}`, data),
  delete: (id) => axiosInstance.delete(`${API_URL}/${id}`),
};
