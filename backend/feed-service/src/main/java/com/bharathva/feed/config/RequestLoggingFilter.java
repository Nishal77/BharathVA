package com.bharathva.feed.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Enumeration;

@Component
@Order(1)
public class RequestLoggingFilter implements Filter {
    
    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);
    
    @Override
    public void doFilter(jakarta.servlet.ServletRequest request, jakarta.servlet.ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String method = httpRequest.getMethod();
        String uri = httpRequest.getRequestURI();
        String queryString = httpRequest.getQueryString();
        String fullUrl = queryString == null ? uri : uri + "?" + queryString;
        
        Enumeration<String> headerNames = httpRequest.getHeaderNames();
        StringBuilder headers = new StringBuilder();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            if (headerName.equalsIgnoreCase("authorization")) {
                String authHeader = httpRequest.getHeader(headerName);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    String tokenPrefix = token.length() > 20 ? token.substring(0, 20) + "..." : token;
                    headers.append(headerName).append(": Bearer ").append(tokenPrefix).append("\n");
                } else {
                    headers.append(headerName).append(": ").append(authHeader).append("\n");
                }
            } else {
                headers.append(headerName).append(": ").append(httpRequest.getHeader(headerName)).append("\n");
            }
        }
        
        log.info("🔍 [RequestLoggingFilter] {} {} - Headers:\n{}", method, fullUrl, headers.toString());
        
        chain.doFilter(request, response);
        
        log.info("🔍 [RequestLoggingFilter] {} {} - Response Status: {}", method, fullUrl, httpResponse.getStatus());
    }
}

