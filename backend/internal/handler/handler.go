package handler

import (
	"errors"
	"github.com/gin-gonic/gin"
	"mala-shop/backend/internal/service"
	"net/http"
)

type Handler struct {
	Service *service.Service
	Auth    *service.Auth
}

func respond(c *gin.Context, status int, data any, err error) {
	if err != nil {
		code := http.StatusBadRequest
		if errors.Is(err, service.ErrNotFound) {
			code = http.StatusNotFound
		}
		if errors.Is(err, service.ErrUnauthorized) {
			code = http.StatusUnauthorized
		}
		c.JSON(code, gin.H{"error": err.Error()})
		return
	}
	c.JSON(status, gin.H{"data": data})
}
func bind(c *gin.Context, input any) bool {
	if err := c.ShouldBindJSON(input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON request"})
		return false
	}
	return true
}
