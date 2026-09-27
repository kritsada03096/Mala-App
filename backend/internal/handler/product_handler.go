package handler

import (
	"github.com/gin-gonic/gin"
	"mala-shop/backend/internal/model"
	"net/http"
)

func (h *Handler) Products(c *gin.Context) {
	products, err := h.Service.Products()
	respond(c, http.StatusOK, products, err)
}
func (h *Handler) Categories(c *gin.Context) { respond(c, http.StatusOK, model.Categories, nil) }
func (h *Handler) SaveProduct(c *gin.Context) {
	var input model.Product
	if !bind(c, &input) {
		return
	}
	product, err := h.Service.SaveProduct(c.Param("id"), input)
	status := http.StatusOK
	if c.Param("id") == "" {
		status = http.StatusCreated
	}
	respond(c, status, product, err)
}
