import React, { useEffect, useState } from 'react';
import PointsVenteApi from '../../API/PointsVenteApi';
import { Package, TrendingUp, Archive, RefreshCw, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const MonStock = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStockId, setUpdatingStockId] = useState(null);
  const [seuilRupture, setSeuilRupture] = useState(0);
  const [seuilFaible, setSeuilFaible] = useState(10);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // 🔎 NEW STATE

  const boutiqueId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.boutiqueId || null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!boutiqueId) {
      toast.error("Boutique ID introuvable. Veuillez vous reconnecter.");
      setLoading(false);
      return;
    }
    setLoading(true);
    PointsVenteApi.getPointVenteById(boutiqueId)
      .then((response) => {
        setStocks(response.data.stocks || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des produits:", error);
        toast.error("Erreur lors du chargement des produits.");
        setLoading(false);
      });
  }, [reloadTrigger, boutiqueId]);

  const ruptureCount = stocks.filter(stock => stock.quantity <= seuilRupture).length;
  const faibleStockCount = stocks.filter(
    stock => stock.quantity > seuilRupture && stock.quantity < seuilFaible
  ).length;
  const totalProduits = stocks.length;

  const validatedStocks = stocks.filter(stock => stock.status === 'VALIDATED');
  const nonValidatedStocks = stocks.filter(stock => stock.status === 'NOT_VALIDATED');

  // 🔎 Filtrage par recherche
  const filterStocks = (list) => {
    if (!searchQuery) return list;
    return list.filter(stock =>
      stock.id.toString().includes(searchQuery.toLowerCase()) ||
      stock.produit?.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.produit?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleValiderStock = (stockId) => {
    setUpdatingStockId(stockId);
    PointsVenteApi.validerStock(stockId)
      .then(() => {
        toast.success('Stock validé avec succès');
        setReloadTrigger(prev => prev + 1);
      })
      .catch(() => {
        toast.error("Erreur lors de la validation du stock");
      })
      .finally(() => {
        setUpdatingStockId(null);
      });
  };

  const getRowClass = (quantity) => {
    if (quantity <= seuilRupture) return 'bg-red-100';
    if (quantity < seuilFaible) return 'bg-amber-100';
    return '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 text-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header + Actualiser Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mon Stock</h1>
        <button
          onClick={() => setReloadTrigger(prev => prev + 1)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>


      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-xl p-5 border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Produits</p>
            <p className="text-xl font-semibold text-gray-800">{totalProduits}</p>
          </div>
        </div>
        <div className="bg-white shadow rounded-xl p-5 border border-gray-100 flex items-center space-x-4">
          <div className="bg-amber-100 p-3 rounded-lg">
            <TrendingUp className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Stock Faible</p>
            <p className="text-xl font-semibold text-gray-800">{faibleStockCount}</p>
          </div>
        </div>
        <div className="bg-white shadow rounded-xl p-5 border border-gray-100 flex items-center space-x-4">
          <div className="bg-red-100 p-3 rounded-lg">
            <Archive className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Ruptures</p>
            <p className="text-xl font-semibold text-gray-800">{ruptureCount}</p>
          </div>
        </div>
      </div>

{/* Search + Seuil de stock in same row */}
<div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
  {/* Search bar */}
  <div className="flex-1">
    <label className="block text-sm text-gray-700 font-medium mb-1">
      Rechercher
    </label>
    <div className="relative w-full">
      <input
        type="text"
        placeholder="ID, référence ou nom..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full border rounded px-3 py-1 pl-10 focus:ring-2 focus:ring-blue-500"
      />
      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
    </div>
  </div>

  {/* Seuil de rupture */}
  <div>
    <label className="block text-sm text-gray-700 font-medium mb-1">Seuil de rupture</label>
    <input
      type="number"
      min={0}
      value={seuilRupture}
      onChange={(e) => setSeuilRupture(Number(e.target.value))}
      className="border rounded px-3 py-1 w-32"
    />
  </div>

  {/* Seuil de stock faible */}
  <div>
    <label className="block text-sm text-gray-700 font-medium mb-1">Seuil de stock faible</label>
    <input
      type="number"
      min={1}
      value={seuilFaible}
      onChange={(e) => setSeuilFaible(Number(e.target.value))}
      className="border rounded px-3 py-1 w-32"
    />
  </div>
</div>

      {/* Stocks Validés */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">Stocks Validés</h2>
      {filterStocks(validatedStocks).length === 0 ? (
        <p className="text-gray-500">Aucun stock validé trouvé.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200 mb-8">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Stock ID</th>
                <th className="px-4 py-3 text-left font-medium">Référence</th>
                <th className="px-4 py-3 text-left font-medium">Nom</th>
                <th className="px-4 py-3 text-left font-medium">Prix Vente (MAD)</th>
                <th className="px-4 py-3 text-left font-medium">Boutique Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filterStocks(validatedStocks).map(stock => (
                <tr key={stock.id} className={getRowClass(stock.quantity)}>
                  <td className="px-4 py-3">{stock.id}</td>
                  <td className="px-4 py-3">{stock.produit?.reference}</td>
                  <td className="px-4 py-3">{stock.produit?.name}</td>
                  <td className="px-4 py-3">{stock.produit?.price_sell?.toFixed(2)}</td>
                  <td className="px-4 py-3">{stock.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stocks Non Validés */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">Stocks Non Validés</h2>
      {filterStocks(nonValidatedStocks).length === 0 ? (
        <p className="text-gray-500">Aucun stock non validé trouvé.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Stock ID</th>
                <th className="px-4 py-3 text-left font-medium">Référence</th>
                <th className="px-4 py-3 text-left font-medium">Nom</th>
                <th className="px-4 py-3 text-left font-medium">Prix Vente (MAD)</th>
                <th className="px-4 py-3 text-left font-medium">Boutique Stock</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filterStocks(nonValidatedStocks).map(stock => (
                <tr key={stock.id} className={getRowClass(stock.quantity)}>
                  <td className="px-4 py-3">{stock.id}</td>
                  <td className="px-4 py-3">{stock.produit?.reference}</td>
                  <td className="px-4 py-3">{stock.produit?.name}</td>
                  <td className="px-4 py-3">{stock.produit?.price_sell?.toFixed(2)}</td>
                  <td className="px-4 py-3">{stock.quantity}</td>
                  <td className="px-4 py-3">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      onClick={() => handleValiderStock(stock.id)}
                      disabled={updatingStockId === stock.id}
                    >
                      {updatingStockId === stock.id ? 'Validation...' : 'Valider'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MonStock;
