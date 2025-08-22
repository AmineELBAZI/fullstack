import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Package, TrendingDown, AlertTriangle, Layers } from 'lucide-react';
import pointVenteApi from '../API/PointsVenteApi';
import { produitApi } from '../API/produitApi';
import { categorieApi } from '../API/CategorieApi';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Stocks = () => {
  const [ruptureSeuil, setRuptureSeuil] = useState(0);
  const [faibleSeuil, setFaibleSeuil] = useState(10);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    produitId: '',
    pointVenteId: '',
    quantite: 0,
  });

  const queryClient = useQueryClient();

  // --- Queries ---
  const { data: allProduits = [], isLoading: isLoadingAllProduits } = useQuery({
    queryKey: ['allProduits'],
    queryFn: () => produitApi.getAll().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: pointsVente = [], isLoading: isLoadingPointsVente } = useQuery({
    queryKey: ['pointsVente'],
    queryFn: () => pointVenteApi.getAllPointsVente().then(res => res.data),
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categorieApi.getAll().then(res => res.data),
  });

  // --- Reapprovisionnement mutation ---
  const reapprovisionnementMutation = useMutation({
    mutationFn: (data) => produitApi.reapprovisionner(data),
    onSuccess: () => {
      toast.success('Réapprovisionnement effectué !');
      queryClient.invalidateQueries(['allProduits']);
      handleCloseModal();
    },
    onError: () => toast.error('Erreur lors du réapprovisionnement'),
  });

  // --- Modal open/close ---
  const handleCloseModal = () => setShowModal(false);
  const handleOpenModal = () => setShowModal(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.produitId || !formData.pointVenteId || formData.quantite <= 0) {
      toast.error('Veuillez remplir tous les champs correctement');
      return;
    }
    reapprovisionnementMutation.mutate(formData);
  };

  const getStockStatus = (quantity) => {
    if (quantity <= ruptureSeuil) return { color: 'text-red-600 bg-red-100', label: 'Rupture' };
    if (quantity > ruptureSeuil && quantity <= faibleSeuil) return { color: 'text-amber-600 bg-amber-100', label: 'Faible' };
    return { color: 'text-green-600 bg-green-100', label: 'Normal' };
  };

  const ruptureCount = allProduits.filter(p => p.quantityStock <= ruptureSeuil).length;
  const faibleCount = allProduits.filter(p => p.quantityStock > ruptureSeuil && p.quantityStock <= faibleSeuil).length;
  const totalProduits = allProduits.length;

  const quantitesParCategorie = categories.map(cat => ({
    id: cat.id,
    nom: cat.nom,
    quantite: (cat.produits || []).reduce((sum, p) => sum + (p.quantityStock || 0), 0),
  }));

  const produitsNormal = allProduits.filter(p => p.quantityStock > faibleSeuil);
  const produitsFaible = allProduits.filter(p => p.quantityStock > ruptureSeuil && p.quantityStock <= faibleSeuil);
  const produitsRupture = allProduits.filter(p => p.quantityStock <= ruptureSeuil);

  if (isLoadingAllProduits || isLoadingPointsVente || isLoadingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des produits</h1>
            <p className="text-gray-600">Liste et statistiques des produits</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => queryClient.invalidateQueries(['allProduits'])} className="bg-blue-700 text-white hover:bg-teal-500 flex items-center gap-2">
              <Package className="w-5 h-5" /> Actualiser le stock
            </Button>
            <Button onClick={handleOpenModal} className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Ajouter au stock
            </Button>
          </div>
        </div>

        {/* ...rest of your component code (stock display, stats, etc.) ... */}

        {/* Modal de réapprovisionnement */}
        <Modal isOpen={showModal} onClose={handleCloseModal} title="Réapprovisionner le stock">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Produit</label>
              <select
                required
                value={formData.produitId}
                onChange={(e) => setFormData({ ...formData, produitId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Sélectionnez un produit</option>
                {allProduits.map(produit => (
                  <option key={produit.id} value={produit.id}>{produit.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Point de vente</label>
              <select
                required
                value={formData.pointVenteId}
                onChange={(e) => setFormData({ ...formData, pointVenteId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Sélectionnez un point de vente</option>
                {pointsVente.map(point => (
                  <option key={point.id} value={point.id}>{point.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantité à ajouter</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.quantite}
                onChange={(e) => setFormData({ ...formData, quantite: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="0.00"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={handleCloseModal}>Annuler</Button>
              <Button type="submit" loading={reapprovisionnementMutation.isLoading}>Réapprovisionner</Button>
            </div>
          </form>
        </Modal>

      </div>
    </>
  );
};

export default Stocks;
