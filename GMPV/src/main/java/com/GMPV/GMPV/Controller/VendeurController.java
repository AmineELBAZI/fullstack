package com.GMPV.GMPV.Controller;

import java.security.Principal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vendeur")
public class VendeurController {
    
    @GetMapping("/dashboard")
    public String vendeurDashboard(Principal principal) {
        return "Vendeur Dashboard for " + principal.getName();
    }
}
