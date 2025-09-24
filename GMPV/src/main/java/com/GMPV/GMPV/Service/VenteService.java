package com.GMPV.GMPV.Service;

import com.GMPV.GMPV.Entity.Produit;
import com.GMPV.GMPV.Entity.Stock;
import com.GMPV.GMPV.Entity.Vente;
import com.GMPV.GMPV.Repository.StockRepository;
import com.GMPV.GMPV.Repository.VenteRepository;
import com.GMPV.GMPV.DTO.VenteProduitFiniRequest;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.Charset;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import javax.print.Doc;
import javax.print.DocFlavor;
import javax.print.DocPrintJob;
import javax.print.PrintService;
import javax.print.PrintServiceLookup;
import javax.print.SimpleDoc;

@Service
public class VenteService {

    private final VenteRepository venteRepository;
    private final StockRepository stockRepository;
    private final StockService stockService;
    private final PrinterService printerService;

    private static final Logger logger = LoggerFactory.getLogger(VenteService.class);

    public VenteService(VenteRepository venteRepository, StockRepository stockRepository,
                        StockService stockService, PrinterService printerService) {
        this.venteRepository = venteRepository;
        this.stockRepository = stockRepository;
        this.stockService = stockService;
        this.printerService = printerService;
    }

    // -------------------- CRUD Ventes --------------------

    public Vente enregistrerVente(Vente vente) {
        return venteRepository.save(vente);
    }

    public void deleteVente(Long id) {
        venteRepository.deleteById(id);
    }

    public void deleteVentesByIds(List<Long> ids) {
        for (Long id : ids) deleteVente(id);
    }

    public void deleteVenteWithStockRestore(Long id) {
        Vente vente = venteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vente introuvable avec ID : " + id));

        Long boutiqueId = vente.getBoutique().getId();
        List<Produit> produitsVendus = vente.getProduits();
        double quantiteVendue = vente.getQuantity();

        for (Produit produit : produitsVendus) {
            Long produitId = produit.getId();
            Stock stock = stockRepository.findByBoutiqueIdAndProduitId(boutiqueId, produitId)
                    .orElseThrow(() -> new RuntimeException("Stock introuvable pour produit ID : " + produitId));
            stock.setQuantity(stock.getQuantity() + quantiteVendue);
            stockService.saveStock(stock);
        }

        venteRepository.deleteById(id);
    }

    // -------------------- Enregistrement Ventes Multiples --------------------

    public List<Vente> enregistrerVentesMultiples(Vente venteRequest) {
        List<Vente> ventesEnregistrees = new ArrayList<>();

        Long boutiqueId = venteRequest.getBoutique().getId();
        if (boutiqueId == null) throw new RuntimeException("ID de la boutique manquant.");

        for (Produit produitVendu : venteRequest.getProduits()) {
            Long produitId = produitVendu.getId();
            double quantiteVendue = produitVendu.getQuantityStock();
            double priceSell = produitVendu.getPrice_sell();

            Stock stock = stockRepository.findByBoutiqueIdAndProduitId(boutiqueId, produitId)
                    .orElseThrow(() -> new RuntimeException("Stock introuvable pour produit ID: " + produitId));

            double stockDisponible = stock.getQuantity();
            if (quantiteVendue > stockDisponible) {
                throw new RuntimeException("Stock insuffisant pour le produit '" + produitVendu.getName() + "'.");
            }

            stock.setQuantity(stockDisponible - quantiteVendue);
            stockService.saveStock(stock);

            Vente vente = new Vente();
            vente.setBoutique(venteRequest.getBoutique());
            vente.setProduits(List.of(produitVendu));
            vente.setQuantity(quantiteVendue);
            vente.setMontantTotal(quantiteVendue * priceSell);
            vente.setDateVente(LocalDateTime.now());

            Vente saved = venteRepository.save(vente);
            ventesEnregistrees.add(saved);
        }

        // ---- Print receipt on network printer ----
        try {
            String receipt = generateReceiptText(ventesEnregistrees);
            printReceiptToNetwork(receipt);
            logger.info("Reçu imprimé sur imprimante réseau pour " + ventesEnregistrees.get(0).getProduits().get(0).getName());
        } catch (Exception e) {
            logger.error("Erreur impression reçu réseau: " + e.getMessage(), e);
        }

        return ventesEnregistrees;
    }

    // -------------------- Vente Produit Fini --------------------

    public Vente vendreProduitFini(VenteProduitFiniRequest request) {
        Long boutiqueId = request.getBoutiqueId();

        Stock stockBouteille = stockRepository.findByBoutiqueIdAndProduitId(boutiqueId, request.getBouteilleId())
                .orElseThrow(() -> new RuntimeException("Stock de bouteille introuvable"));
        Stock stockHuile = stockRepository.findByBoutiqueIdAndProduitId(boutiqueId, request.getHuileId())
                .orElseThrow(() -> new RuntimeException("Stock d'huile introuvable"));
        Stock stockAlcool = stockRepository.findByBoutiqueIdAndProduitId(boutiqueId, request.getAlcoolId())
                .orElseThrow(() -> new RuntimeException("Stock d'alcool introuvable"));

        double huileNeeded, alcoolNeeded;
        switch (request.getTaille()) {
            case "20": huileNeeded = 7; alcoolNeeded = 13; break;
            case "30": huileNeeded = 10; alcoolNeeded = 20; break;
            case "50": huileNeeded = 18; alcoolNeeded = 32; break;
            default: throw new RuntimeException("Taille de bouteille non reconnue : " + request.getTaille());
        }

        if (stockBouteille.getQuantity() < 1) throw new RuntimeException("Stock de bouteille insuffisant");
        if (stockHuile.getQuantity() < huileNeeded) throw new RuntimeException("Stock d'huile insuffisant");
        if (stockAlcool.getQuantity() < alcoolNeeded) throw new RuntimeException("Stock d'alcool insuffisant");

        stockBouteille.setQuantity(stockBouteille.getQuantity() - 1);
        stockHuile.setQuantity(stockHuile.getQuantity() - huileNeeded);
        stockAlcool.setQuantity(stockAlcool.getQuantity() - alcoolNeeded);

        stockService.saveStock(stockBouteille);
        stockService.saveStock(stockHuile);
        stockService.saveStock(stockAlcool);

        Vente vente = new Vente();
        vente.setDateVente(LocalDateTime.now());
        vente.setQuantity(1);
        vente.setBoutique(stockBouteille.getBoutique());
        vente.setMontantTotal(request.getMontantTotal());
        vente.setProduits(List.of(stockBouteille.getProduit(), stockHuile.getProduit(), stockAlcool.getProduit()));

        Vente savedVente = venteRepository.save(vente);

        // ---- Print ticket local ----
        try {
            String ticketText = generateProduitFiniReceipt(savedVente, request.getTaille(), huileNeeded, alcoolNeeded);
            printReceiptLocal(ticketText);
            logger.info("Ticket imprimé localement pour " + stockHuile.getProduit().getName());
        } catch (Exception e) {
            logger.error("Erreur impression ticket local: " + e.getMessage(), e);
        }

        // ---- Print receipt network ----
        try {
            String receiptText = generateReceiptText(List.of(savedVente));
            printReceiptToNetwork(receiptText);
            logger.info("Reçu imprimé sur imprimante réseau pour " + stockHuile.getProduit().getName());
        } catch (Exception e) {
            logger.error("Erreur impression reçu réseau: " + e.getMessage(), e);
        }

        return savedVente;
    }

    // -------------------- Getters --------------------

    public List<Vente> getAllVentes() { return venteRepository.findAll(); }

    public Vente getVenteById(Long id) { return venteRepository.findById(id).orElse(null); }

    public List<Vente> getVentesByBoutique(Long boutiqueId) { return venteRepository.findByBoutiqueId(boutiqueId); }

    public static Logger getLogger() { return logger; }

    // -------------------- Receipt / Ticket Methods --------------------

    private String generateReceiptText(List<Vente> ventes) {
        StringBuilder sb = new StringBuilder();
        sb.append("***** Future Fragrance *****\n");
        sb.append("      Reçu De Vente\n");
        sb.append("-------------------------------\n");

        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        sb.append("Date: ").append(dateStr).append("\n");
        sb.append("-------------------------------\n");

        sb.append(String.format("%-16s %3s %7s\n", "Produit", "Qte", "Total"));
        sb.append("-------------------------------\n");

        double total = 0;
        for (Vente vente : ventes) {
            Produit produit = vente.getProduits().get(0);
            String nomProduit = truncateTSPL(produit.getName(), 16);
            int quantite = (int) vente.getQuantity();
            double montant = vente.getMontantTotal();
            sb.append(String.format("%-16s %3d %7.2f\n", nomProduit, quantite, montant));
            total += montant;
        }

        sb.append("-------------------------------\n");
        sb.append(String.format("%-16s %10.2f DH\n", "TOTAL:", total));
        sb.append("-------------------------------\n");
        sb.append("Merci pour votre achat !\n");
        sb.append("A bientôt !\n");

        return sb.toString();
    }

    private String generateProduitFiniReceipt(Vente vente, String taille, double huileUsed, double alcoolUsed) {
        StringBuilder sb = new StringBuilder();
        sb.append("***** Future Fragrance *****\n");
        sb.append("      Reçu De Vente\n");
        sb.append("-------------------------------\n");

        sb.append("Date: ").append(vente.getDateVente().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))).append("\n");
        sb.append("-------------------------------\n");
        sb.append("Ingrédients:\n");

        for (Produit p : vente.getProduits()) {
            sb.append(" - ").append(truncateTSPL(p.getName(), 16)).append("\n");
        }

        sb.append("Taille: ").append(taille).append(" ml\n");
        sb.append("-------------------------------\n");
        sb.append(String.format("TOTAL: %.2f DH\n", vente.getMontantTotal()));
        sb.append("-------------------------------\n");
        sb.append("Merci pour votre achat !\n");
        sb.append("A bientôt !\n");

        return sb.toString();
    }

    private String truncateTSPL(String input, int maxChars) {
        if (input == null) return "";
        if (input.length() <= maxChars) return input;
        return input.substring(0, maxChars - 1) + "…";
    }

    private void printReceiptLocal(String receiptText) {
        try {
            PrintService printService = PrintServiceLookup.lookupDefaultPrintService();
            if (printService == null) {
                System.out.println("No printer found.");
                return;
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            outputStream.write(receiptText.getBytes(Charset.forName("CP850")));

            byte[] cutCommand = new byte[]{0x1D, 'V', 66, 0};
            outputStream.write(cutCommand);

            DocPrintJob job = printService.createPrintJob();
            Doc doc = new SimpleDoc(outputStream.toByteArray(), DocFlavor.BYTE_ARRAY.AUTOSENSE, null);
            job.print(doc, null);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void printReceiptToNetwork(String receiptText) throws IOException {
        String[] lines = receiptText.split("\n");
        StringBuilder tspl = new StringBuilder();
        tspl.append("SIZE 80 mm,50 mm\n");
        tspl.append("GAP 3 mm,0\n");
        tspl.append("DENSITY 8\n");
        tspl.append("SPEED 4\n");
        tspl.append("CLS\n");

        int y = 20;
        for (String line : lines) {
            tspl.append(String.format("TEXT 10,%d,\"3\",0,1,1,\"%s\"\n", y, line));
            y += 20;
        }

        tspl.append("PRINT 1,1\n");
        tspl.append("\u001D" + "V" + "B" + "\0"); // Cut paper

        printerService.sendToPrinter(tspl.toString());
    }
}
