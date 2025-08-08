import axiosInstance from '../context/axiosInstance';

const API_URL = '/boutiques';
const STOCK_API_URL = '/stocks';

const PointsVenteApi = {
  getAllPointsVente: () => axiosInstance.get(API_URL),

  getPointVenteById: (id) => axiosInstance.get(`${API_URL}/${id}`),

  getByBoutiqueId: (id) => axiosInstance.get(`${API_URL}/${id}/produits`),

  createPointVente: (data) => axiosInstance.post(API_URL, data),

  updatePointVente: (id, data) => axiosInstance.put(`${API_URL}/${id}`, data),

  deletePointVente: (id) => axiosInstance.delete(`${API_URL}/${id}`),

  ajouterProduit: (boutiqueId, produitData) =>
    axiosInstance.post(`${API_URL}/${boutiqueId}/produits`, produitData),

  supprimerProduit: (boutiqueId, produitId) =>
    axiosInstance.delete(`${API_URL}/${boutiqueId}/produits/${produitId}`),

  validerStock: (stockId) =>
    axiosInstance.post(`${STOCK_API_URL}/${stockId}/valider`),

  getAllStocksByBoutique: (boutiqueId) =>
    axiosInstance.get(`${STOCK_API_URL}/boutique/${boutiqueId}`),
};

export default PointsVenteApi;
