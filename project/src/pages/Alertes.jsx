import React, { useEffect, useState } from 'react';
import { AlertTriangle, Package, RefreshCw } from 'lucide-react';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Alertes = () => {
  const [stocksFaibles, setStocksFaibles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAlertsFromSession = () => {
    const stored = sessionStorage.getItem('websocketAlerts');
    const alerts = stored ? JSON.parse(stored) : [];
    setStocksFaibles(alerts);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAlertsFromSession();
  }, []);

  const getAlertLevel = (quantity) => {
    if (quantity === 0) {
      return {
        level: 'critical',
        color: 'bg-red-100 border-red-300 text-red-800',
        icon: 'text-red-500',
        label: 'Rupture de stock'
      };
    } else if (quantity < 5) {
      return {
        level: 'high',
        color: 'bg-orange-100 border-orange-300 text-orange-800',
        icon: 'text-orange-500',
        label: 'Stock critique'
      };
    } else {
      return {
        level: 'medium',
        color: 'bg-amber-100 border-amber-300 text-amber-800',
        icon: 'text-amber-500',
        label: 'Stock faible'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleDeleteAlert = (alertToDelete) => {
    const updatedAlerts = stocksFaibles.filter(
      alert =>
        !(
          alert.produitName === alertToDelete.produitName &&
          alert.reference === alertToDelete.reference &&
          alert.boutiqueName === alertToDelete.boutiqueName
        )
    );
    setStocksFaibles(updatedAlerts);
    sessionStorage.setItem('websocketAlerts', JSON.stringify(updatedAlerts));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alertes de stock</h1>
          <p className="text-gray-600">Produits nécessitant un réapprovisionnement</p>
        </div>
        <Button variant="outline" onClick={loadAlertsFromSession}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ruptures de stock</p>
              <p className="text-2xl font-bold text-red-600">
                {stocksFaibles.filter(s => s.quantity === 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Stocks critiques</p>
              <p className="text-2xl font-bold text-orange-600">
                {stocksFaibles.filter(s => s.quantity > 0 && s.quantity < 5).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total alertes</p>
              <p className="text-2xl font-bold text-amber-600">{stocksFaibles.length}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 mb-1">À propos des alertes</h4>
            <p className="text-sm text-blue-700">
              Les alertes sont générées automatiquement pour les produits dont le stock est inférieur à 15 unités.
              Les niveaux d'alerte sont : Rupture (0), Critique (&lt;5), et Faible (&lt;10).
            </p>
          </div>
        </div>
      </div>
      {/* Alerts List */}
      <div className="space-y-4">
        {stocksFaibles.length > 0 ? (
          stocksFaibles
            .sort((a, b) => a.quantity - b.quantity)
            .map((stock, index) => {
              const alert = getAlertLevel(stock.quantity);
              return (
                <div
                  key={index}
                  className={`rounded-xl border-2 p-6 ${alert.color}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 bg-white rounded-lg ${alert.icon}`}>
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {stock.produitName}
                          </h3>
                          <span className="px-2 py-1 bg-white bg-opacity-50 rounded-full text-xs font-medium">
                            {alert.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Point de vente:</span>
                            <p>{stock.boutiqueName}</p>
                          </div>
                          <div>
                            <span className="font-medium">Quantité restante:</span>
                            <p className="font-semibold">{stock.quantity} unités</p>
                          </div>
                          <div>
                            <span className="font-medium">Référence produit:</span>
                            <p>{stock.reference}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* ❌ Delete button */}
                    <button
                      onClick={() => handleDeleteAlert(stock)}
                      className="ml-4 text-sm text-red-500 hover:text-red-700 font-medium"
                      title="Supprimer l'alerte"
                    >
                      ✕
                    </button>

                  </div>
                </div>
              );
            })
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <Package className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune alerte de stock
            </h3>
            <p className="text-gray-600">
              Tous vos stocks sont à des niveaux satisfaisants
            </p>
          </div>
        )}
      </div>


    </div>
  );
};

export default Alertes;
