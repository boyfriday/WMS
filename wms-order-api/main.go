package main

import (
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/adaptor"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/swaggo/http-swagger"
	_ "wms-order-api/docs"
	"wms-order-api/config"
	"wms-order-api/models"
	"wms-order-api/routes"
)

// @title           WMS Order API
// @version         1.0
// @description     Order service for Warehouse Management System.
// @host            localhost:3000
// @BasePath        /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	db, err := config.InitDB()
	if err != nil {
		log.Fatal("failed to connect database: ", err)
	}

	db.AutoMigrate(&models.Order{}, &models.OrderItem{})

	rabbitmq, err := config.InitRabbitMQ()
	if err != nil {
		log.Fatal("failed to connect rabbitmq: ", err)
	}
	defer rabbitmq.Close()

	app := fiber.New()
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
	}))

	app.Get("/swagger/*", adaptor.HTTPHandler(httpSwagger.Handler(httpSwagger.URL("/swagger/doc.json"))))

	routes.SetupRoutes(app, db, rabbitmq)

	log.Fatal(app.Listen(":3000"))
}
