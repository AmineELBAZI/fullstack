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
  // Seuils dynamiques pour la classification des stocks
  const [ruptureSeuil, setRuptureSeuil] = useState(0);
  const [faibleSeuil, setFaibleSeuil] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    produitId: '',
    pointVenteId: '',
    quantite: 0,
  });

  const queryClient = useQueryClient();

  // Chargement des produits
  const { data: allProduits = [], isLoading: isLoadingAllProduits } = useQuery({
    queryKey: ['allProduits'],
    queryFn: () => produitApi.getAll().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  // Chargement des points de vente
  const { data: pointsVente = [], isLoading: isLoadingPointsVente } = useQuery({
    queryKey: ['pointsVente'],
    queryFn: () => pointVenteApi.getAllPointsVente().then(res => res.data),
  });

  // Chargement des catégories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categorieApi.getAll().then(res => res.data),
  });




  // Soumettre réapprovisionnement
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.produitId || !formData.pointVenteId || formData.quantite <= 0) {
      toast.error('Veuillez remplir tous les champs correctement');
      return;
    }
    reapprovisionnementMutation.mutate(formData);
  };

  // Statut stock dynamique selon seuils
  const getStockStatus = (quantity) => {
    if (quantity <= ruptureSeuil) return { color: 'text-red-600 bg-red-100', label: 'Rupture' };
    if (quantity > ruptureSeuil && quantity <= faibleSeuil) return { color: 'text-amber-600 bg-amber-100', label: 'Faible' };
    return { color: 'text-green-600 bg-green-100', label: 'Normal' };
  };

  // Comptes pour stats
  const ruptureCount = allProduits.filter(p => p.quantityStock <= ruptureSeuil).length;
  const faibleCount = allProduits.filter(p => p.quantityStock > ruptureSeuil && p.quantityStock <= faibleSeuil).length;
  const totalProduits = allProduits.length;

  // Quantités totales par catégorie
  const quantitesParCategorie = categories.map(cat => {
    const totalQuantite = (cat.produits || []).reduce((sum, p) => sum + (p.quantityStock || 0), 0);
    return {
      id: cat.id,
      nom: cat.nom,
      quantite: totalQuantite,
    };
  });

  // Produits filtrés par statut stock dynamique
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
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
      <div className="space-y-6">


        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des produits</h1>
            <p className="text-gray-600">Liste et statistiques des produits</p>
          </div>
          <Button
            onClick={() => queryClient.invalidateQueries(['allProduits'])}
            className="bg-blue-700 text-blue-800  hover:bg-teal-500 flex items-center gap-2"
          >
            <Package className="w-5 h-5" />
            Actualiser le stock
          </Button>
        </div>
        {/* Valeur totale du stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Coût total d'achat */}
          <div className="bg-white shadow rounded-xl p-5 border border-gray-100 flex items-center space-x-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Valeur d'achat du stock</p>
              <p className="text-xl font-semibold text-orange-700">
                {allProduits.reduce((total, p) => total + p.price_buy * p.quantityStock, 0).toFixed(2)} MAD
              </p>
            </div>
          </div>

          {/* Estimation de vente */}
          <div className="bg-white shadow rounded-xl p-5 border border-gray-100 flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Estimation de vente du stock</p>
              <p className="text-xl font-semibold text-green-700">
                {allProduits.reduce((total, p) => total + p.price_sell * p.quantityStock, 0).toFixed(2)} MAD
              </p>
            </div>
          </div>
        </div>


        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-xl p-5 border border-gray-100 flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Produits</p>
              <p className="text-xl font-semibold text-gray-800">{totalProduits}</p>
            </div>
          </div>
          <div className="bg-amber-100 shadow rounded-xl p-5 border border-gray-100 flex items-center space-x-4">
            <div className="bg-amber-200 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <p className="text-amber-700 text-sm">Stock faible</p>
              <p className="text-xl font-semibold text-amber-800">{faibleCount}</p>
            </div>
          </div>
          <div className="bg-red-50 shadow rounded-xl p-5 border border-gray-100 flex items-center space-x-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-red-700 text-sm">Ruptures</p>
              <p className="text-xl font-semibold text-red-800">{ruptureCount}</p>
            </div>
          </div>
        </div>

        {/* Stock total par catégorie */}
        <div>
          <h2 className="text-xl font-bold text-gray-700 mt-8 mb-4">Stock total par catégorie</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {quantitesParCategorie.map(categorie => (
              <div key={categorie.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{categorie.nom}</h3>
                  <p className="text-sm text-gray-500">Quantité totale en stock</p>
                </div>
                <span className="text-xl font-bold text-blue-600">{categorie.quantite}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Seuils dynamiques */}
        <div className="flex gap-6 mb-6 p-2 bg-white border border-gray-300 rounded-lg">
          <div>
            <label className="block font-semibold text-amber-700 mb-1">Seuil stock faible</label>
            <input
              type="number"
              min={ruptureSeuil + 1}
              value={faibleSeuil}
              onChange={e => setFaibleSeuil(Math.max(ruptureSeuil + 1, Number(e.target.value)))}
              className="border border-gray-300 rounded px-3 py-1 w-32"
            />
          </div>
          <div >
            <label className="block font-semibold text-red-700 mb-1">Seuil rupture de stock</label>
            <input
              type="number"
              min={0}
              value={ruptureSeuil}
              onChange={e => setRuptureSeuil(Math.max(0, Number(e.target.value)))}
              className="border border-gray-300 rounded px-3 py-1 w-32"
            />
          </div>

        </div>
        {/* Produits listés par statut de stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Stock Normal */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-green-700">Stock Normal</h3>
            {produitsNormal.length === 0 && (
              <p className="text-gray-500 text-sm">Aucun produit en stock normal</p>
            )}
            <div className="max-h-96 overflow-y-auto hide-scrollbar space-y-4">
              {produitsNormal.map(produit => {
                const status = getStockStatus(produit.quantityStock);
                return (
                  <div
                    key={produit.id}
                    className="bg-white  rounded-2xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-shadow duration-300"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 border-b border-black-200 pb-2">
                      <h3 className="text-lg font-bold text-green-900 truncate">{produit.name}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full text-black  font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-semibold">Réf :</span> {produit.reference}</p>
                        <p className="text-sm"><span className="font-semibold">Prix d'achat :</span> <span className="text-orange-600">{produit.price_buy.toFixed(2)} MAD</span></p>

                      </div>
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-semibold">Prix de vente :</span> <span className="text-green-600">{produit.price_sell.toFixed(2)} MAD</span></p>
                        <p className="text-sm"><span className="font-semibold">Prix total :</span> <span className="text-green-600">{(produit.price_sell * produit.quantityStock).toFixed(2)} MAD</span></p>
                      </div>
                    </div>
                    <div className="space-y-2 text-black m-2 border-t border-black-300">
                      <p className="text-m p-4 pb-0 flex items-center gap-2">
                        <Layers className="h-6 w-6 text-red-600" />
                        <span className="font-semibold">Quantité :</span>
                        <span className="font-bold">{produit.quantityStock}</span>
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Stock Faible */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-amber-700">Stock Faible</h3>
            {produitsFaible.length === 0 && (
              <p className="text-gray-500 text-sm">Aucun produit en stock faible</p>
            )}
            <div className="max-h-96 overflow-y-auto hide-scrollbar space-y-4">
              {produitsFaible.map(produit => {
                const status = getStockStatus(produit.quantityStock);
                return (
                  <div
                    key={produit.id}
                    className="bg-amber-50 hover:bg-white rounded-2xl shadow-lg border border-amber-200 p-6 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-black-200 pb-2">
                      <h3 className="text-lg font-bold text-amber-900 truncate">{produit.name}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full text-black font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-semibold">Réf :</span> {produit.reference}</p>
                        <p className="text-sm"><span className="font-semibold">Prix d'achat :</span> <span className="text-orange-600">{produit.price_buy.toFixed(2)} MAD</span></p>

                      </div>
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-semibold">Prix de vente :</span> <span className="text-green-600">{produit.price_sell.toFixed(2)} MAD</span></p>
                        <p className="text-sm"><span className="font-semibold">Prix total :</span> <span className="text-green-600">{(produit.price_sell * produit.quantityStock).toFixed(2)} MAD</span></p>
                      </div>
                    </div>
                  <div className="space-y-2 text-black m-2 border-t border-black-300">
                      <p className="text-m p-4 pb-0 flex items-center gap-2">
                        <Layers className="h-6 w-6 text-red-600" />
                        <span className="font-semibold">Quantité :</span>
                        <span className="font-bold">{produit.quantityStock}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stock Rupture */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-red-700">Stock Rupture</h3>
            {produitsRupture.length === 0 && (
              <p className="text-gray-500 text-sm">Aucun produit en rupture de stock</p>
            )}
            <div className="max-h-96 overflow-y-auto hide-scrollbar space-y-4">
              {produitsRupture.map(produit => {
                const status = getStockStatus(produit.quantityStock);
                return (
                  <div
                    key={produit.id}
                    className="bg-red-50 hover:bg-white rounded-2xl shadow-lg border border-red-200 p-6 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-black-300 pb-2">
                      <h3 className="text-lg font-bold text-red-900 truncate">{produit.name}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full text-black font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-semibold">Réf :</span> {produit.reference}</p>
                        <p className="text-sm"><span className="font-semibold">Prix d'achat :</span> <span className="text-orange-600">{produit.price_buy.toFixed(2)} MAD</span></p>

                      </div>
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-semibold">Prix de vente :</span> <span className="text-green-600">{produit.price_sell.toFixed(2)} MAD</span></p>
                        <p className="text-sm"><span className="font-semibold">Prix total :</span> <span className="text-green-600">{(produit.price_sell * produit.quantityStock).toFixed(2)} MAD</span></p>
                      </div>

                    </div>
                    <div className="space-y-2 text-black m-2 border-t border-black-300">
                      <p className="text-m p-4 pb-0 flex items-center gap-2">
                        <Layers className="h-6 w-6 text-red-600" />
                        <span className="font-semibold">Quantité :</span>
                        <span className="font-bold">{produit.quantityStock}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>


        {/* Modal de réapprovisionnement */}
        <Modal isOpen={showModal} onClose={handleCloseModal} title="Réapprovisionner le stock">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Produit</label>
              <select
                required
                value={formData.produitId}
                onChange={(e) => setFormData({ ...formData, produitId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionnez un produit</option>
                {allProduits.map((produit) => (
                  <option key={produit.id} value={produit.id}>
                    {produit.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Point de vente</label>
              <select
                required
                value={formData.pointVenteId}
                onChange={(e) => setFormData({ ...formData, pointVenteId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionnez un point de vente</option>
                {pointsVente.map((point) => (
                  <option key={point.id} value={point.id}>
                    {point.nom}
                  </option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={handleCloseModal}>
                Annuler
              </Button>
              <Button type="submit" loading={reapprovisionnementMutation.isLoading}>
                Réapprovisionner
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default Stocks;
