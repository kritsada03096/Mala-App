package config

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net"
	"os"
)

type Config struct {
	Addr            string
	JWTSecret       []byte
	EphemeralSecret bool
}

func Load() (Config, error) {
	addr := os.Getenv("APP_ADDR")
	if addr == "" {
		addr = "127.0.0.1:8080"
	}
	host, _, err := net.SplitHostPort(addr)
	if err != nil {
		return Config{}, fmt.Errorf("APP_ADDR must be host:port: %w", err)
	}
	ip := net.ParseIP(host)
	if ip == nil || !ip.IsLoopback() {
		return Config{}, fmt.Errorf("demo API must bind to a loopback IP address")
	}
	secret := os.Getenv("JWT_SECRET")
	ephemeral := secret == ""
	if ephemeral {
		var key [32]byte
		if _, err := rand.Read(key[:]); err != nil {
			return Config{}, err
		}
		secret = hex.EncodeToString(key[:])
	}
	if len(secret) < 32 {
		return Config{}, fmt.Errorf("JWT_SECRET must be at least 32 bytes")
	}
	return Config{Addr: addr, JWTSecret: []byte(secret), EphemeralSecret: ephemeral}, nil
}
