package com.GMPV.GMPV.Controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = {
	    "http://localhost:3000",
	    "https://77.237.238.8",
	    "http://77.237.238.8",
    "http://futurefragrance.store",
    "https://futurefragrance.store",
    "http://www.futurefragrance.store",
    "https://www.futurefragrance.store"
		
	})
@RequestMapping("/admin")
public class AdminController {
    @GetMapping("/dashboard")
    public String adminDashboard() {
        return "Admin Dashboard";
    }
}
