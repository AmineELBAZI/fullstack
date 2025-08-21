import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { produitApi } from '../API/produitApi';
import { categorieApi } from '../API/CategorieApi';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Produits = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModalProduit, setShowModalProduit] = useState(false);
  const [editingProduit, setEditingProduit] = useState(null);

  const [formDataProduit, setFormDataProduit] = useState({
    name: '',
    price_buy: 0,
    price_sell: 0,
    quantityStock: 0,
    categorie: null,
    reference: '', // uniquement pour l’édition ou saisie
  });

  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: isLoadingCategories, error: errorCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categorieApi.getAll().then(res => res.data),
  });

  const [produitsParCategorie, setProduitsParCategorie] = useState({});
  const [loadingProduits, setLoadingProduits] = useState(true);

  useEffect(() => {
    if (categories.length === 0) return;

    const fetchProduitsParCategorie = async () => {
      setLoadingProduits(true);
      try {
        const result = {};
        for (const cat of categories) {
          const response = await produitApi.getByCategorie(cat.id);
          result[cat.nom] = response.data;
        }
        setProduitsParCategorie(result);
      } catch {
        toast.error('Erreur lors du chargement des produits');
      } finally {
        setLoadingProduits(false);
      }
    };

    fetchProduitsParCategorie();
  }, [categories.length]); // <- uniquement sur changement du nombre de catégories


  const createMutation = useMutation({
    mutationFn: produitApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Produit créé avec succès');
      handleCloseModalProduit();
    },
    onError: () => toast.error('Erreur lors de la création du produit'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => produitApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Produit modifié avec succès');
      handleCloseModalProduit();
    },
    onError: () => toast.error('Erreur lors de la modification du produit'),
  });

  const deleteMutation = useMutation({
    mutationFn: produitApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Produit supprimé avec succès');
    },
    onError: () => toast.error('Erreur lors de la suppression du produit'),
  });

  const handleOpenModalProduit = (produit = null) => {
    if (produit) {
      setEditingProduit(produit);
      setFormDataProduit({
        name: produit.name,
        reference: produit.reference || '',
        price_buy: produit.price_buy || 0,
        price_sell: produit.price_sell || 0,
        quantityStock: produit.quantityStock || 0,
        categorie: produit.categorie?.id || null,
      });
    } else {
      setEditingProduit(null);
      setFormDataProduit({
        name: '',
        reference: '',
        price_buy: 0,
        price_sell: 0,
        quantityStock: 0,
        categorie: '',
      });
    }
    setShowModalProduit(true);
  };

  const handleCloseModalProduit = () => {
    setShowModalProduit(false);
    setEditingProduit(null);
    setFormDataProduit({
      name: '',
      reference: '',
      price_buy: 0,
      price_sell: 0,
      quantityStock: 0,
      categorie: '',
    });
  };

  const handleSubmitProduit = (e) => {
    e.preventDefault();

    const dataToSubmit = {
      ...formDataProduit,
      categorie: { id: formDataProduit.categorie },
      reference: formDataProduit.reference?.trim() === '' ? null : formDataProduit.reference.trim(),
    };

    if (editingProduit) {
      updateMutation.mutate({ id: editingProduit.id, ...dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const handleDeleteProduit = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoadingCategories || loadingProduits) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (errorCategories) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur lors du chargement des catégories</p>
      </div>
    );
  }

  const allProduitsEmpty = categories.length > 0
    ? Object.values(produitsParCategorie).every(prods => prods.length === 0)
    : true;

  return (
    <>
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-600">Liste des produits par catégorie</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <Button onClick={() => handleOpenModalProduit()}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau produit
          </Button>
        </div>

        {categories.length === 0 ? (
          <p className="text-center text-gray-500 py-6">Aucune catégorie trouvée.</p>
        ) : allProduitsEmpty ? (
          <p className="text-center text-gray-500 py-6">Aucun produit disponible.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(produitsParCategorie).map(([categorieNom, produits]) => {
              const produitsFiltres = produits.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.reference?.toLowerCase().includes(searchTerm.toLowerCase())
              );

              return (
                <div key={categorieNom} className="bg-white rounded-xl shadow p-4">
                  <h2
                    className="text-xl font-bold mb-4 text-blue-700 p-4 rounded-t-md border-b-4 border-blue-500 cursor-pointer"
                    title={categorieNom}
                  >
                    {categorieNom}
                  </h2>
                  {produitsFiltres.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aucun produit trouvé</p>
                  ) : (
                    <div className="max-h-96 overflow-y-auto pr-1 hide-scrollbar">
                      {produitsFiltres.map(produit => (
                        <div
                          key={produit.id}
                          className="border-b border-gray-200 pb-4 mb-4 last:mb-0 last:pb-0 last:border-none p-2 cursor-none min-h-[120px] flex flex-col justify-between hover:shadow-lg transition"
                          onClick={() => handleOpenModalProduit(produit)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{produit.name}</h3>
                              <p className="text-sm text-gray-500">Réf: {produit.reference}</p>
                            </div>
                            <div className="flex space-x-2" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenModalProduit(produit)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                aria-label="Modifier produit"
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduit(produit.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                aria-label="Supprimer produit"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            Prix d'achat (1 g/ml) : <span className="text-orange-600 font-semibold">{produit.price_buy} MAD</span><br />
                            Prix de vente (1 g/ml) : <span className="text-green-600 font-semibold">{produit.price_sell} MAD</span><br />
                            Quantité de stock : <span className="text-blue-600 font-semibold">{produit.quantityStock}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Modal
          isOpen={showModalProduit}
          onClose={handleCloseModalProduit}
          title={editingProduit ? 'Modifier le produit' : 'Nouveau produit'}
        >
          <form onSubmit={handleSubmitProduit} className="space-y-4">

            {/* Référence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Référence (optionnelle)</label>
              <input
                type="text"
                placeholder="Laissez vide pour générer automatiquement"
                value={formDataProduit.reference}
                onChange={e => setFormDataProduit({ ...formDataProduit, reference: e.target.value })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${editingProduit ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''}`}
                disabled={!!editingProduit}
              />
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                required
                value={formDataProduit.name}
                onChange={e => setFormDataProduit({ ...formDataProduit, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Prix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix d'achat (1 g/ml)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formDataProduit.price_buy}
                  onChange={e => setFormDataProduit({ ...formDataProduit, price_buy: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix de vente (1 g/ml)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formDataProduit.price_sell}
                  onChange={e => setFormDataProduit({ ...formDataProduit, price_sell: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Quantité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantité en stock</label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formDataProduit.quantityStock}
                onChange={e => setFormDataProduit({ ...formDataProduit, quantityStock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select
                required
                value={formDataProduit.categorie || ''}
                onChange={e => setFormDataProduit({ ...formDataProduit, categorie: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="" disabled>-- Sélectionnez une catégorie --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nom}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={handleCloseModalProduit}>Annuler</Button>
              <Button type="submit" loading={createMutation.isLoading || updateMutation.isLoading}>
                {editingProduit ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default Produits;
