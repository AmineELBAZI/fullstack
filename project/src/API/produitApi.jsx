import axiosInstance from '../context/axiosInstance';

const URL_base = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL2 || import.meta.env.VITE_locale;
const API_URL = `${URL_base}/api/products`;
export const produitApi = {
  getAll: () => axiosInstance.get(API_URL),
  getByCategorie: (categorieId) => axiosInstance.get(`${API_URL}/by-categorie/${categorieId}`),
  getWithoutBoutique: () => axiosInstance.get(`${API_URL}/no-boutique`),
  getEnRupture: () => axiosInstance.get(`${API_URL}/rupture`),
  create: (data) => axiosInstance.post(API_URL, data),
  update: (id, data) => axiosInstance.put(`${API_URL}/${id}`, data),
  delete: (id) => axiosInstance.delete(`${API_URL}/${id}`),

  // ✅ Corrigé : POST vers l'endpoint correct
  printTicketProduit: (id) => 
    axiosInstance.post(`${URL_base}/api/print/ticket-produit/${id}`)
};

