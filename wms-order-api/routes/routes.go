package routes

import (
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
	"wms-order-api/handlers"
	"wms-order-api/middleware"
)

func SetupRoutes(app *fiber.App, db *gorm.DB) {
	orderHandler := &handlers.OrderHandler{DB: db}

	api := app.Group("/")
	api.Use(middleware.JWTMiddleware())

	api.Get("orders", orderHandler.GetOrders)
	api.Get("orders/:id", orderHandler.GetOrder)
	api.Post("orders", orderHandler.CreateOrder)
}
