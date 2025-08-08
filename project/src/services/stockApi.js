import api from './api';

const mockStocks = [
  {
    id: 1,
    produitId: 1,
    pointVenteId: 1,
    quantite: 50.5,
    derniereMiseAJour: '2024-01-20T14:30:00Z',
    produit: { nom: 'Huile d\'olive Extra Vierge', unite: 'L', type: 'huile', prixUnitaire: 85 },
    pointVente: { nom: 'Magasin Centre-Ville' }
  },
  {
    id: 2,
    produitId: 2,
    pointVenteId: 1,
    quantite: 2500,
    derniereMiseAJour: '2024-01-19T16:45:00Z',
    produit: { nom: 'Whisky Premium', unite: 'mL', type: 'alcool', prixUnitaire: 0.12 },
    pointVente: { nom: 'Magasin Centre-Ville' }
  },
  {
    id: 3,
    produitId: 1,
    pointVenteId: 2,
    quantite: 3.8,
    derniereMiseAJour: '2024-01-21T09:15:00Z',
    produit: { nom: 'Huile d\'olive Extra Vierge', unite: 'L', type: 'huile', prixUnitaire: 85 },
    pointVente: { nom: 'Succursale Maarif' }
  },
  {
    id: 4,
    produitId: 3,
    pointVenteId: 1,
    quantite: 0,
    derniereMiseAJour: '2024-01-18T11:20:00Z',
    produit: { nom: 'Farine de blé', unite: 'g', type: 'cereale', prixUnitaire: 0.008 },
    pointVente: { nom: 'Magasin Centre-Ville' }
  },
  {
    id: 5,
    produitId: 2,
    pointVenteId: 2,
    quantite: 8,
    derniereMiseAJour: '2024-01-20T08:30:00Z',
    produit: { nom: 'Whisky Premium', unite: 'mL', type: 'alcool', prixUnitaire: 0.12 },
    pointVente: { nom: 'Succursale Maarif' }
  }
];

export const stockApi = {
  getAll: async (pointVenteId = null) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredStocks = mockStocks;
        if (pointVenteId) {
          filteredStocks = mockStocks.filter(s => s.pointVenteId === parseInt(pointVenteId));
        }
        resolve({ data: filteredStocks });
      }, 500);
    });
  },

  reapprovisionner: async ({ produitId, pointVenteId, quantite }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stock = mockStocks.find(s => 
          s.produitId === parseInt(produitId) && 
          s.pointVenteId === parseInt(pointVenteId)
        );
        
        if (stock) {
          stock.quantite += parseFloat(quantite);
          stock.derniereMiseAJour = new Date().toISOString();
        } else {
          // Create new stock entry if doesn't exist
          const newStock = {
            id: Math.max(...mockStocks.map(s => s.id)) + 1,
            produitId: parseInt(produitId),
            pointVenteId: parseInt(pointVenteId),
            quantite: parseFloat(quantite),
            derniereMiseAJour: new Date().toISOString(),
            produit: { nom: 'Produit', unite: 'unité', type: 'type', prixUnitaire: 0 },
            pointVente: { nom: 'Point de vente' }
          };
          mockStocks.push(newStock);
        }
        
        resolve({ data: stock || { success: true } });
      }, 600);
    });
  },

  getStocksFaibles: async (seuil = 10) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stocksFaibles = mockStocks.filter(s => s.quantite < seuil);
        resolve({ data: stocksFaibles });
      }, 400);
    });
  },

  getStocksFaiblesParPointVente: async (pointVenteId, seuil = 15) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stocksFaibles = mockStocks.filter(s => 
          s.pointVenteId === parseInt(pointVenteId) && s.quantite < seuil
        );
        resolve({ data: stocksFaibles });
      }, 400);
    });
  }
};