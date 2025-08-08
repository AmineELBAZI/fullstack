import api from './api';

const mockUtilisateurs = [
  {
    id: 1,
    name: 'Administrateur',
    email: 'admin@stock.com',
    role: 'admin',
    pointVenteId: null,
    active: true,
    createdAt: '2024-01-10T08:00:00Z'
  },
  {
    id: 2,
    name: 'Vendeur Centre-Ville',
    email: 'seller@stock.com',
    role: 'seller',
    pointVenteId: 1,
    active: true,
    createdAt: '2024-01-11T10:30:00Z'
  },
  {
    id: 3,
    name: 'Vendeur Maarif',
    email: 'seller2@stock.com',
    role: 'seller',
    pointVenteId: 2,
    active: true,
    createdAt: '2024-01-12T15:45:00Z'
  },
  {
    id: 4,
    name: 'Vendeur Ain Borja',
    email: 'seller3@stock.com',
    role: 'seller',
    pointVenteId: 3,
    active: false,
    createdAt: '2024-01-13T09:20:00Z'
  }
];

export const utilisateurApi = {
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockUtilisateurs });
      }, 400);
    });
  },

  create: async (utilisateur) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          ...utilisateur,
          id: Math.max(...mockUtilisateurs.map(u => u.id)) + 1,
          createdAt: new Date().toISOString()
        };
        mockUtilisateurs.push(newUser);
        resolve({ data: newUser });
      }, 500);
    });
  },

  update: async (id, utilisateur) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockUtilisateurs.findIndex(u => u.id === parseInt(id));
        if (index !== -1) {
          mockUtilisateurs[index] = { ...mockUtilisateurs[index], ...utilisateur };
          resolve({ data: mockUtilisateurs[index] });
        }
      }, 500);
    });
  },

  toggleActive: async (id, active) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockUtilisateurs.findIndex(u => u.id === parseInt(id));
        if (index !== -1) {
          mockUtilisateurs[index].active = active;
          resolve({ data: mockUtilisateurs[index] });
        }
      }, 300);
    });
  },

  delete: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockUtilisateurs.findIndex(u => u.id === parseInt(id));
        if (index !== -1) {
          mockUtilisateurs.splice(index, 1);
        }
        resolve({ data: { success: true } });
      }, 300);
    });
  }
};