package com.GMPV.GMPV.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(
                "http://localhost:3000",
                "https://localhost:3000",
                "https://77.237.238.8",
                "http://77.237.238.8",
                "http://futurefragrance.store",
                "https://futurefragrance.store",
                "http://www.futurefragrance.store",
                "https://www.futurefragrance.store"
                
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
