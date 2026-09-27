package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"mala-shop/backend/internal/service"
	"net/http"
	"strings"
)

func Auth(secret []byte) gin.HandlerFunc {
	return func(c *gin.Context) {
		parts := strings.Fields(c.GetHeader("Authorization"))
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "bearer token required"})
			return
		}
		claims := &service.Claims{}
		token, err := jwt.ParseWithClaims(parts[1], claims, func(t *jwt.Token) (any, error) { return secret, nil }, jwt.WithValidMethods([]string{"HS256"}), jwt.WithIssuer(service.TokenIssuer), jwt.WithExpirationRequired())
		if err != nil || !token.Valid || claims.Subject == "" || (claims.Role != "ADMIN" && claims.Role != "STAFF") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			return
		}
		c.Set("userID", claims.Subject)
		c.Set("role", claims.Role)
		c.Next()
	}
}
func Admin() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.GetString("role") != "ADMIN" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "admin role required"})
			return
		}
		c.Next()
	}
}
