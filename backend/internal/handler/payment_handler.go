package handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) ConfirmDemoPayment(c *gin.Context) {
	var input struct {
		Method string `json:"method" binding:"required"`
	}
	if !bind(c, &input) {
		return
	}
	receipt, err := h.Service.ConfirmDemoPayment(c.Param("id"), input.Method)
	respond(c, http.StatusOK, receipt, err)
}
func (h *Handler) Receipts(c *gin.Context) {
	receipts, err := h.Service.Receipts()
	respond(c, http.StatusOK, receipts, err)
}
func (h *Handler) Receipt(c *gin.Context) {
	receipt, err := h.Service.Receipt(c.Param("id"))
	respond(c, http.StatusOK, receipt, err)
}
