package com.GMPV.GMPV.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.GMPV.GMPV.Entity.Stock;
import com.GMPV.GMPV.Repository.StockRepository;
import com.GMPV.GMPV.Service.PrinterService;


@RestController
@RequestMapping("/api/print")
public class PrintController {

    @Autowired
    private PrinterService printerService;

    @Autowired
    private StockRepository stockRepository;

    @PostMapping("/ticket/{stockId}")
    public ResponseEntity<String> printTicket(@PathVariable Long stockId) {
        // ✅ Fetch real stock/product info
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new RuntimeException("Stock not found: " + stockId));

        String productName = stock.getProduit().getName();      // assuming Stock → Produit relation
        String reference = stock.getProduit().getReference(); // assuming Produit has a "reference" field

        printerService.printLabel(reference, productName);

        return ResponseEntity.ok(
                "Print job sent for stock ID " + stockId +
                " [Name: " + productName + ", Ref: " + reference + "]"
        );
    }
}
