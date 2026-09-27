package middleware

import "github.com/gin-gonic/gin"

// Gin logs request metadata; authorization headers and bodies are not logged.
func Logger() gin.HandlerFunc { return gin.Logger() }
