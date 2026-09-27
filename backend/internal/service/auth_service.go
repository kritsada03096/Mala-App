package service

import (
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"mala-shop/backend/internal/model"
	"mala-shop/backend/internal/repository"
	"strings"
	"time"
)

const TokenIssuer = "mala-local-demo"

type Claims struct {
	Role string `json:"role"`
	jwt.RegisteredClaims
}
type Auth struct {
	Store  repository.Store
	Secret []byte
}

func (a *Auth) Login(username, password string) (string, model.User, error) {
	var user model.User
	err := a.Store.View(func(s *repository.State) error {
		stored := s.UserByUsername(strings.TrimSpace(username))
		if stored == nil || bcrypt.CompareHashAndPassword(stored.PasswordHash, []byte(password)) != nil {
			return ErrUnauthorized
		}
		user = stored.User
		return nil
	})
	if err != nil {
		return "", user, err
	}
	now := time.Now()
	claims := Claims{Role: user.Role, RegisteredClaims: jwt.RegisteredClaims{Subject: user.ID, Issuer: TokenIssuer, IssuedAt: jwt.NewNumericDate(now), ExpiresAt: jwt.NewNumericDate(now.Add(8 * time.Hour))}}
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(a.Secret)
	return token, user, err
}
