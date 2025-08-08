import axiosInstance from '../context/axiosInstance';

const API_URL = '/stocks';

const stockApi = {
  getAll: () => axiosInstance.get(API_URL),
  getById: (id) => axiosInstance.get(`${API_URL}/${id}`),
  getByBoutiqueId: (boutiqueId) => axiosInstance.get(`${API_URL}/boutique/${boutiqueId}`),
  getByProduitId: (produitId) => axiosInstance.get(`${API_URL}/produit/${produitId}`),
  create: (stockData) => axiosInstance.post(API_URL, stockData),
  update: (id, stockData) => axiosInstance.put(`${API_URL}/${id}`, stockData),
  delete: (id) => axiosInstance.delete(`${API_URL}/${id}`),
  reapprovisionner: (data) => axiosInstance.post(`${API_URL}/reapprovisionner`, data), // If you have this endpoint
};

export default stockApi;
