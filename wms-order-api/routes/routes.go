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

	api.Get("orders", orderHandler.GetOrders, middleware.RequireRoles("Admin", "Operator", "Customer"))
	api.Get("orders/:id", orderHandler.GetOrder, middleware.RequireRoles("Admin", "Operator", "Customer"))
	api.Post("orders", orderHandler.CreateOrder, middleware.RequireRoles("Admin", "Operator", "Customer"))
	api.Put("orders/:id/status", orderHandler.UpdateOrderStatus, middleware.RequireRoles("Admin", "Operator"))
	api.Post("orders/:id/claim", orderHandler.ClaimOrderItems, middleware.RequireRoles("Admin", "Operator"))
}
