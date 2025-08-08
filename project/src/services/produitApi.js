import api from './api';

// Mock data for demonstration
const mockProduits = [
  {
    id: 1,
    nom: 'Huile d\'olive Extra Vierge',
    type: 'huile',
    unite: 'L',
    prixUnitaire: 85,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    nom: 'Whisky Premium',
    type: 'alcool',
    unite: 'mL',
    prixUnitaire: 0.12,
    createdAt: '2024-01-16T14:30:00Z'
  },
  {
    id: 3,
    nom: 'Farine de blé',
    type: 'cereale',
    unite: 'g',
    prixUnitaire: 0.008,
    createdAt: '2024-01-17T09:15:00Z'
  }
];

export const produitApi = {
  getAll: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockProduits });
      }, 500);
    });
  },

  getById: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const produit = mockProduits.find(p => p.id === parseInt(id));
        resolve({ data: produit });
      }, 300);
    });
  },

  create: async (produit) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProduit = {
          ...produit,
          id: Math.max(...mockProduits.map(p => p.id)) + 1,
          createdAt: new Date().toISOString()
        };
        mockProduits.push(newProduit);
        resolve({ data: newProduit });
      }, 500);
    });
  },

  update: async (id, produit) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockProduits.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
          mockProduits[index] = { ...mockProduits[index], ...produit };
          resolve({ data: mockProduits[index] });
        }
      }, 500);
    });
  },

  delete: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockProduits.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
          mockProduits.splice(index, 1);
        }
        resolve({ data: { success: true } });
      }, 300);
    });
  }
};