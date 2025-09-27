import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, X } from 'lucide-react';
import { venteApi } from '../../API/venteApi';
import PointsVenteApi from '../../API/PointsVenteApi';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const EnregistrerVente = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const boutiqueId = user?.boutiqueId || null;

  const [formItems, setFormItems] = useState([
    { stockId: '', quantite: 0, prixApplique: 0, nomProduit: '' }
  ]);

  const [boutiqueInfo, setBoutiqueInfo] = useState({ nom: '', adresse: '' });

  const [produitFiniData, setProduitFiniData] = useState({
    bouteilleId: '',
    bouteilleText: '',
    huileId: '',
    huileText: '',
    alcoolId: '',
    alcoolText: '',
    montantTotal: 0,
    taille: '',  // <-- use empty string, not 0
  });

  // Modal states for normal ventes
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [venteToConfirm, setVenteToConfirm] = useState(null);

  // Modal states for produit fini ventes
  const [showConfirmProduitFiniModal, setShowConfirmProduitFiniModal] = useState(false);
  const [produitFiniToConfirm, setProduitFiniToConfirm] = useState(null);

  // New state: max quantity limit selected by user (default to 999999999)
  const [maxQuantityLimit, setMaxQuantityLimit] = useState(999999999);

  const queryClient = useQueryClient();

  const { data: stocks = [], isLoading } = useQuery({
    queryKey: ['stocks-boutique', boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return [];
      const res = await PointsVenteApi.getPointVenteById(boutiqueId);

      setBoutiqueInfo({
        nom: res.data?.nom || '',
        adresse: res.data?.adresse || ''
      });

      return (res.data?.stocks || []).filter(
        stock => stock.status === 'VALIDATED' && stock.quantity > 0
      );
    },
    enabled: !!boutiqueId,
  });

  const createMutation = useMutation({
    mutationFn: venteApi.createMultiple,
    onSuccess: () => {
      queryClient.invalidateQueries(['stocks-boutique', boutiqueId]);
      toast.success('Vente enregistrée avec succès');
      setFormItems([{ stockId: '', quantite: 0, prixApplique: 0, nomProduit: '' }]);
    },
    onError: (error) => {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Erreur lors de l'enregistrement de la vente";
      toast.error(backendMessage);
    },
  });

  const createProduitFiniMutation = useMutation({
    mutationFn: venteApi.createProduitFini,
    onSuccess: () => {
      queryClient.invalidateQueries(['stocks-boutique', boutiqueId]);
      toast.success('Produit fini vendu avec succès');
      setProduitFiniData({
        bouteilleId: '',
        bouteilleText: '',
        huileId: '',
        huileText: '',
        alcoolId: '',
        alcoolText: '',
        taille: '',  // Reset taille to empty string
        montantTotal: 0,
      });
      setShowConfirmProduitFiniModal(false);
      setProduitFiniToConfirm(null);
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Erreur lors de la vente du produit fini";
      toast.error(message);
    },
  });

  // Normal vente submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!boutiqueId) {
      return toast.error("Boutique ID introuvable. Veuillez vous reconnecter.");
    }

    for (const item of formItems) {
      if (!item.stockId) return toast.error("Veuillez sélectionner un produit.");
      if (item.quantite <= 0) return toast.error("Quantité invalide.");
      const stock = stocks.find(s => s.id === parseInt(item.stockId));
      const maxAllowed = Math.min(stock?.quantity || 0, maxQuantityLimit);
      if (!stock || item.quantite > maxAllowed) {
        return toast.error(`Stock insuffisant ou quantité dépasse la limite autorisée pour le produit ${stock?.produit?.name || ''}.`);
      }
    }

    const produits = formItems.map(item => {
      const stock = stocks.find(s => s.id === parseInt(item.stockId));
      const produit = stock.produit;
      return {
        id: produit.id,
        reference: produit.reference,
        name: produit.name,
        price_buy: produit.price_buy,
        price_sell: item.prixApplique,
        quantityStock: item.quantite
      };
    });

    const totalMontant = produits.reduce((acc, p) => acc + (p.price_sell * p.quantityStock), 0);

    const venteData = {
      boutique: {
        id: boutiqueId,
        nom: boutiqueInfo.nom,
        adresse: boutiqueInfo.adresse
      },
      produits
    };

    setVenteToConfirm({ venteData, totalMontant });
    setShowConfirmModal(true);
  };

  // Confirm normal vente
  const confirmVente = () => {
    createMutation.mutate(venteToConfirm.venteData, {
      onSuccess: () => {
        setShowConfirmModal(false);
        setVenteToConfirm(null);
      }
    });
  };

  // Confirm produit fini vente
  const handleProduitFiniSubmit = () => {
    if (!boutiqueId) {
      return toast.error("Boutique ID introuvable. Veuillez vous reconnecter.");
    }
    if (
      !produitFiniData.bouteilleId ||
      !produitFiniData.huileId ||
      !produitFiniData.alcoolId ||
      produitFiniData.montantTotal <= 0 ||
      !produitFiniData.taille // <-- check taille is not empty
    ) {
      return toast.error("Veuillez remplir tous les champs du produit fini.");
    }

    const produitFiniPayload = {
      boutiqueId,
      bouteilleId: parseInt(produitFiniData.bouteilleId),
      taille: parseInt(produitFiniData.taille),
      huileId: parseInt(produitFiniData.huileId),
      alcoolId: parseInt(produitFiniData.alcoolId),
      montantTotal: produitFiniData.montantTotal,

    };

    setProduitFiniToConfirm(produitFiniPayload);
    setShowConfirmProduitFiniModal(true);
  };

  const confirmProduitFiniVente = () => {
    createProduitFiniMutation.mutate(produitFiniToConfirm);
  };

  // Add/remove/update handlers for normal vente
  const addNewItem = () => {
    setFormItems([...formItems, { stockId: '', quantite: 0, prixApplique: 0, nomProduit: '' }]);
  };

  const removeItem = (index) => {
    const updated = [...formItems];
    updated.splice(index, 1);
    setFormItems(updated);
  };

  const updateItem = (index, key, value) => {
    const updated = [...formItems];
    updated[index][key] = value;
    setFormItems(updated);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* --- Normal Vente Form --- */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Enregistrer une vente </h1>



        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border">
          <h2 className="text-xl font-bold text-blue-700">Vendre un ou plusieurs produits</h2>
          {formItems.map((item, index) => {
            const selectedStock = stocks.find(
              s => s.produit?.name.toLowerCase() === (item.nomProduit || '').toLowerCase()
            );
            const stockQuantity = selectedStock?.quantity || 0;
            const maxQuantity = Math.min(stockQuantity, maxQuantityLimit);

            return (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end border-b pb-4 mb-4">
                <div>
                  <label className="block text-sm font-medium">Nom du produit</label>
                  <input
                    type="text"
                    placeholder="Rechercher un produit"
                    value={item.nomProduit || ''}
                    onChange={(e) => {
                      const nom = e.target.value;
                      const matchedStock = stocks.find(stock =>
                        stock.produit?.name.toLowerCase().includes(nom.toLowerCase())
                      );
                      updateItem(index, 'nomProduit', nom);
                      updateItem(index, 'stockId', matchedStock ? matchedStock.id : '');
                      updateItem(index, 'prixApplique', matchedStock?.produit?.price_sell || 0);
                      updateItem(index, 'quantite', 0);
                    }}
                    list={`produits-list-${index}`}
                    className="w-full border p-2 rounded"
                    required
                  />
                  <datalist id={`produits-list-${index}`}>
                    {stocks.map(stock => (
                      <option key={stock.id} value={stock.produit?.name}>
                        {stock.produit?.name} — Qté: {stock.quantity}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium">Quantité</label>
                  <input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    required
                    value={item.quantite}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        updateItem(index, 'quantite', val);
                      } else {
                        updateItem(index, 'quantite', 0); // or ''
                      }
                    }}

                    className="w-full border p-2 rounded"
                  />
                  {item.quantite > maxQuantity && (
                    <p className="text-sm text-red-600 mt-1">
                      Max: {maxQuantity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">Prix unitaire (MAD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={item.prixApplique}
                    onChange={(e) =>
                      updateItem(index, 'prixApplique', parseFloat(e.target.value) || 0)
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>

                {formItems.length > 1 && (
                  <div className="col-span-full flex justify-end">
                    <button
                      type="button"
                      className="text-red-500 text-sm"
                      onClick={() => removeItem(index)}
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <div>
            <Button type="button" onClick={addNewItem} className="text-blue-600 text-sm">
              + Ajouter un autre produit
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
            loading={createMutation.isLoading}
            disabled={formItems.some(item =>
              !item.stockId ||
              item.quantite <= 0 ||
              item.quantite > Math.min(
                (stocks.find(s => s.id === parseInt(item.stockId))?.quantity || 0),
                maxQuantityLimit
              )
            )}
          >
            <ShoppingCart className="mr-2" />
            Enregistrer les ventes
          </Button>
        </form>
      </div>

      {/* --- Produit Fini Vente Form --- */}
      <div className="space-y-4 bg-white p-6 rounded-xl border">
        <h2 className="text-xl font-bold text-blue-700">Vendre un produit fini</h2>

        <div>
          <label className="block text-sm font-medium">Taille de la bouteille</label>
          <select
            value={produitFiniData.taille}
            onChange={(e) =>
              setProduitFiniData({ ...produitFiniData, taille: e.target.value })
            }
            className="w-full border p-2 rounded"
            required
          >
            <option value="" disabled>Choisir la taille</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['bouteille', 'huile', 'alcool'].map((field) => {
            const idField = `${field}Id`;
            const textField = `${field}Text`;

            return (
              <div key={field}>
                <label className="block text-sm font-medium capitalize">{field}</label>
                <input
                  type="text"
                  placeholder={`Rechercher un produit pour ${field}`}
                  value={produitFiniData[textField]}
                  onChange={(e) => {
                    const enteredValue = e.target.value;
                    const matchedStock = stocks.find(stock =>
                      stock.produit?.name.toLowerCase().includes(enteredValue.toLowerCase())
                    );

                    setProduitFiniData(prev => ({
                      ...prev,
                      [textField]: enteredValue,
                      [idField]: matchedStock ? matchedStock.produit?.id : '',
                    }));
                  }}
                  list={`produits-list-${field}`}
                  className="w-full border p-2 rounded"
                  required
                />
                <datalist id={`produits-list-${field}`}>
                  {stocks.map((stock) => (
                    <option key={stock.id} value={stock.produit?.name}>
                      {stock.produit?.name} — Stock: {stock.quantity}
                    </option>
                  ))}
                </datalist>
              </div>
            );
          })}
        </div>

        <div>
          <label className="block text-sm font-medium">Montant total (MAD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={produitFiniData.montantTotal}
            onChange={(e) =>
              setProduitFiniData({
                ...produitFiniData,
                montantTotal: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full border p-2 rounded"
          />
        </div>





        <Button
          type="button"
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
          loading={createProduitFiniMutation.isLoading}
          disabled={
            !produitFiniData.bouteilleId ||
            !produitFiniData.huileId ||
            !produitFiniData.alcoolId ||
            produitFiniData.montantTotal <= 0 ||
            !produitFiniData.taille
          }

          onClick={handleProduitFiniSubmit}
        >
          <ShoppingCart className="mr-2" />
          Vendre produit fini
        </Button>
      </div>

      {/* --- Confirmation Modal for Normal Vente --- */}
      {showConfirmModal && venteToConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">Confirmer la vente</h2>

            <div className="max-h-64 overflow-auto mb-4 border p-2 rounded">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left">Produit</th>
                    <th className="text-right">Quantité</th>
                    <th className="text-right">Prix Unitaire (MAD)</th>
                    <th className="text-right">Total (MAD)</th>
                  </tr>
                </thead>
                <tbody>
                  {venteToConfirm.venteData.produits.map((p, i) => (
                    <tr key={i} className="border-t">
                      <td>{p.name}</td>
                      <td className="text-right">{p.quantityStock}</td>
                      <td className="text-right">{p.price_sell.toFixed(2)}</td>
                      <td className="text-right">{(p.price_sell * p.quantityStock).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right font-semibold text-lg mb-4">
              Montant Total: {venteToConfirm.totalMontant.toFixed(2)} MAD
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                Annuler
              </Button>
              <Button
                onClick={confirmVente}
                loading={createMutation.isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                Accepté
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- Confirmation Modal for Produit Fini Vente --- */}
      {showConfirmProduitFiniModal && produitFiniToConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowConfirmProduitFiniModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowConfirmProduitFiniModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">Confirmer la vente du produit fini</h2>

            <div className="mb-4 space-y-2">
              <p><strong>Bouteille ID:</strong> {produitFiniToConfirm.bouteilleId}</p>
              <p><strong>Huile ID:</strong> {produitFiniToConfirm.huileId}</p>
              <p><strong>Alcool ID:</strong> {produitFiniToConfirm.alcoolId}</p>
              <p><strong>Taille:</strong> {produitFiniToConfirm.taille}</p>

              <p><strong>Montant Total:</strong> {produitFiniToConfirm.montantTotal.toFixed(2)} MAD</p>


            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setShowConfirmProduitFiniModal(false)}>
                Annuler
              </Button>
              <Button
                onClick={confirmProduitFiniVente}
                loading={createProduitFiniMutation.isLoading}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!produitFiniToConfirm.taille}  // Disable accept if no taille selected
              >
                Accepté
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EnregistrerVente;
