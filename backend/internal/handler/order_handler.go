package handler

import (
	"github.com/gin-gonic/gin"
	"mala-shop/backend/internal/model"
	"net/http"
)

func (h *Handler) Orders(c *gin.Context) {
	orders, err := h.Service.Orders()
	respond(c, http.StatusOK, orders, err)
}
func (h *Handler) Order(c *gin.Context) {
	order, err := h.Service.Order(c.Param("id"))
	respond(c, http.StatusOK, order, err)
}
func (h *Handler) CreateOrder(c *gin.Context) {
	var input model.CreateOrder
	if !bind(c, &input) {
		return
	}
	order, err := h.Service.CreateOrder(input)
	respond(c, http.StatusCreated, order, err)
}
func (h *Handler) CancelOrder(c *gin.Context) {
	err := h.Service.CancelOrder(c.Param("id"))
	respond(c, http.StatusOK, gin.H{"cancelled": true}, err)
}
