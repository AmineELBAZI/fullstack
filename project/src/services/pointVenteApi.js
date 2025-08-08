import api from './api';

const mockPointsVente = [
  {
    id: 1,
    nom: 'Magasin Centre-Ville',
    adresse: '123 Rue Hassan II, Casablanca',
    createdAt: '2024-01-10T08:00:00Z'
  },
  {
    id: 2,
    nom: 'Succursale Maarif',
    adresse: '456 Boulevard Zerktouni, Casablanca',
    createdAt: '2024-01-11T10:30:00Z'
  },
  {
    id: 3,
    nom: 'Point de Vente Ain Borja',
    adresse: '789 Avenue Moulay Youssef, Casablanca',
    createdAt: '2024-01-12T15:45:00Z'
  }
];

export const pointVenteApi = {
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockPointsVente });
      }, 400);
    });
  },

  create: async (pointVente) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPoint = {
          ...pointVente,
          id: Math.max(...mockPointsVente.map(p => p.id)) + 1,
          createdAt: new Date().toISOString()
        };
        mockPointsVente.push(newPoint);
        resolve({ data: newPoint });
      }, 500);
    });
  },

  update: async (id, pointVente) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockPointsVente.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
          mockPointsVente[index] = { ...mockPointsVente[index], ...pointVente };
          resolve({ data: mockPointsVente[index] });
        }
      }, 500);
    });
  },

  delete: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockPointsVente.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
          mockPointsVente.splice(index, 1);
        }
        resolve({ data: { success: true } });
      }, 300);
    });
  }
};