package router

import (
	"github.com/gin-gonic/gin"
	"mala-shop/backend/internal/handler"
	"mala-shop/backend/internal/middleware"
	"mala-shop/backend/internal/repository"
	"mala-shop/backend/internal/service"
	"net/http"
)

func New(store repository.Store, secret []byte) *gin.Engine {
	r := gin.New()
	_ = r.SetTrustedProxies(nil)
	r.Use(middleware.Logger(), gin.Recovery(), func(c *gin.Context) { c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 1<<20); c.Next() })
	h := &handler.Handler{Service: service.New(store), Auth: &service.Auth{Store: store, Secret: secret}}
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "mode": "memory-demo", "databaseConnected": false})
	})
	r.POST("/api/v1/auth/login", h.Login)
	api := r.Group("/api/v1", middleware.Auth(secret))
	api.GET("/categories", h.Categories)
	api.GET("/products", h.Products)
	api.POST("/products", middleware.Admin(), h.SaveProduct)
	api.PUT("/products/:id", middleware.Admin(), h.SaveProduct)
	api.GET("/orders", h.Orders)
	api.POST("/orders", h.CreateOrder)
	api.GET("/orders/:id", h.Order)
	api.POST("/orders/:id/cancel", h.CancelOrder)
	api.POST("/orders/:id/payments/demo-confirm", h.ConfirmDemoPayment)
	api.GET("/receipts", h.Receipts)
	api.GET("/receipts/:id", h.Receipt)
	api.GET("/stocks", h.Stocks)
	api.GET("/stock-transactions", h.Transactions)
	api.POST("/stocks/:id/adjust", middleware.Admin(), h.AdjustStock)
	r.NoRoute(func(c *gin.Context) { c.JSON(http.StatusNotFound, gin.H{"error": "route not found"}) })
	return r
}
