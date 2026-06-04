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

type StockPublisher interface {
	PublishStockDeduct(msg config.StockDeductMessage) error
	PublishStockReturn(msg config.StockDeductMessage) error
}

type OrderHandler struct {
	DB       *gorm.DB
	RabbitMQ StockPublisher
}

type CreateOrderRequest struct {
	CustomerID string `json:"customerId"`
	Items      []struct {
		ProductID string `json:"productId"`
		Quantity  int    `json:"quantity"`
	} `json:"items"`
}

type ProductResponse struct {
	Success bool `json:"success"`
	Data    struct {
		ID    string  `json:"id"`
		Name  string  `json:"name"`
		Price float64 `json:"price"`
		Stock int     `json:"stock"`
	} `json:"data"`
}

type CustomerResponse struct {
	Success bool `json:"success"`
	Data    struct {
		ID      string `json:"id"`
		Name    string `json:"name"`
		Email   string `json:"email"`
		Phone   string `json:"phone"`
		Address string `json:"address"`
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
	roleVal := c.Locals("role")
	role := ""
	if roleVal != nil {
		role = roleVal.(string)
	}
	var orders []models.Order
	query := h.DB.Preload("Items").Order("created_at desc")

	if role == "Customer" {
		customerIDVal := c.Locals("customerId")
		if customerIDVal == nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "message": "unauthorized customer"})
		}
		query = query.Where("customer_id = ?", customerIDVal)
	}

	if err := query.Find(&orders).Error; err != nil {
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
	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "invalid order id"})
	}

	var order models.Order
	if err := h.DB.Where("id = ?", orderID).Preload("Items").First(&order).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "order not found"})
	}

	roleVal := c.Locals("role")
	role := ""
	if roleVal != nil {
		role = roleVal.(string)
	}
	if role == "Customer" {
		customerIDVal := c.Locals("customerId")
		if customerIDVal == nil || order.CustomerID.String() != customerIDVal.(string) {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "message": "forbidden: access to this order is restricted"})
		}
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

	roleVal := c.Locals("role")
	role := ""
	if roleVal != nil {
		role = roleVal.(string)
	}
	if role == "Customer" {
		customerIDVal := c.Locals("customerId")
		if customerIDVal == nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "message": "unauthorized customer"})
		}
		req.CustomerID = customerIDVal.(string)
	}

	token := c.Get("Authorization")
	coreURL := config.CoreAPIURL()

	customerID, err := uuid.Parse(req.CustomerID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "invalid customer id"})
	}

	// Fetch and validate customer from core API
	customerReq, _ := http.NewRequest("GET", fmt.Sprintf("%s/customers/%s", coreURL, customerID), nil)
	customerReq.Header.Set("Authorization", token)
	customerResp, err := http.DefaultClient.Do(customerReq)
	if err != nil || customerResp.StatusCode != 200 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "failed to fetch or validate customer"})
	}

	var customerData CustomerResponse
	if err := json.NewDecoder(customerResp.Body).Decode(&customerData); err != nil {
		customerResp.Body.Close()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "failed to decode customer details"})
	}
	customerResp.Body.Close()

	if !customerData.Success {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "customer not found in core registry"})
	}

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
		ID:              orderID,
		UserID:          userID,
		CustomerID:      customerID,
		CustomerName:    customerData.Data.Name,
		CustomerAddress: customerData.Data.Address,
		TotalAmount:     totalAmount,
		Status:          "pending",
		Items:           orderItems,
	}

	if err := h.DB.Create(&order).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": order})
}

// UpdateOrderStatus transitions order status (pending -> ordering -> completed, or rejected)
func (h *OrderHandler) UpdateOrderStatus(c fiber.Ctx) error {
	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "invalid order id"})
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	newStatus := req.Status
	if newStatus != "pending" && newStatus != "ordering" && newStatus != "completed" && newStatus != "rejected" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "invalid status"})
	}

	var order models.Order
	if err := h.DB.Preload("Items").First(&order, "id = ?", orderID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "order not found"})
	}

	if order.Status == "completed" || order.Status == "rejected" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "cannot change status of completed or rejected order"})
	}

	if newStatus == "rejected" {
		// Restore stock for all items
		for i, item := range order.Items {
			returnQty := item.Quantity - item.ReturnedQuantity
			if returnQty > 0 {
				err = h.RabbitMQ.PublishStockReturn(config.StockDeductMessage{
					ProductID: item.ProductID.String(),
					Quantity:  returnQty,
					OrderID:   order.ID.String(),
				})
				if err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "failed to publish stock return"})
				}
				order.Items[i].ReturnedQuantity = item.Quantity
				h.DB.Save(&order.Items[i])
			}
		}
	}

	order.Status = newStatus
	if err := h.DB.Save(&order).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	return c.JSON(fiber.Map{"success": true, "data": order})
}

// ClaimOrderItems registers partial or full order items return
func (h *OrderHandler) ClaimOrderItems(c fiber.Ctx) error {
	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "invalid order id"})
	}

	var req struct {
		Items []struct {
			ProductID string `json:"productId"`
			Quantity  int    `json:"quantity"`
		} `json:"items"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	if len(req.Items) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "items to claim required"})
	}

	var order models.Order
	if err := h.DB.Preload("Items").First(&order, "id = ?", orderID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "order not found"})
	}

	if order.Status == "rejected" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "cannot claim items on a rejected order"})
	}

	for _, claimItem := range req.Items {
		claimProdID, err := uuid.Parse(claimItem.ProductID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "invalid product id"})
		}
		if claimItem.Quantity <= 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "claim quantity must be greater than 0"})
		}

		found := false
		for i, item := range order.Items {
			if item.ProductID == claimProdID {
				found = true
				if item.ReturnedQuantity+claimItem.Quantity > item.Quantity {
					return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
						"success": false,
						"message": fmt.Sprintf("cannot claim %d items of %s; only %d items remain purchasable",
							claimItem.Quantity, item.ProductName, item.Quantity-item.ReturnedQuantity),
					})
				}

				// Publish stock return to core API
				err = h.RabbitMQ.PublishStockReturn(config.StockDeductMessage{
					ProductID: item.ProductID.String(),
					Quantity:  claimItem.Quantity,
					OrderID:   order.ID.String(),
				})
				if err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "failed to publish stock return"})
				}

				order.Items[i].ReturnedQuantity += claimItem.Quantity
				if err := h.DB.Save(&order.Items[i]).Error; err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
				}
				break
			}
		}

		if !found {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": fmt.Sprintf("product %s not found in order items", claimItem.ProductID),
			})
		}
	}

	h.DB.Preload("Items").First(&order, "id = ?", order.ID)
	return c.JSON(fiber.Map{"success": true, "data": order})
}
