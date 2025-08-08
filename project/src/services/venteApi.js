import api from './api';

const mockVentes = [
  {
    id: 1,
    produitId: 1,
    pointVenteId: 1,
    quantite: 2.5,
    prixApplique: 85,
    dateVente: '2024-01-22T10:30:00Z',
    utilisateurId: 2,
    produit: { nom: 'Huile d\'olive Extra Vierge', unite: 'L', type: 'huile' },
    pointVente: { nom: 'Magasin Centre-Ville' },
    utilisateur: { nom: 'Vendeur Centre-Ville' }
  },
  {
    id: 2,
    produitId: 2,
    pointVenteId: 1,
    quantite: 750,
    prixApplique: 0.15,
    dateVente: '2024-01-22T14:15:00Z',
    utilisateurId: 2,
    produit: { nom: 'Whisky Premium', unite: 'mL', type: 'alcool' },
    pointVente: { nom: 'Magasin Centre-Ville' },
    utilisateur: { nom: 'Vendeur Centre-Ville' }
  },
  {
    id: 3,
    produitId: 1,
    pointVenteId: 2,
    quantite: 1.5,
    prixApplique: 85,
    dateVente: '2024-01-21T16:20:00Z',
    utilisateurId: 3,
    produit: { nom: 'Huile d\'olive Extra Vierge', unite: 'L', type: 'huile' },
    pointVente: { nom: 'Succursale Maarif' },
    utilisateur: { nom: 'Vendeur Maarif' }
  }
];

const mockHistorique = [
  {
    id: 1,
    venteId: 1,
    ancienPrix: 80,
    nouveauPrix: 85,
    ancienneQuantite: 2.0,
    nouvelleQuantite: 2.5,
    utilisateurId: 1,
    dateModification: '2024-01-22T11:00:00Z',
    vente: { produit: { nom: 'Huile d\'olive Extra Vierge' } },
    utilisateur: { nom: 'Administrateur' }
  }
];

export const venteApi = {
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockVentes });
      }, 500);
    });
  },

  getByPointVente: async (pointVenteId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ventesFiltered = mockVentes.filter(v => v.pointVenteId === parseInt(pointVenteId));
        resolve({ data: ventesFiltered });
      }, 400);
    });
  },

  create: async (vente) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate stock validation
        if (vente.quantite <= 0) {
          reject(new Error('Quantité invalide'));
          return;
        }

        const newVente = {
          ...vente,
          id: Math.max(...mockVentes.map(v => v.id)) + 1,
          dateVente: new Date().toISOString(),
          utilisateurId: 2, // Current user ID
          utilisateur: { nom: 'Vendeur' }
        };
        mockVentes.push(newVente);
        resolve({ data: newVente });
      }, 600);
    });
  },

  update: async (id, vente) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockVentes.findIndex(v => v.id === parseInt(id));
        if (index !== -1) {
          const oldVente = { ...mockVentes[index] };
          mockVentes[index] = { ...mockVentes[index], ...vente };
          
          // Add to history
          const historiqueEntry = {
            id: mockHistorique.length + 1,
            venteId: parseInt(id),
            ancienPrix: oldVente.prixApplique,
            nouveauPrix: vente.prixApplique || oldVente.prixApplique,
            ancienneQuantite: oldVente.quantite,
            nouvelleQuantite: vente.quantite || oldVente.quantite,
            utilisateurId: 1,
            dateModification: new Date().toISOString(),
            vente: { produit: oldVente.produit },
            utilisateur: { nom: 'Administrateur' }
          };
          mockHistorique.push(historiqueEntry);
          
          resolve({ data: mockVentes[index] });
        }
      }, 600);
    });
  },

  getHistorique: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockHistorique });
      }, 400);
    });
  }
};