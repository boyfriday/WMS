package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"wms-order-api/config"
	"wms-order-api/models"
	"gorm.io/gorm"
)

type OrderHandler struct {
	DB       *gorm.DB
	RabbitMQ *config.RabbitMQ
}

type CreateOrderRequest struct {
	Items []struct {
		ProductID string `json:"productId"`
		Quantity  int    `json:"quantity"`
	} `json:"items"`
}

type ProductResponse struct {
	Success bool `json:"success"`
	Data    struct {
		ID      string  `json:"id"`
		Name    string  `json:"name"`
		Price   float64 `json:"price"`
		Stock   int     `json:"stock"`
	} `json:"data"`
}

// GetOrders godoc
// @Summary      List my orders
// @Description  Get all orders for authenticated user
// @Tags         orders
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  map[string]interface{}
// @Router       /orders [get]
func (h *OrderHandler) GetOrders(c fiber.Ctx) error {
	userIDStr := c.Locals("userId").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "invalid user id"})
	}

	var orders []models.Order
	if err := h.DB.Where("user_id = ?", userID).Preload("Items").Order("created_at desc").Find(&orders).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	return c.JSON(fiber.Map{"success": true, "data": orders})
}

// GetOrder godoc
// @Summary      Get order by ID
// @Description  Get single order details
// @Tags         orders
// @Security     BearerAuth
// @Produce      json
// @Param        id   path      string  true  "Order ID"
// @Success      200  {object}  map[string]interface{}
// @Router       /orders/{id} [get]
func (h *OrderHandler) GetOrder(c fiber.Ctx) error {
	userIDStr := c.Locals("userId").(string)
	userID, _ := uuid.Parse(userIDStr)
	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "invalid order id"})
	}

	var order models.Order
	if err := h.DB.Where("id = ? AND user_id = ?", orderID, userID).Preload("Items").First(&order).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "order not found"})
	}

	return c.JSON(fiber.Map{"success": true, "data": order})
}

// CreateOrder godoc
// @Summary      Create new order
// @Description  Create order and deduct stock from catalog service
// @Tags         orders
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        body  body      CreateOrderRequest  true  "Order items"
// @Success      201   {object}  map[string]interface{}
// @Router       /orders [post]
func (h *OrderHandler) CreateOrder(c fiber.Ctx) error {
	userIDStr := c.Locals("userId").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "invalid user id"})
	}

	var req CreateOrderRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	if len(req.Items) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "items required"})
	}

	token := c.Get("Authorization")
	coreURL := config.CoreAPIURL()

	var orderItems []models.OrderItem
	var totalAmount float64
	orderID := uuid.New()

	for _, item := range req.Items {
		productID, err := uuid.Parse(item.ProductID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "invalid product id"})
		}

		// Fetch product from core API
		productReq, _ := http.NewRequest("GET", fmt.Sprintf("%s/products/%s", coreURL, productID), nil)
		productReq.Header.Set("Authorization", token)
		productResp, err := http.DefaultClient.Do(productReq)
		if err != nil || productResp.StatusCode != 200 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": fmt.Sprintf("failed to fetch product %s", productID)})
		}

		var productData ProductResponse
		if err := json.NewDecoder(productResp.Body).Decode(&productData); err != nil {
			productResp.Body.Close()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "failed to decode product"})
		}
		productResp.Body.Close()

		product := productData.Data
		if product.Stock < item.Quantity {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": fmt.Sprintf("insufficient stock for %s (available: %d, requested: %d)", product.Name, product.Stock, item.Quantity),
			})
		}

		// Publish stock deduct message to RabbitMQ (async processing)
		err = h.RabbitMQ.PublishStockDeduct(config.StockDeductMessage{
			ProductID: productID.String(),
			Quantity:  item.Quantity,
			OrderID:   orderID.String(),
		})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": fmt.Sprintf("failed to queue stock deduction for %s: %v", product.Name, err)})
		}

		orderItems = append(orderItems, models.OrderItem{
			ProductID:   productID,
			ProductName: product.Name,
			Quantity:    item.Quantity,
			UnitPrice:   product.Price,
		})
		totalAmount += product.Price * float64(item.Quantity)
	}

	order := models.Order{
		ID:          orderID,
		UserID:      userID,
		TotalAmount: totalAmount,
		Status:      "Pending",
		Items:       orderItems,
	}

	if err := h.DB.Create(&order).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": order})
}
