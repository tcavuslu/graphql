package handlers

import (
	"bytes"
	"io"
	"log"
	"net/http"
)

const (
	authEndpoint    = "https://platform.zone01.gr/api/auth/signin"
	graphqlEndpoint = "https://platform.zone01.gr/api/graphql-engine/v1/graphql"
)

// ProxyAuthHandler handles authentication requests
func ProxyAuthHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get Authorization header from client
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header required", http.StatusUnauthorized)
		return
	}

	// Create request to Zone01 API
	proxyReq, err := http.NewRequest("POST", authEndpoint, nil)
	if err != nil {
		log.Printf("Error creating auth request: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Forward Authorization header
	proxyReq.Header.Set("Authorization", authHeader)
	proxyReq.Header.Set("Content-Type", "application/json")

	// Execute request
	client := &http.Client{}
	resp, err := client.Do(proxyReq)
	if err != nil {
		log.Printf("Error executing auth request: %v", err)
		http.Error(w, "Failed to connect to authentication service", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading auth response: %v", err)
		http.Error(w, "Failed to read response", http.StatusInternalServerError)
		return
	}

	// Forward response to client
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	w.Write(body)

	log.Printf("Auth request: status=%d", resp.StatusCode)
}

// ProxyGraphQLHandler handles GraphQL requests
func ProxyGraphQLHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get Authorization header (Bearer token)
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header required", http.StatusUnauthorized)
		return
	}

	// Read request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error reading request body: %v", err)
		http.Error(w, "Failed to read request", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Create request to Zone01 GraphQL API
	proxyReq, err := http.NewRequest("POST", graphqlEndpoint, bytes.NewReader(body))
	if err != nil {
		log.Printf("Error creating GraphQL request: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Forward headers
	proxyReq.Header.Set("Authorization", authHeader)
	proxyReq.Header.Set("Content-Type", "application/json")

	// Execute request
	client := &http.Client{}
	resp, err := client.Do(proxyReq)
	if err != nil {
		log.Printf("Error executing GraphQL request: %v", err)
		http.Error(w, "Failed to connect to GraphQL service", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// Read response
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading GraphQL response: %v", err)
		http.Error(w, "Failed to read response", http.StatusInternalServerError)
		return
	}

	// Forward response to client
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	w.Write(respBody)

	log.Printf("GraphQL request: status=%d, size=%d bytes", resp.StatusCode, len(respBody))
}

