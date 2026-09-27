package service

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"mala-shop/backend/internal/repository"
)

var ErrNotFound = errors.New("not found")
var ErrUnauthorized = errors.New("invalid credentials")

type Service struct{ Store repository.Store }

func New(store repository.Store) *Service { return &Service{Store: store} }
func newID() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		panic(err)
	}
	return hex.EncodeToString(b[:])
}
