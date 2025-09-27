import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, Shield, User, Eye, EyeOff } from 'lucide-react';
import { userApi } from '../API/userApi';
import pointVenteApi from '../API/PointsVenteApi';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Utilisateurs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'VENDEUR',
    boutique: null,
    active: true,
  });

  const queryClient = useQueryClient();

  const { data: utilisateurs = [], isLoading } = useQuery({
    queryKey: ['utilisateurs'],
    queryFn: () => userApi.getAll().then(res => res.data),
  });

  const { data: pointsVente = [] } = useQuery({
    queryKey: ['points-vente'],
    queryFn: () => pointVenteApi.getAllPointsVente().then(res => res.data),
  });

  const createMutation = useMutation(userApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(['utilisateurs']);
      toast.success('Utilisateur créé avec succès');
      handleCloseModal();
      setFormErrors({});
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "Erreur lors de la création de l'utilisateur";
      if (message.includes('Username')) {
        setFormErrors({ username: message });
      } else {
        toast.error(message);
      }
    },
  });

  const updateMutation = useMutation(({ id, ...data }) => userApi.update(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries(['utilisateurs']);
      toast.success('Utilisateur modifié avec succès');
      handleCloseModal();
      setFormErrors({});
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "Erreur lors de la modification de l'utilisateur";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation(userApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['utilisateurs']);
      toast.success('Utilisateur supprimé avec succès');
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de l'utilisateur");
    }
  });

  const filteredUsers = utilisateurs.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (user = null) => {
    setFormErrors({});
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '',
        role: user.role,
        boutique: user.boutique || null,
        active: true,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        role: 'VENDEUR',
        boutique: null,
        active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setShowPassword(false);
    setFormErrors({});
    setFormData({
      username: '',
      password: '',
      role: 'VENDEUR',
      boutique: null,
      active: true,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const userData = { ...formData };

    if (editingUser && !userData.password) {
      delete userData.password;
    }

    if (userData.role === 'VENDEUR') {
      if (!userData.boutique || !userData.boutique.id) {
        toast.error('Le vendeur doit être associé à une boutique.');
        return;
      }
      userData.boutique = { id: userData.boutique.id };
    } else {
      userData.boutique = null;
    }

    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, ...userData });
    } else {
      createMutation.mutate(userData);
    }
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      deleteMutation.mutate(id);
    }
  };

  const getRoleIcon = (role) => (role === 'ADMIN' ? Shield : User);

  const getRoleColor = (role) =>
    role === 'ADMIN' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600">Gérez les comptes administrateurs et vendeurs</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* === Updated grid with 4 columns and split ADMIN / VENDEUR === */}
      {(() => {
        const admins = filteredUsers.filter(u => u.role === 'ADMIN');
        const vendeurs = filteredUsers.filter(u => u.role === 'VENDEUR');

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...admins, ...vendeurs].map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              const pointVente = pointsVente.find(p => user.boutique && p.id === user.boutique.id);

              return (
                <div
                  key={user.id}
                  className="bg-white rounded-xl shadow-sm border-2 p-6 transition-all border-gray-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getRoleColor(user.role)}`}>
                        <RoleIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.username}</h3>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Rôle:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                        {user.role === 'ADMIN' ? 'Administrateur' : 'Vendeur'}
                      </span>
                    </div>
                    {user.role === 'VENDEUR' && pointVente && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Boutique:</span>
                        <span className="text-sm font-medium text-gray-900">{pointVente.nom}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun utilisateur trouvé</p>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingUser ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              required
              value={formData.username}
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value });
                setFormErrors({ ...formErrors, username: null });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: jean.dupont"
            />
            {formErrors.username && (
              <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required={!editingUser}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Rôle
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => {
                const role = e.target.value;
                setFormData((f) => ({
                  ...f,
                  role,
                  boutique: role === 'VENDEUR' ? f.boutique : null,
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="VENDEUR">Vendeur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          {/* Boutique */}
          {formData.role === 'VENDEUR' && (
            <div>
              <label htmlFor="boutique" className="block text-sm font-medium text-gray-700 mb-2">
                Boutique assignée
              </label>
              <select
                id="boutique"
                required
                value={formData.boutique?.id || ''}
                onChange={(e) => {
                  const boutiqueId = e.target.value;
                  const boutiqueObj = boutiqueId ? { id: parseInt(boutiqueId, 10) } : null;
                  setFormData((f) => ({ ...f, boutique: boutiqueObj }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionnez une boutique</option>
                {pointsVente.map((point) => (
                  <option key={point.id} value={point.id}>
                    {point.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button
              type="submit"
              loading={createMutation.isLoading || updateMutation.isLoading}
            >
              {editingUser ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Utilisateurs;
