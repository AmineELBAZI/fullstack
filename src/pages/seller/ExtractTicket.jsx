import React, { useEffect, useState } from 'react';
import PointsVenteApi from '../../API/PointsVenteApi';
import { Package, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { venteApi } from '../../API/venteApi'; // ✅ Import new API

const ExtractTicket = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState(0);

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

  const handleExportTicket = async (stockId) => {
    try {
      await venteApi.printTicket(stockId);
      toast.success("Ticket envoyé à l'imprimante ✅");
    } catch (error) {
      console.error("Erreur impression:", error);
      toast.error("Impossible d'envoyer le ticket à l'imprimante.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 text-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Exporter Tiqé</h1>
        <button
          onClick={() => setReloadTrigger(prev => prev + 1)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Liste en cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stocks.map(stock => (
          <div
            key={stock.id}
            className="bg-white shadow-lg rounded-xl border border-gray-200 p-5 flex flex-col justify-between"
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {stock.produit?.name}
                </p>
                <p className="text-sm text-gray-500">
                  Réf: {stock.produit?.reference}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Prix Achat: <span className="font-medium">{stock.produit?.price_buy?.toFixed(2)} MAD</span>
              </p>
              <p className="text-sm text-gray-500">
                Prix Vente: <span className="font-medium">{stock.produit?.price_sell?.toFixed(2)} MAD</span>
              </p>
            </div>

            {/* Bouton export */}
            <button
              onClick={() => handleExportTicket(stock.id)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
            >
              Exporter Tiqé
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtractTicket;
