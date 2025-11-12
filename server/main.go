package main

import (
	"log"
	"net/http"

	"graphql-proxy/handlers"
	"graphql-proxy/middleware"
)

func main() {
	// Create a new ServeMux
	mux := http.NewServeMux()

	// Register routes
	mux.HandleFunc("/api/auth/signin", handlers.ProxyAuthHandler)
	mux.HandleFunc("/api/graphql", handlers.ProxyGraphQLHandler)

	// Wrap with CORS middleware
	corsHandler := middleware.CORS(mux)

	// Start server
	port := ":8080"
	log.Printf("Starting proxy server on http://localhost%s", port)
	log.Printf("Proxying to: https://platform.zone01.gr")
	
	if err := http.ListenAndServe(port, corsHandler); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

