import api from './api';

const mockRapports = {
  chiffreAffaires: 15420.50,
  totalVentes: 127,
  produitsVendus: 45,
  venteMoyenne: 121.42,
  topProduits: [
    {
      nom: 'Huile d\'olive Extra Vierge',
      quantite: 25.5,
      chiffreAffaires: 2167.50
    },
    {
      nom: 'Whisky Premium',
      quantite: 1250,
      chiffreAffaires: 187.50
    },
    {
      nom: 'Farine de blé',
      quantite: 2000,
      chiffreAffaires: 16.00
    }
  ],
  topPointsVente: [
    {
      nom: 'Magasin Centre-Ville',
      totalVentes: 78,
      chiffreAffaires: 9850.25
    },
    {
      nom: 'Succursale Maarif',
      totalVentes: 32,
      chiffreAffaires: 3920.75
    },
    {
      nom: 'Point de Vente Ain Borja',
      totalVentes: 17,
      chiffreAffaires: 1649.50
    }
  ],
  ventesRecentes: [
    {
      date: '2024-01-22T14:30:00Z',
      produit: 'Huile d\'olive Extra Vierge',
      pointVente: 'Magasin Centre-Ville',
      quantite: 2.5,
      montant: 212.50
    },
    {
      date: '2024-01-22T13:15:00Z',
      produit: 'Whisky Premium',
      pointVente: 'Succursale Maarif',
      quantite: 750,
      montant: 112.50
    },
    {
      date: '2024-01-22T11:45:00Z',
      produit: 'Farine de blé',
      pointVente: 'Magasin Centre-Ville',
      quantite: 500,
      montant: 4.00
    }
  ]
};

export const rapportApi = {
  getAll: async (dateRange) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, this would filter data based on dateRange
        resolve({ data: mockRapports });
      }, 600);
    });
  }
};