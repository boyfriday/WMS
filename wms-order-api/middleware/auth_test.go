package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"wms-order-api/config"
)

func TestJWTMiddleware_MissingToken(t *testing.T) {
	app := fiber.New()
	app.Use(JWTMiddleware())
	app.Get("/test", func(c fiber.Ctx) error {
		return c.SendString("ok")
	})

	req := httptest.NewRequest("GET", "/test", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to test app: %v", err)
	}

	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized, got %d", resp.StatusCode)
	}
}

func TestJWTMiddleware_InvalidFormat(t *testing.T) {
	app := fiber.New()
	app.Use(JWTMiddleware())
	app.Get("/test", func(c fiber.Ctx) error {
		return c.SendString("ok")
	})

	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "InvalidFormat token123")
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to test app: %v", err)
	}

	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized, got %d", resp.StatusCode)
	}
}

func TestJWTMiddleware_ValidToken(t *testing.T) {
	// Generate valid token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"nameid": "user-123",
		"email":  "test@test.com",
		"role":   "Admin",
		"exp":    time.Now().Add(time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString([]byte(config.JWTSecret()))

	app := fiber.New()
	app.Use(JWTMiddleware())
	app.Get("/test", func(c fiber.Ctx) error {
		userId := c.Locals("userId").(string)
		email := c.Locals("email").(string)
		role := c.Locals("role").(string)
		if userId != "user-123" || email != "test@test.com" || role != "Admin" {
			return c.Status(500).SendString("claims mismatch")
		}
		return c.SendString("ok")
	})

	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to test app: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", resp.StatusCode)
	}
}

func TestRequireRoles(t *testing.T) {
	tests := []struct {
		name           string
		userRole       interface{}
		allowedRoles   []string
		expectedStatus int
	}{
		{
			name:           "Role matches first allowed",
			userRole:       "Admin",
			allowedRoles:   []string{"Admin", "Operator"},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Role matches second allowed",
			userRole:       "Operator",
			allowedRoles:   []string{"Admin", "Operator"},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Role case insensitive match",
			userRole:       "admin",
			allowedRoles:   []string{"Admin"},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Role mismatch",
			userRole:       "Warehouse",
			allowedRoles:   []string{"Admin", "Operator"},
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "Role is nil",
			userRole:       nil,
			allowedRoles:   []string{"Admin"},
			expectedStatus: http.StatusForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			app := fiber.New()
			// Mock set context values
			app.Use(func(c fiber.Ctx) error {
				if tt.userRole != nil {
					c.Locals("role", tt.userRole)
				}
				return c.Next()
			})
			app.Use(RequireRoles(tt.allowedRoles...))
			app.Get("/test", func(c fiber.Ctx) error {
				return c.SendString("ok")
			})

			req := httptest.NewRequest("GET", "/test", nil)
			resp, err := app.Test(req)
			if err != nil {
				t.Fatalf("Failed to test app: %v", err)
			}

			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}
