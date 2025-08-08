import axiosInstance from '../context/axiosInstance';

const API_URL = '/ventes';

export const venteApi = {
  getAll: () => axiosInstance.get(API_URL),
  getById: (id) => axiosInstance.get(`${API_URL}/${id}`),
  create: (data) => axiosInstance.post(API_URL, data),
  createMultiple: (data) => axiosInstance.post(`${API_URL}/multiple`, data),
  update: (id, data) => axiosInstance.put(`${API_URL}/${id}`, data),
  delete: (id) => axiosInstance.delete(`${API_URL}/${id}`),
  bulkDelete: (ids) => axiosInstance.delete(API_URL, { data: ids }),
  safeDelete: (id) => axiosInstance.delete(`${API_URL}/safe-delete/${id}`),
  getByPointVente: (boutiqueId) => axiosInstance.get(`${API_URL}/boutique/${boutiqueId}`),
  createProduitFini: (data) => axiosInstance.post(`${API_URL}/produit-fini`, data),

};
