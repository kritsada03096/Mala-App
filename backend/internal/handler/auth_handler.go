package handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) Login(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required,max=80"`
		Password string `json:"password" binding:"required,max=72"`
	}
	if !bind(c, &input) {
		return
	}
	token, user, err := h.Auth.Login(input.Username, input.Password)
	respond(c, http.StatusOK, gin.H{"token": token, "user": user, "expiresIn": 28800}, err)
}
