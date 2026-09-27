package handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) Stocks(c *gin.Context) {
	stocks, err := h.Service.Stocks()
	respond(c, http.StatusOK, stocks, err)
}
func (h *Handler) Transactions(c *gin.Context) {
	items, err := h.Service.Transactions()
	respond(c, http.StatusOK, items, err)
}
func (h *Handler) AdjustStock(c *gin.Context) {
	var input struct {
		Quantity int    `json:"quantity"`
		Reason   string `json:"reason"`
	}
	if !bind(c, &input) {
		return
	}
	err := h.Service.AdjustStock(c.Param("id"), input.Quantity, input.Reason)
	respond(c, http.StatusOK, gin.H{"adjusted": true}, err)
}
