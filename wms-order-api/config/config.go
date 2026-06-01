package config

import (
	"fmt"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDB() (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_USER", "wms"),
		getEnv("DB_PASSWORD", "wms123"),
		getEnv("DB_NAME", "wms_order"),
		getEnv("DB_PORT", "5432"),
	)
	return gorm.Open(postgres.Open(dsn), &gorm.Config{})
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func JWTSecret() string {
	return getEnv("JWT_SECRET", "your-super-secret-key-for-jwt-signing-must-be-at-least-32-characters-long")
}

func CoreAPIURL() string {
	return getEnv("CORE_API_URL", "http://wms-core-api:8080")
}
