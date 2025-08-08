import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { venteApi } from '../API/venteApi';
import PointsVenteApi from '../API/PointsVenteApi';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { ShoppingCart, BarChart3, DollarSign, Trash2 ,Calendar ,Store} from 'lucide-react';

const Ventes = () => {
  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState('');
  const [dateMin, setDateMin] = useState('');
  const [dateMax, setDateMax] = useState('');
  const [selectedVentes, setSelectedVentes] = useState(new Set());

  const queryClient = useQueryClient();

  const { data: ventesData, isLoading, isError } = useQuery({
    queryKey: ['ventes'],
    queryFn: () => venteApi.getAll().then(res => res.data),
  });

  const { data: boutiquesData = [], isLoading: isLoadingBoutiques } = useQuery({
    queryKey: ['points-vente'],
    queryFn: () => PointsVenteApi.getAllPointsVente().then(res => res.data),
  });

  const deleteMutation = useMutation(
    (id) => venteApi.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['ventes']);
        setSelectedVentes(new Set());
      },
      onError: (error) => {
        alert('Erreur lors de la suppression: ' + (error?.message || ''));
      },
    }
  );

  const bulkDeleteMutation = useMutation(
    (ids) => venteApi.bulkDelete(Array.from(ids)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['ventes']);
        setSelectedVentes(new Set());
      },
      onError: (error) => {
        alert('Erreur lors de la suppression multiple: ' + (error?.message || ''));
      },
    }
  );

  const ventes = ventesData || [];

  const filteredVentes = ventes
    .filter((vente) => {
      const venteDate = new Date(vente.dateVente);
      const afterMinDate = dateMin ? venteDate >= new Date(dateMin) : true;
      const beforeMaxDate = dateMax ? venteDate <= new Date(dateMax) : true;
      const matchBoutique = selectedBoutiqueId ? vente.boutique?.id === parseInt(selectedBoutiqueId) : true;

      return afterMinDate && beforeMaxDate && matchBoutique;
    })
    .sort((a, b) => new Date(b.dateVente) - new Date(a.dateVente));

  const totalVentes = filteredVentes.length;

  const totalQuantiteVendue = filteredVentes.reduce(
    (total, vente) => total + (vente.quantity || 0),
    0
  );

  const chiffreAffaires = filteredVentes.reduce(
    (total, vente) => total + (vente.montantTotal || 0),
    0
  );

  const toggleSelection = (id) => {
    setSelectedVentes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedVentes.size === filteredVentes.length) {
      setSelectedVentes(new Set());
    } else {
      setSelectedVentes(new Set(filteredVentes.map(v => v.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedVentes.size === 0) return;
    if (window.confirm(`Voulez-vous vraiment supprimer ces ${selectedVentes.size} ventes ?`)) {
      bulkDeleteMutation.mutate(selectedVentes);
    }
  };

  if (isLoading || isLoadingBoutiques) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-600 mt-8">
        Une erreur est survenue lors du chargement des ventes.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Liste des ventes</h1>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-xl p-5 border border-gray-100 flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Nombre de ventes</p>
              <p className="text-xl font-bold text-gray-800">{totalVentes}</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-xl p-5 border border-gray-100 flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Quantité totale vendue</p>
              <p className="text-xl font-bold text-gray-800">{totalQuantiteVendue}</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-xl p-5 border border-gray-100 flex items-center space-x-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Chiffre d'affaires</p>
              <p className="text-xl font-bold text-gray-800">{chiffreAffaires.toFixed(2)} MAD</p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
            
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 text-blue-600 font-semibold">
                  <Calendar className="h-5 w-5" />
                  <span>Période :</span>
                </span>
                <input
                  type="date"
                  value={dateMin}
                  onChange={(e) => setDateMin(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2"
                />
                <span className="mx-1 text-gray-400 text-xl font-bold">→</span>
                <input
                  type="date"
                  value={dateMax}
                  onChange={(e) => setDateMax(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2"
                />
              </div>
                <div>
 <span className="inline-flex items-center gap-2 text-blue-600 font-semibold">
                  <Store className="h-5 w-5" />
                  <span>  </span>
                </span>
                <select
                  value={selectedBoutiqueId}
                  onChange={(e) => setSelectedBoutiqueId(e.target.value)}
                  className="border border-blue-800 bg-white rounded-xl px-3 py-2"
                >
                  <option value="">Tous les points de vente</option>
                  {boutiquesData.map((boutique) => (
                    <option key={boutique.id} value={boutique.id}>
                      {boutique.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isLoading || selectedVentes.size === 0}
              className={`px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition ${selectedVentes.size === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              title="Supprimer les ventes sélectionnées"
            >
              Supprimer la sélection ({selectedVentes.size})
            </button>
          </div>
          {bulkDeleteMutation.isLoading && (
            <span className="ml-3 text-red-600">Suppression en cours...</span>
          )}
        </div>

        {/* Tableau des ventes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Historique des ventes</h3>
          </div>

          {/* Desktop */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedVentes.size === filteredVentes.length && filteredVentes.length > 0}
                      onChange={toggleSelectAll}
                      aria-label="Select all ventes"
                    />
                  </th>
                  <th className="px-6 py-3 text-left">Produit</th>
                  <th className="px-6 py-3 text-left">Point de vente</th>
                  <th className="px-6 py-3 text-left">Quantité</th>
                  <th className="px-6 py-3 text-left">Prix unitaire</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVentes.map((vente) =>
                  vente.produits.map((produit) => {
                    const isChecked = selectedVentes.has(vente.id);
                    return (
                      <tr key={`${vente.id}-${produit.id}`}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelection(vente.id)}
                            aria-label={`Select vente ${vente.id}`}
                          />
                        </td>
                        <td className="px-6 py-4">{produit.name}</td>
                        <td className="px-6 py-4">{vente.boutique?.nom || '—'}</td>
                        <td className="px-6 py-4">
                          {vente.produits.length === 1
                            ? vente.quantity
                            : (vente.quantity / vente.produits.length).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          {(vente.montantTotal / vente.quantity).toFixed(2)} MAD
                        </td>
                        <td className="px-6 py-4 text-green-600 font-semibold">
                          {(vente.montantTotal / vente.produits.length).toFixed(2)} MAD
                        </td>
                        <td className="px-6 py-4">
                          {new Date(vente.dateVente).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              if (window.confirm('Voulez-vous vraiment supprimer cette vente ?')) {
                                deleteMutation.mutate(vente.id);
                              }
                            }}
                            disabled={deleteMutation.isLoading}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Supprimer la vente"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden px-4 py-6">
            <div
              className="space-y-4 hide-scrollbar border-2 border-sky-500 rounded-md"
              style={{ maxHeight: '70vh', overflowY: 'auto' }}
            >

              {filteredVentes.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune vente trouvée</p>
                </div>
              ) : (
                filteredVentes.map((vente) =>
                  vente.produits.map((produit) => (
                    <div
                      key={`${vente.id}-${produit.id}`}
                      className="bg-gray-50 rounded-lg shadow-sm p-4 space-y-1 border"
                    >
                      <p className="font-semibold text-gray-800">{produit.name}</p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Point de vente:</span> {vente.boutique?.nom || '—'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Quantité:</span>{' '}
                        {vente.produits.length === 1
                          ? vente.quantity
                          : (vente.quantity / vente.produits.length).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Prix unitaire:</span>{' '}
                        {(vente.montantTotal / vente.quantity).toFixed(2)} MAD
                      </p>
                      <p className="text-sm text-green-600 font-semibold">
                        <span className="font-medium">Total:</span>{' '}
                        {(vente.montantTotal / vente.produits.length).toFixed(2)} MAD
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(vente.dateVente).toLocaleDateString('fr-FR')}
                      </p>
                      <button
                        onClick={() => {
                          if (window.confirm('Voulez-vous vraiment supprimer cette vente ?')) {
                            deleteMutation.mutate(vente.id);
                          }
                        }}
                        disabled={deleteMutation.isLoading}
                        className="text-red-600 hover:text-red-800 transition-colors mt-2"
                        title="Supprimer la vente"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          {filteredVentes.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune vente trouvée</p>
            </div>
          )}
        </div>
      </div>

      {/* Invisible Scrollbar CSS */}
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
    </>
  );
};

export default Ventes;
