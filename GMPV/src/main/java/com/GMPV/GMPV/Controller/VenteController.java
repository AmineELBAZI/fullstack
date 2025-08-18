package com.GMPV.GMPV.Controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.GMPV.GMPV.DTO.VenteProduitFiniRequest;
import com.GMPV.GMPV.Entity.Vente;
import com.GMPV.GMPV.Service.VenteService;

@RestController
@RequestMapping("/api/ventes")
public class VenteController {

    private final VenteService venteService;

    public VenteController(VenteService venteService) {
        this.venteService = venteService;
    }

    @PostMapping("/multiple")
    public ResponseEntity<List<Vente>> enregistrerVentesMultiples(@RequestBody Vente venteRequest) {
        List<Vente> ventes = venteService.enregistrerVentesMultiples(venteRequest);
        return ResponseEntity.ok(ventes);
    }

    
    @PostMapping("/produit-fini")
    public ResponseEntity<Vente> vendreProduitFini(@RequestBody VenteProduitFiniRequest request) {
        Vente vente = venteService.vendreProduitFini(request);
        return ResponseEntity.ok(vente);
    }



    @GetMapping
    public List<Vente> getAllVentes() {
        return venteService.getAllVentes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vente> getVenteById(@PathVariable Long id) {
        Vente vente = venteService.getVenteById(id);
        return vente != null ? ResponseEntity.ok(vente) : ResponseEntity.notFound().build();
    }
    
    @GetMapping("/boutique/{boutiqueId}")
    public ResponseEntity<List<Vente>> getVentesByBoutique(@PathVariable Long boutiqueId) {
        List<Vente> ventes = venteService.getVentesByBoutique(boutiqueId);
        return ResponseEntity.ok(ventes);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVente(@PathVariable Long id) {
        venteService.deleteVente(id);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping
    public ResponseEntity<Void> deleteVentes(@RequestBody List<Long> ids) {
        venteService.deleteVentesByIds(ids);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/safe-delete/{id}")
    public ResponseEntity<Void> deleteVenteWithStockRestore(@PathVariable Long id) {
        venteService.deleteVenteWithStockRestore(id);
        return ResponseEntity.noContent().build();
    }




}