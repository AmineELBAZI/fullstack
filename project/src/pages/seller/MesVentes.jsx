import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, DollarSign, TrendingUp, Calendar, Trash2 } from 'lucide-react';
import { venteApi } from '../../API/venteApi';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const MesVentes = () => {
  const queryClient = useQueryClient();

  const boutiqueId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.boutiqueId || null;
    } catch {
      return null;
    }
  })();

  const { data: ventes = [], isLoading } = useQuery({
    queryKey: ['mes-ventes', boutiqueId],
    queryFn: () => {
      if (!boutiqueId) {
        toast.error('Boutique ID introuvable. Veuillez vous reconnecter.');
        return [];
      }
      return venteApi.getByPointVente(boutiqueId).then(res => res.data);
    },
    enabled: !!boutiqueId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => venteApi.safeDelete(id),
    onSuccess: () => {
      toast.success('Vente supprimée avec succès.');
      queryClient.invalidateQueries(['mes-ventes', boutiqueId]);
    },
    onError: () => {
      toast.error('Erreur lors de la suppression de la vente.');
    },
  });

  const handleDelete = (vente) => {
    const message = `⚠️ En supprimant cette vente, la quantité de ${vente.quantity ?? vente.quantite ?? '-'} sera transférée au stock.\n\nConfirmez-vous la suppression ?`;
    if (window.confirm(message)) {
      deleteMutation.mutate(vente.id);
    }
  };

  const calculateStats = () => {
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const ventesToday = ventes.filter(
      (v) => new Date(v.dateVente).toDateString() === today
    );

    const ventesThisMonth = ventes.filter((v) => {
      const venteDate = new Date(v.dateVente);
      return (
        venteDate.getMonth() === thisMonth &&
        venteDate.getFullYear() === thisYear
      );
    });

    const totalCA = ventes.reduce((total, v) => total + (v.montantTotal || 0), 0);
    const caToday = ventesToday.reduce((total, v) => total + (v.montantTotal || 0), 0);
    const caThisMonth = ventesThisMonth.reduce((total, v) => total + (v.montantTotal || 0), 0);

    return {
      ventesToday: ventesToday.length,
      ventesThisMonth: ventesThisMonth.length,
      totalCA,
      caToday,
      caThisMonth,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Ventes</h1>
        <p className="text-gray-600">Historique de vos ventes et performances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<ShoppingCart className="h-6 w-6 text-green-600" />}
          label="Ventes aujourd'hui"
          value={stats.ventesToday}
          bg="bg-green-50"
        />
        <StatCard
          icon={<Calendar className="h-6 w-6 text-blue-600" />}
          label="Ventes ce mois"
          value={stats.ventesThisMonth}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<DollarSign className="h-6 w-6 text-amber-600" />}
          label="CA aujourd'hui"
          value={`${stats.caToday.toFixed(2)} MAD`}
          bg="bg-amber-50"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
          label="CA total"
          value={`${stats.totalCA.toFixed(2)} MAD`}
          bg="bg-purple-50"
        />
      </div>

      {/* Historique des ventes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Historique des ventes</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produits</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qté totale</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant total</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ventes
                .sort((a, b) => new Date(b.dateVente) - new Date(a.dateVente))
                .map((vente) => (
                  <tr key={vente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>{new Date(vente.dateVente).toLocaleDateString('fr-FR')}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(vente.dateVente).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {vente.produits?.map((p) => (
                        <div key={p.id} className="mb-1">
                          <span className="font-medium">{p.name}</span> —{' '}
                          <span className="text-gray-500">{p.reference}</span>
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">{vente.quantity ?? '-'}</td>
                    <td className="px-6 py-4 text-right text-green-600 font-semibold text-sm">
                      {vente.montantTotal.toFixed(2)} MAD
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleDelete(vente)}
                        className="text-red-500 hover:text-red-700"
                        title="Supprimer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {ventes.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune vente enregistrée</p>
            <p className="text-sm text-gray-400 mt-1">
              Vos ventes apparaîtront ici une fois enregistrées
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, bg }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center space-x-3">
      <div className={`p-2 ${bg} rounded-lg`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default MesVentes;
