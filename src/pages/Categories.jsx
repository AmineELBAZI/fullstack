import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categorieApi } from '../API/CategorieApi';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Categories = ({ onSelectCategorie }) => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categorieApi.getAll().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: categorieApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Catégorie créée');
      handleCloseModal();
    },
    onError: () => toast.error('Erreur création catégorie'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => categorieApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Catégorie mise à jour');
      handleCloseModal();
    },
    onError: () => toast.error('Erreur mise à jour catégorie'),
  });

  const deleteMutation = useMutation({
    mutationFn: categorieApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Catégorie supprimée');
    },
    onError: () => toast.error('Erreur lors de la suppression de la catégorie : Pour supprimer une catégorie, celle-ci ne doit être liée à aucun produit.'),
  });

  const [showModal, setShowModal] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState(null);
  const [formData, setFormData] = useState({ nom: '' });

  const handleOpenModal = (categorie = null) => {
    if (categorie) {
      setEditingCategorie(categorie);
      setFormData({ nom: categorie.nom });
    } else {
      setEditingCategorie(null);
      setFormData({ nom: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategorie(null);
    setFormData({ nom: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategorie) {
      updateMutation.mutate({ id: editingCategorie.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur chargement catégories</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold ">Catégories</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" /> Nouvelle catégorie
        </Button>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-xl p-6 border border-gray-200">
        <table className="w-full table-auto rounded overflow-hidden">
          <thead>
            <tr className="text-left text-blue-700 ">
              <th className="p-3">Nom</th>
              <th className="p-3">Nombre de Produits</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((categorie) => (
              <tr
                key={categorie.id}
                className="hover:bg-indigo-50 transition cursor-pointer border-b"
                onClick={() => onSelectCategorie(categorie.id)}
              >
                <td className="p-3 text-gray-800 font-medium">{categorie.nom}</td>
                <td className="p-3 text-gray-600">
                  {categorie.produits ? categorie.produits.length : 0}
                </td>
                <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="inline-flex space-x-2">
                    <a  onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(categorie);
                      className="bg-blue-500 hover:bg-blue-600 text-white border border-blue-700 hover:border-blue-900 transition-all duration-200"
                      }} >
                      
                    
                      <Edit className=" p-1  text-gray-400 hover:text-blue-600 hover:bg-blue-200 rounded-lg transition-colors" /> 
                    </a>
                    <a
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `Supprimer la catégorie "${categorie.nom}" ?`
                          )
                        ) {
                          deleteMutation.mutate(categorie.id);
                        }
                      }}
                      className="     transition-all duration-200"
                    >
                      <Trash2 className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-200 rounded-lg transition-colors" /> 
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingCategorie ? 'Modifier Catégorie' : 'Nouvelle Catégorie'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Nom</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ nom: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button
              type="submit"
              loading={createMutation.isLoading || updateMutation.isLoading}
            >
              {editingCategorie ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
