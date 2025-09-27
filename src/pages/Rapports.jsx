import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { venteApi } from '../API/venteApi';
import { produitApi } from '../API/produitApi';
import PointsVenteApi from '../API/PointsVenteApi';
import {
  BarChart3, TrendingUp, DollarSign, Package, Download, Calendar
} from 'lucide-react';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

function formatToDateKey(dateString) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

const Rapports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const {
    data: ventes = [],
    isLoading: loadingVentes,
    isError: errorVentes
  } = useQuery(['ventes'], () => venteApi.getAll().then(r => r.data));

  const {
    data: produits = [],
    isLoading: loadingProduits,
    isError: errorProduits
  } = useQuery(['produits'], () => produitApi.getAll().then(r => r.data));

  const {
    data: boutiques = [],
    isLoading: loadingBoutiques,
    isError: errorBoutiques
  } = useQuery(['boutiques'], () => PointsVenteApi.getAllPointsVente().then(r => r.data));

  const isLoading = loadingVentes || loadingProduits || loadingBoutiques;
  const isError = errorVentes || errorProduits || errorBoutiques;

  const rapports = useMemo(() => {
    if (!ventes || !produits || !boutiques) return null;

    const filtered = ventes
      .map(vente => {
        const dateKey = formatToDateKey(vente.dateVente);
        return { ...vente, dateKey };
      })
      .filter(v =>
        v.dateKey &&
        v.dateKey >= dateRange.startDate &&
        v.dateKey <= dateRange.endDate &&
        v.boutique && v.boutique.id
      );

    const totalVentes = filtered.length;
    const chiffreAffaires = filtered.reduce((sum, v) => sum + (v.montantTotal || 0), 0);
    const venteMoyenne = totalVentes > 0 ? chiffreAffaires / totalVentes : 0;

    const produitsMap = {};
    const pointsMap = {};

    filtered.forEach(v => {
      if (!Array.isArray(v.produits)) return;

      v.produits.forEach(p => {
        if (!p?.id) return;
        if (!produitsMap[p.id]) {
          produitsMap[p.id] = { quantite: 0, chiffreAffaires: 0 };
        }
        produitsMap[p.id].quantite += v.quantity || 0;
        produitsMap[p.id].chiffreAffaires += v.montantTotal || 0;
      });

      const bId = v.boutique?.id;
      if (!bId) return;
      if (!pointsMap[bId]) {
        pointsMap[bId] = { totalVentes: 0, chiffreAffaires: 0 };
      }
      pointsMap[bId].totalVentes += 1;
      pointsMap[bId].chiffreAffaires += v.montantTotal || 0;
    });

    const topProduits = Object.entries(produitsMap)
      .map(([id, stats]) => {
        const prod = produits.find(p => p.id === +id) || {};
        return {
          nom: prod.name || 'Produit inconnu',
          quantite: stats.quantite,
          chiffreAffaires: stats.chiffreAffaires
        };
      })
      .sort((a, b) => b.quantite - a.quantite)
      .slice(0, 5);

    const topPointsVente = Object.entries(pointsMap)
      .map(([id, stats]) => {
        const b = boutiques.find(b => b.id === +id) || {};
        return {
          nom: b.nom || 'Boutique inconnue',
          totalVentes: stats.totalVentes,
          chiffreAffaires: stats.chiffreAffaires
        };
      })
      .sort((a, b) => b.chiffreAffaires - a.chiffreAffaires)
      .slice(0, 5);

    const ventesRecentes = filtered
      .filter(v => v.dateVente && !isNaN(new Date(v.dateVente)))
      .sort((a, b) => new Date(b.dateVente) - new Date(a.dateVente))
      .slice(0, 10);

    return {
      chiffreAffaires,
      totalVentes,
      venteMoyenne,
      produitsVendus: filtered.reduce((sum, v) => sum + (v.quantity || 0), 0),
      topProduits,
      topPointsVente,
      ventesRecentes
    };
  }, [ventes, produits, boutiques, dateRange]);



  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  if (isError || !rapports) {
    return <div className="text-center text-red-600">Une erreur est survenue lors du chargement des rapports.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & date pickers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl  text-slate-900 font-bold  drop-shadow">
            Rapports & Analyses
          </h1>
          <p className="text-gray-500 mt-1 italic">Vue d'ensemble des performances</p>
        </div>

      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[{
          icon: <DollarSign className="h-6 w-6 text-blue-600" />,
          title: "Chiffre d'affaires", value: `${rapports.chiffreAffaires.toFixed(2)} MAD`
        }, {
          icon: <TrendingUp className="h-6 w-6 text-green-600" />,
          title: "Total des ventes", value: rapports.totalVentes
        }, {
          icon: <Package className="h-6 w-6 text-amber-600" />,
          title: "Produits vendus", value: rapports.produitsVendus
        }, {
          icon: <BarChart3 className="h-6 w-6 text-purple-600" />,
          title: "Vente moyenne", value: `${rapports.venteMoyenne.toFixed(2)} MAD`
        }].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-lg">{kpi.icon}</div>
              <div>
                <p className="text-sm text-gray-500">{kpi.title}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg border border-blue-100 bg-white/60 backdrop-blur-md">
        <span className="inline-flex items-center gap-2 text-blue-600 font-semibold">
          <Calendar className="h-5 w-5" />
          <span>Période :</span>
        </span>
        <input
          type="date"
          value={dateRange.startDate}
          onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
          className="rounded-lg border border-gray-300 px-3 py-1.5 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition text-sm bg-white shadow-sm"
        />
        <span className="mx-2 text-gray-400 font-bold text-lg">→</span>
        <input
          type="date"
          value={dateRange.endDate}
          onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
          className="rounded-lg border border-gray-300 px-3 py-1.5 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition text-sm bg-white shadow-sm"
        />
      </div>
      {/* Top Products & Boutiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Produits */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl">Produits les plus vendus</h1>

          </div>
          <div className="space-y-3">
            {rapports.topProduits.length
              ? rapports.topProduits.map((p, i) => (
                <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{p.nom}</p>
                    <p className="text-sm text-gray-500">{p.quantite} unités vendues</p>
                  </div>
                  <p className="font-semibold text-green-600">{p.chiffreAffaires.toFixed(2)} MAD</p>
                </div>
              ))
              : <p className="text-center text-gray-500">Aucune donnée disponible</p>}
          </div>
        </div>

        {/* Top Boutiques */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between mb-4">
            <h3 className="text-2xl">Points de vente performants</h3>

          </div>
          <div className="space-y-3">
            {rapports.topPointsVente.length
              ? rapports.topPointsVente.map((b, i) => (
                <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{b.nom}</p>
                    <p className="text-sm text-gray-500">{b.totalVentes} ventes</p>
                  </div>
                  <p className="font-semibold text-blue-600">{b.chiffreAffaires.toFixed(2)} MAD</p>
                </div>
              ))
              : <p className="text-center text-gray-500">Aucune donnée disponible</p>}
          </div>
        </div>
      </div>

      {/* Ventes Récentes */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex justify-between mb-4">
          <h3 className="text-2xl">Ventes récentes</h3>

        </div>
        {rapports.ventesRecentes.length ? (
          <table className="min-w-full text-left border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Date</th>
                <th className="border border-gray-300 p-2">Boutique</th>
                <th className="border border-gray-300 p-2">Montant total (MAD)</th>
                <th className="border border-gray-300 p-2">Produits</th>
              </tr>
            </thead>
            <tbody>
              {rapports.ventesRecentes.map((v, i) => (
                <tr key={i} className="even:bg-gray-50">
                  <td className="border border-gray-300 p-2">
                    {new Date(v.dateVente).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 p-2">{v.boutique?.nom || 'N/A'}</td>
                  <td className="border border-gray-300 p-2">{(v.montantTotal || 0).toFixed(2)}</td>
                  <td className="border border-gray-300 p-2">
                    {Array.isArray(v.produits) && v.produits.length > 0
                      ? v.produits.map(p => p.name || 'Produit').join(', ')
                      : 'Aucun produit'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500">Aucune vente récente disponible</p>
        )}
      </div>
    </div>
  );
};

export default Rapports;
