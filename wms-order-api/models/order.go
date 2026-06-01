package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Order struct {
	ID          uuid.UUID   `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID   `gorm:"type:uuid;not null;index" json:"userId"`
	TotalAmount float64     `gorm:"type:decimal(18,2);not null" json:"totalAmount"`
	Status      string      `gorm:"type:varchar(20);default:'Pending'" json:"status"`
	Items       []OrderItem `gorm:"foreignKey:OrderID" json:"items"`
	CreatedAt   time.Time   `json:"createdAt"`
	UpdatedAt   time.Time   `json:"updatedAt"`
}

type OrderItem struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OrderID   uuid.UUID `gorm:"type:uuid;not null;index" json:"orderId"`
	ProductID uuid.UUID `gorm:"type:uuid;not null" json:"productId"`
	ProductName string  `gorm:"type:varchar(255);not null" json:"productName"`
	Quantity  int       `gorm:"not null" json:"quantity"`
	UnitPrice float64   `gorm:"type:decimal(18,2);not null" json:"unitPrice"`
}

func (o *Order) BeforeCreate(tx *gorm.DB) (err error) {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return
}

func (oi *OrderItem) BeforeCreate(tx *gorm.DB) (err error) {
	if oi.ID == uuid.Nil {
		oi.ID = uuid.New()
	}
	return
}
