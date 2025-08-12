import axiosInstance from '../context/axiosInstance';
const URL_base = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL2 ||  import.meta.env.VITE_locale ;
const API_URL = `${URL_base}/api/boutiques`;
const STOCK_API_URL = `${URL_base}/api/stocks`;


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
