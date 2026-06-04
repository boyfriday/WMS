package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"wms-order-api/config"
	"wms-order-api/models"
)

type mockPublisher struct {
	deductCalled bool
	returnCalled bool
}

func (m *mockPublisher) PublishStockDeduct(msg config.StockDeductMessage) error {
	m.deductCalled = true
	return nil
}

func (m *mockPublisher) PublishStockReturn(msg config.StockDeductMessage) error {
	m.returnCalled = true
	return nil
}

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(postgres.New(postgres.Config{
		DriverName: "mock_postgres",
		DSN:        "mock_dsn",
	}), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open mock DB: %v", err)
	}
	return db
}

func TestGetOrders(t *testing.T) {
	db := setupTestDB(t)
	handler := &OrderHandler{
		DB:       db,
		RabbitMQ: &mockPublisher{},
	}

	app := fiber.New()
	app.Get("/orders", handler.GetOrders)

	req := httptest.NewRequest("GET", "/orders", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to test app: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	var body map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&body)
	if body["success"] != true {
		t.Errorf("Expected success = true, got %v", body["success"])
	}
}

func TestGetOrder_InvalidID(t *testing.T) {
	db := setupTestDB(t)
	handler := &OrderHandler{
		DB:       db,
		RabbitMQ: &mockPublisher{},
	}

	app := fiber.New()
	app.Get("/orders/:id", handler.GetOrder)

	req := httptest.NewRequest("GET", "/orders/invalid-uuid", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to test app: %v", err)
	}

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", resp.StatusCode)
	}
}

func TestUpdateOrderStatus_InvalidID(t *testing.T) {
	db := setupTestDB(t)
	handler := &OrderHandler{
		DB:       db,
		RabbitMQ: &mockPublisher{},
	}

	app := fiber.New()
	app.Put("/orders/:id/status", handler.UpdateOrderStatus)

	bodyBytes, _ := json.Marshal(map[string]string{"status": "ordering"})
	req := httptest.NewRequest("PUT", "/orders/invalid-uuid/status", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to test app: %v", err)
	}

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", resp.StatusCode)
	}
}

func TestClaimOrderItems_InvalidID(t *testing.T) {
	db := setupTestDB(t)
	handler := &OrderHandler{
		DB:       db,
		RabbitMQ: &mockPublisher{},
	}

	app := fiber.New()
	app.Post("/orders/:id/claim", handler.ClaimOrderItems)

	req := httptest.NewRequest("POST", "/orders/invalid-uuid/claim", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to test app: %v", err)
	}

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", resp.StatusCode)
	}
}

func TestOrderBeforeCreate(t *testing.T) {
	order := &models.Order{}
	err := order.BeforeCreate(nil)
	if err != nil {
		t.Errorf("BeforeCreate returned error: %v", err)
	}
	if order.ID == uuid.Nil {
		t.Error("BeforeCreate failed to generate UUID")
	}
}

func TestOrderItemBeforeCreate(t *testing.T) {
	item := &models.OrderItem{}
	err := item.BeforeCreate(nil)
	if err != nil {
		t.Errorf("BeforeCreate returned error: %v", err)
	}
	if item.ID == uuid.Nil {
		t.Error("BeforeCreate failed to generate UUID")
	}
}
