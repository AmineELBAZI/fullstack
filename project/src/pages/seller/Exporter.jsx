import React, { useEffect, useState } from 'react';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { venteApi } from '../../API/venteApi';
import Button from '../../components/UI/Button';
import jsPDF from 'jspdf';

const Exporter = () => {
  const [ventes, setVentes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get boutiqueId from localStorage user object safely
  const getBoutiqueId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.boutiqueId || null;
    } catch {
      return null;
    }
  };

  const BOUTIQUE_ID = getBoutiqueId();

  // Fetch ventes for boutiqueId
  const fetchVentes = async () => {
    if (!BOUTIQUE_ID) {
      console.error('Boutique ID not found in localStorage user object.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await venteApi.getByPointVente(BOUTIQUE_ID);
      setVentes(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des ventes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentes();
  }, []);

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const selected = ventes.filter((v) => selectedIds.includes(v.id));
    let y = 10;

    const now = new Date();
    const formattedDateTime = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();

    // Load logo image
    const img = new Image();
    img.src = '/img/logo.jpg';

    img.onload = () => {
      // Add logo
      doc.addImage(img, 'JPEG', 10, y, 40, 25);
      y += 5;

      // Title
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('FACTURE', 85, y);
      y += 25;

      // Boutique info
      const boutique = selected.length > 0 ? selected[0].boutique : null;
      const boutiqueName = boutique?.nom || 'Boutique inconnue';
      const boutiqueAdresse = boutique?.adresse?.trim() || 'Adresse non disponible';

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(` ${formattedDateTime}`, 190, y, { align: 'right' });
      doc.text(`Boutique : ${boutiqueName}`, 190, y + 6, { align: 'right' });
      doc.text(`Adresse : ${boutiqueAdresse}`, 190, y + 12, { align: 'right' });

      y += 5;

      // Company Info
      const companyInfo = {
        name: "Future Fragrance",
        address: "123 Rue Médina, Marrakech, Maroc",
        phone: "+212 6 00 00 00 00",
        email: "contact@riadamine.ma",
      };

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(companyInfo.name, 10, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(companyInfo.address, 10, y + 6);
      doc.text(`Tél: ${companyInfo.phone}`, 10, y + 12);
      doc.text(`Email: ${companyInfo.email}`, 10, y + 18);
      y += 30;

      // Table Header
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(0);
      doc.setTextColor(255);
      doc.rect(10, y, 190, 10, 'F');
      doc.text('N°', 12, y + 6);
      doc.text('Date Vente', 22, y + 6);
      doc.text('Produit', 60, y + 6);
      doc.text('Référence', 100, y + 6);
      doc.text('Prix', 125, y + 6);
      doc.text('Quantité', 145, y + 6);
      doc.text('Total', 165, y + 6);
      y += 10;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);

      const colX = {
        num: 10,
        date: 22,
        produit: 60,
        ref: 100,
        prix: 125,
        qte: 145,
        total: 165,
        end: 200,
      };
      const tableStartY = y;
      const rowHeights = [];

      let globalQuantity = 0;
      let globalTotal = 0;

      selected.forEach((vente, index) => {
        vente.produits.forEach((p, pIndex) => {
          const prix = p.price_sell || 0;
          const quantite = vente.quantity || 1;
          const total = prix * quantite;

          globalQuantity += quantite;
          globalTotal += total;

          if (y > 270) {
            doc.addPage();
            y = 20;
          }

          rowHeights.push(y);

          y += 5;
          doc.text(`${index + 1}`, colX.num + 2, y);
          doc.text(` ${new Date(vente.dateVente).toLocaleDateString()}`, colX.date, y);
          doc.text(` ${p.name}`, colX.produit, y);
          doc.text(` ${p.reference}`, colX.ref, y);
          doc.text(` ${prix.toFixed(2)}`, colX.prix, y);
          doc.text(` ${quantite}`, colX.qte, y);
          doc.text(` ${total.toFixed(2)}`, colX.total, y);

          y += 4;
        });
      });

      // Draw vertical lines (column separators)
      doc.setDrawColor(150);
      Object.values(colX).forEach((x) => {
        doc.line(x, tableStartY, x, y);
      });

      // Draw right border
      doc.line(200, tableStartY, 200, y);

      // Draw horizontal lines (row separators)
      rowHeights.forEach((rowY) => {
        doc.line(10, rowY + 0, 200, rowY + 0);
      });

      // Bottom border of table
      doc.line(10, y, 200, y);

      // Separator bar
      doc.setFillColor(0);
      doc.rect(10, y, 190, 5, 'F');
      y += 15;

      // Total row
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL GLOBAL', 60, y);
      doc.text(`${globalQuantity}`, 145, y);
      doc.text(`${globalTotal.toFixed(2)} MAD`, 165, y);

      // Get page height
      const pageHeight = doc.internal.pageSize.height;

      // Start Y position for footer about 40 units from bottom
      let footerY = pageHeight - 40;

      // Footer background line
      doc.setFillColor(0);
      doc.rect(10, footerY, 190, 5, 'F');

      // Move below the line
      footerY += 10;

      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'normal');
      doc.text('Paiement à l’ordre de Future Fragrance', 10, footerY);

      footerY += 5;
      doc.text('N° de compte : 0123 4567 8901 2345', 10, footerY);
      doc.text('Conditions de paiement : sous 30 jours', 130, footerY);

      footerY += 10;
      doc.setFont('helvetica', 'italic');
      doc.text('MERCI DE VOTRE CONFIANCE', 70, footerY);

      // Save PDF
      doc.save('liste_ventes.pdf');
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Exporter les Factures</h1>
          <p className="text-gray-600">
            Sélectionnez des ventes à exporter en PDF 
          </p>
        </div>
        <Button variant="outline" onClick={fetchVentes}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : ventes.length === 0 ? (
        <p>Aucune vente disponible.</p>
      ) : (
        <>
          <div className="flex space-x-4">
            <Button onClick={exportToPDF} disabled={selectedIds.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Exporter Facture PDF
            </Button>
          </div>

          <div className="overflow-x-auto mt-6">
            <table className="min-w-full border border-gray-200 text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border-b">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === ventes.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(ventes.map((v) => v.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                    />
                  </th>
                  <th className="p-3 border-b">#</th>
                  <th className="p-3 border-b">Date</th>
                  <th className="p-3 border-b">Boutique</th>
                  <th className="p-3 border-b">Montant</th>
                </tr>
              </thead>
              <tbody>
                {ventes.map((vente, index) => (
                  <tr
                    key={vente.id}
                    className={
                      selectedIds.includes(vente.id)
                        ? 'bg-blue-50 border-t border-blue-200'
                        : 'border-t'
                    }
                  >
                    <td className="p-3 border-b">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(vente.id)}
                        onChange={() => toggleSelection(vente.id)}
                      />
                    </td>
                    <td className="p-3 border-b">Vente #{vente.id}</td>
                    <td className="p-3 border-b">
                      {new Date(vente.dateVente).toLocaleString()}
                    </td>
                    <td className="p-3 border-b">{vente.boutique?.nom || 'N/A'}</td>
                    <td className="p-3 border-b text-green-600 font-medium">
                      {vente.montantTotal?.toFixed(2)} MAD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Exporter;
