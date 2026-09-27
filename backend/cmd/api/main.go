package main

import (
	"context"
	"errors"
	"log"
	"mala-shop/backend/internal/config"
	"mala-shop/backend/internal/repository"
	"mala-shop/backend/internal/router"
	"net/http"
	"os"
	"os/signal"
	"time"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}
	seed, err := repository.DemoSeed()
	if err != nil {
		log.Fatal(err)
	}
	api := router.New(repository.NewMemory(seed), cfg.JWTSecret)
	server := &http.Server{Addr: cfg.Addr, Handler: api, ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 15 * time.Second, WriteTimeout: 15 * time.Second, IdleTimeout: 60 * time.Second}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()
	go func() {
		log.Printf("MALA local demo: http://%s (in-memory data; no PostgreSQL or real payments)", cfg.Addr)
		if cfg.EphemeralSecret {
			log.Print("JWT uses an ephemeral key; restarting invalidates demo tokens")
		}
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal(err)
		}
	}()
	<-ctx.Done()
	shutdown, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(shutdown); err != nil {
		log.Print(err)
	}
}
