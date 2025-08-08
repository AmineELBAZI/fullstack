import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, MapPin, Store } from 'lucide-react';
import PointsVenteApi from '../API/PointsVenteApi';
import { produitApi } from '../API/produitApi';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../context/apiErrorParser';

const PointsVente = () => {
  const queryClient = useQueryClient();

  const [showBoutiqueModal, setShowBoutiqueModal] = useState(false);
  const [editingBoutique, setEditingBoutique] = useState(null);
  const [boutiqueForm, setBoutiqueForm] = useState({ nom: '', adresse: '' });
  const [formErrors, setFormErrors] = useState({ nom: '', adresse: '' });

  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState(null);
  const [showProduitModal, setShowProduitModal] = useState(false);
  const [produitsEnRupture, setProduitsEnRupture] = useState([]);
  const [selectedProduitId, setSelectedProduitId] = useState(null);
  const [selectedProduit, setSelectedProduit] = useState(null); // NEW: to track selected product object
  const [selectedProduitQuantity, setSelectedProduitQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); // Ajoute ceci en haut dans les useState

  const {
    data: boutiques = [],
    isLoading: loadingBoutiques,
    error: errorBoutiques,
  } = useQuery({
    queryKey: ['pointsVente'],
    queryFn: () => PointsVenteApi.getAllPointsVente().then(res => res.data),
  });

  const createBoutiqueMutation = useMutation({
    mutationFn: PointsVenteApi.createPointVente,
    onSuccess: () => {
      queryClient.invalidateQueries(['pointsVente']);
      toast.success('Point de vente créé');
      setShowBoutiqueModal(false);
      setFormErrors({});
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Erreur lors de la création");
      if (message.toLowerCase().includes('nom')) {
        setFormErrors({ nom: message });
      } else if (message.toLowerCase().includes('adresse')) {
        setFormErrors({ adresse: message });
      } else {
        toast.error(message);
      }
    },
  });

  const updateBoutiqueMutation = useMutation({
    mutationFn: ({ id, data }) => PointsVenteApi.updatePointVente(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pointsVente']);
      toast.success('Point de vente modifié');
      setShowBoutiqueModal(false);
      setFormErrors({});
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Erreur lors de la modification");
      if (message.toLowerCase().includes('nom')) {
        setFormErrors({ nom: message });
      } else if (message.toLowerCase().includes('adresse')) {
        setFormErrors({ adresse: message });
      } else {
        toast.error(message);
      }
    },
  });

  const deleteBoutiqueMutation = useMutation({
    mutationFn: PointsVenteApi.deletePointVente,
    onSuccess: () => {
      queryClient.invalidateQueries(['pointsVente']);
      toast.success('Point de vente supprimé');
      setSelectedBoutiqueId(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Erreur suppression"));
    },
  });

  const createProduitMutation = useMutation({
    mutationFn: ({ boutiqueId, produitId, quantity }) =>
      PointsVenteApi.ajouterProduit(boutiqueId, { produitId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pointsVente']);
      toast.success('Produit ajouté');
      setShowProduitModal(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Erreur lors de l'ajout du produit."));
    },
  });

  const deleteProduitMutation = useMutation({
    mutationFn: ({ boutiqueId, produitId }) =>
      PointsVenteApi.supprimerProduit(boutiqueId, produitId),
    onSuccess: () => {
      queryClient.invalidateQueries(['pointsVente']);
      toast.success('Produit supprimé');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Erreur suppression produit"));
    },
  });

  const openBoutiqueModal = (boutique = null) => {
    setFormErrors({});
    if (boutique) {
      setEditingBoutique(boutique);
      setBoutiqueForm({ nom: boutique.nom, adresse: boutique.adresse });
    } else {
      setEditingBoutique(null);
      setBoutiqueForm({ nom: '', adresse: '' });
    }
    setShowBoutiqueModal(true);
  };

  const closeBoutiqueModal = () => {
    setShowBoutiqueModal(false);
    setEditingBoutique(null);
    setFormErrors({});
  };

  const openProduitModal = (boutiqueId) => {
    setSelectedBoutiqueId(boutiqueId);
    setSelectedProduitId(null);
    setSelectedProduit(null);
    setSelectedProduitQuantity(1);
    setShowProduitModal(true);

    produitApi.getEnRupture()
      .then(res => setProduitsEnRupture(res.data))
      .catch(() => toast.error("Erreur chargement produits disponibles"));
  };

  const closeProduitModal = () => {
    setShowProduitModal(false);
    setSelectedProduitId(null);
    setSelectedProduit(null);
    setSelectedProduitQuantity(1);
  };

  const handleBoutiqueSubmit = (e) => {
    e.preventDefault();
    if (editingBoutique) {
      updateBoutiqueMutation.mutate({ id: editingBoutique.id, data: boutiqueForm });
    } else {
      createBoutiqueMutation.mutate(boutiqueForm);
    }
  };

  const handleProduitSubmit = (e) => {
    e.preventDefault();

    if (!selectedBoutiqueId || !selectedProduitId || !selectedProduit) {
      toast.error("Veuillez sélectionner un produit.");
      return;
    }

    if (selectedProduitQuantity <= 0) {
      toast.error("Veuillez saisir une quantité valide.");
      return;
    }

    if (selectedProduitQuantity > selectedProduit.quantityStock) {
      toast.error("Quantité demandée supérieure au stock disponible.");
      return;
    }

    createProduitMutation.mutate({
      boutiqueId: selectedBoutiqueId,
      produitId: selectedProduitId,
      quantity: selectedProduitQuantity,
    });
  };

  const handleDeleteBoutique = (id) => {
    const storedPassword = localStorage.getItem('password');

    if (!storedPassword) {
      toast.error("Aucun mot de passe enregistré.");
      return;
    }

    const inputPassword = window.prompt(
      "Pour confirmer la suppression, veuillez entrer votre mot de passe administrateur :"
    );

    if (!inputPassword) {
      toast.error("Suppression annulée.");
      return;
    }

    if (inputPassword !== storedPassword) {
      toast.error("Mot de passe incorrect.");
      return;
    }

    const confirmMessage = "Supprimer ce point de vente ?\n\nLes quantités de stock associées seront réintégrées au stock général des produits.";
    if (window.confirm(confirmMessage)) {
      deleteBoutiqueMutation.mutate(id);
    }
  };


  const handleDeleteProduit = (boutiqueId, produitId) => {
    if (window.confirm('Supprimer ce produit ?')) {
      deleteProduitMutation.mutate({ boutiqueId, produitId });
    }
  };

  if (loadingBoutiques) return <LoadingSpinner size="lg" />;
  if (errorBoutiques) return <div className="text-red-500 text-center py-6">Erreur chargement</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Points de vente</h1>
          <p className="text-gray-500">Gérez vos points de vente</p>
        </div>
        <Button onClick={() => openBoutiqueModal()}>
          <Plus className="w-4 h-4 mr-2" /> Ajouter un point de vente
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {boutiques.map(boutique => (
          <div
            key={boutique.id}
            className="bg-gradient-to-br from-white via-sky-50 to-slate-100 border border-gray-200 rounded-2xl shadow-xl p-5 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Store className="w-6 h-6 text-sky-700" />
                  <h2 className="text-lg font-semibold text-sky-800">{boutique.nom}</h2>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1 text-emerald-600" />
                  {boutique.adresse}
                </div>
                <span className="inline-block text-xs bg-orange-100 text-orange-700 font-medium px-2 py-0.5 rounded-full">
                  {boutique.stocks?.length ?? 0} produit{(boutique.stocks?.length ?? 0) > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => openBoutiqueModal(boutique)} title="Modifier">
                  <Edit className="w-5 h-5 text-blue-500 hover:text-blue-700 transition" />
                </button>
                <button onClick={() => handleDeleteBoutique(boutique.id)} title="Supprimer">
                  <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700 transition" />
                </button>
              </div>
            </div>

            <div className="mt-4 bg-white rounded-xl shadow-inner p-4">
              <Button className="mt-3" size="sm" onClick={() => openProduitModal(boutique.id)}>
                Ajouter un produit
              </Button>
              <h3 className="font-medium text-gray-700 mb-2">Produits</h3>
              {(!boutique.stocks || boutique.stocks.length === 0) ? (
                <p className="text-sm text-gray-400">Aucun produit</p>
              ) : (
                <div className="max-h-56 overflow-y-auto hide-scrollbar space-y-2">
                  <ul>
                    {boutique.stocks.map(stock => (
                      stock.produit && (
                        <li key={stock.id} className="flex justify-between items-start bg-gray-50 border border-orange-200 p-3 rounded-xl shadow-sm">
                          <div className="text-sm text-gray-700 space-y-1">
                            <div className="font-semibold text-gray-800">{stock.produit.name}</div>
                            <div className="text-sm">
                              État :{" "}
                              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full
                                ${stock.status === 'VALIDATED' ? 'bg-green-100 text-green-700' :
                                  stock.status === 'NOT_VALIDATED' ? 'bg-red-100 text-red-700' :
                                    'bg-red-300 text-red-700'}`}>
                                {stock.status === 'VALIDATED' ? 'Validé' :
                                  stock.status === 'NOT_VALIDATED' ? 'Non validé' : stock.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">Réf: {stock.produit.reference}</div>
                            <div className="text-sm text-green-600">{stock.produit.price_sell} MAD</div>
                            <div className="text-sm">Qté en boutique: {stock.quantity}</div>
                          </div>

                          <button onClick={() => handleDeleteProduit(boutique.id, stock.produit.id)} title="Supprimer produit">
                            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                          </button>
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              )}
            
            </div>
          </div>
        ))}
      </div>

      {/* Modal Boutique */}
      <Modal isOpen={showBoutiqueModal} onClose={closeBoutiqueModal} title={editingBoutique ? 'Modifier' : 'Créer'}>
        <form onSubmit={handleBoutiqueSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Nom</label>
            <input
              required
              value={boutiqueForm.nom}
              onChange={e => setBoutiqueForm({ ...boutiqueForm, nom: e.target.value })}
              className={`w-full border px-3 py-2 rounded ${formErrors.nom ? 'border-red-500' : ''}`}
            />
            {formErrors.nom && <p className="mt-1 text-sm text-red-600">{formErrors.nom}</p>}
          </div>
          <div>
            <label className="block font-medium">Adresse</label>
            <textarea
              required
              value={boutiqueForm.adresse}
              onChange={e => setBoutiqueForm({ ...boutiqueForm, adresse: e.target.value })}
              className={`w-full border px-3 py-2 rounded ${formErrors.adresse ? 'border-red-500' : ''}`}
            />
            {formErrors.adresse && <p className="mt-1 text-sm text-red-600">{formErrors.adresse}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeBoutiqueModal}>Annuler</Button>
            <Button type="submit">{editingBoutique ? 'Modifier' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Produit */}
      <Modal isOpen={showProduitModal} onClose={closeProduitModal} title="Ajouter un produit">
        <form onSubmit={handleProduitSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Sélectionnez un produit</label>
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => {
                const inputValue = e.target.value;
                setSearchTerm(inputValue);

                const matched = produitsEnRupture.find(p =>
                  p.name.toLowerCase() === inputValue.toLowerCase()
                );

                if (matched) {
                  setSelectedProduit(matched);
                  setSelectedProduitId(matched.id);
                } else {
                  setSelectedProduit(null);
                  setSelectedProduitId(null);
                }
              }}
              className="w-full border px-3 py-2 rounded"
              list="produits-list"
              required
            />
            <datalist id="produits-list">
              {produitsEnRupture.map(prod => (
                <option key={prod.id} value={prod.name}>
                  {prod.name} - Réf: {prod.reference} - {prod.price_sell} MAD - Stock: {prod.quantityStock}
                </option>
              ))}
            </datalist>
          </div>



          <div>
            <label className="block font-medium">Quantité</label>
            <input
              type="number"
              min="1"
              value={selectedProduitQuantity}
              onChange={e => setSelectedProduitQuantity(Number(e.target.value))}
              required
              className="w-full border px-3 py-2 rounded"
            />
            {selectedProduit && (
              <p className="text-sm text-gray-500">
                Stock disponible : {selectedProduit.quantityStock}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeProduitModal}>Annuler</Button>
            <Button type="submit">Ajouter</Button>
          </div>
        </form>
      </Modal>

      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
    </div>
  );
};

export default PointsVente;
