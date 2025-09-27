package com.GMPV.GMPV.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.GMPV.GMPV.Entity.Produit;
import com.GMPV.GMPV.Entity.Stock;
import com.GMPV.GMPV.Repository.ProduitRepository;
import com.GMPV.GMPV.Repository.StockRepository;
import com.GMPV.GMPV.Service.PrinterService;


@RestController
@RequestMapping("/api/print")
public class PrintController {

    private final StockRepository stockRepository;
    private final ProduitRepository produitRepository;
    private final PrinterService printerService;

    // ✅ Constructeur pour l'injection des dépendances
    public PrintController(StockRepository stockRepository,
                           ProduitRepository produitRepository,
                           PrinterService printerService) {
        this.stockRepository = stockRepository;
        this.produitRepository = produitRepository;
        this.printerService = printerService;
    }

    // ✅ Impression via stockId
    @PostMapping("/ticket/{stockId}")
    public ResponseEntity<String> printTicket(@PathVariable Long stockId) {
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new RuntimeException("Stock not found: " + stockId));

        String productName = stock.getProduit().getName();
        String reference = stock.getProduit().getReference();

        printerService.printLabel(reference, productName);

        return ResponseEntity.ok(
                "Print job sent for stock ID " + stockId +
                " [Name: " + productName + ", Ref: " + reference + "]"
        );
    }

    // ✅ Impression via produitId
    @PostMapping("/ticket-produit/{produitId}")
    public ResponseEntity<String> printTicketByProduit(@PathVariable Long produitId) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé : " + produitId));

        String productName = produit.getName();
        String reference = produit.getReference();

        printerService.printLabel(reference, productName);

        return ResponseEntity.ok(
                "Print job envoyé pour produit ID " + produitId +
                " [Name: " + productName + ", Ref: " + reference + "]"
        );
    }
}
