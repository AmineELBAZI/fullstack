package com.GMPV.GMPV.Controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.GMPV.GMPV.DTO.LoginResponseDTO;
import com.GMPV.GMPV.Entity.AuthRequest;
import com.GMPV.GMPV.Entity.User;
import com.GMPV.GMPV.Repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@CrossOrigin(origins = {
	    "http://localhost:3000",
	    "https://localhost:3000",
	    "https://77.237.238.8",
	    "http://77.237.238.8",
    "http://futurefragrance.store",
    "https://futurefragrance.store",
    "http://www.futurefragrance.store",
    "https://www.futurefragrance.store"
		
	})
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    authRequest.getUsername(), authRequest.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            Optional<User> optionalUser = userRepository.findByUsername(userDetails.getUsername());
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            User user = optionalUser.get();

            LoginResponseDTO response = new LoginResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                user.getBoutique() != null ? user.getBoutique().getId() : null
            );

            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        request.getSession().invalidate(); // End the session
        SecurityContextHolder.clearContext(); // Clear Spring Security context
        return ResponseEntity.ok("Logout successful");
    }
}
