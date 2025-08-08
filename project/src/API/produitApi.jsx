import axiosInstance from '../context/axiosInstance';

const API_URL = '/products';

export const produitApi = {
  getAll: () => axiosInstance.get(API_URL),
  getByCategorie: (categorieId) => axiosInstance.get(`${API_URL}/by-categorie/${categorieId}`),
  getWithoutBoutique: () => axiosInstance.get(`${API_URL}/no-boutique`),
  getEnRupture: () => axiosInstance.get(`${API_URL}/rupture`),
  create: (data) => axiosInstance.post(API_URL, data),
  update: (id, data) => axiosInstance.put(`${API_URL}/${id}`, data),
  delete: (id) => axiosInstance.delete(`${API_URL}/${id}`),
};
