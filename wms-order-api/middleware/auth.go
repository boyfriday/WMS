package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"wms-order-api/config"
)

func JWTMiddleware() fiber.Handler {
	return func(c fiber.Ctx) error {
		auth := c.Get("Authorization")
		if auth == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "missing token"})
		}

		parts := strings.SplitN(auth, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "invalid token format"})
		}

		tokenStr := parts[1]
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte(config.JWTSecret()), nil
		})
		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "invalid token"})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "invalid claims"})
		}

		userId := claims["nameid"]
		if userId == nil {
			userId = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
		}
		c.Locals("userId", userId)

		email := claims["email"]
		if email == nil {
			email = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
		}
		c.Locals("email", email)

		role := claims["role"]
		if role == nil {
			role = claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
		}
		c.Locals("role", role)

		if customerId, exists := claims["customerId"]; exists {
			c.Locals("customerId", customerId)
		}
		return c.Next()
	}
}

func RequireRoles(allowedRoles ...string) fiber.Handler {
	return func(c fiber.Ctx) error {
		roleVal := c.Locals("role")
		if roleVal == nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "message": "unauthorized role"})
		}
		role, ok := roleVal.(string)
		if !ok {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "message": "unauthorized role"})
		}

		for _, allowedRole := range allowedRoles {
			if strings.EqualFold(role, allowedRole) {
				return c.Next()
			}
		}
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "message": "forbidden: insufficient permissions"})
	}
}
