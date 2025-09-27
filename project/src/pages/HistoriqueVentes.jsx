import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, ArrowRight } from 'lucide-react';
import { venteApi } from '../services/venteApi';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const HistoriqueVentes = () => {
  const { data: historique = [], isLoading, error } = useQuery({
    queryKey: ['historique-ventes'],
    queryFn: () => venteApi.getHistorique().then(res => res.data)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur lors du chargement de l'historique</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historique des ventes</h1>
        <p className="text-gray-600">Suivez toutes les modifications apportées aux ventes</p>
      </div>

      {/* Historique */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {historique.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vente ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de modification
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historique.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">#{entry.venteId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {entry.vente.produit.nom}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-red-600 line-through">
                          {entry.ancienPrix.toFixed(2)} MAD
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="text-green-600 font-medium">
                          {entry.nouveauPrix.toFixed(2)} MAD
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-red-600 line-through">
                          {entry.ancienneQuantite}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="text-green-600 font-medium">
                          {entry.nouvelleQuantite}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{entry.utilisateur.nom}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        {new Date(entry.dateModification).toLocaleString('fr-FR')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune modification de vente enregistrée</p>
            <p className="text-sm text-gray-400 mt-1">
              Les modifications futures apparaîtront ici
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Légende</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-red-600 line-through">Ancienne valeur</span>
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <span className="text-green-600 font-medium">Nouvelle valeur</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoriqueVentes;