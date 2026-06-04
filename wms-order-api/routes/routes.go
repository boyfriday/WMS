package routes

import (
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
	"wms-order-api/config"
	"wms-order-api/handlers"
	"wms-order-api/middleware"
)

func SetupRoutes(app *fiber.App, db *gorm.DB, rabbitmq *config.RabbitMQ) {
	orderHandler := &handlers.OrderHandler{DB: db, RabbitMQ: rabbitmq}

	api := app.Group("/")
	api.Use(middleware.JWTMiddleware())
	api.Use(middleware.RequireRoles("Admin", "Operator"))

	api.Get("orders", orderHandler.GetOrders)
	api.Get("orders/:id", orderHandler.GetOrder)
	api.Post("orders", orderHandler.CreateOrder)
	api.Put("orders/:id/status", orderHandler.UpdateOrderStatus)
	api.Post("orders/:id/claim", orderHandler.ClaimOrderItems)
}
