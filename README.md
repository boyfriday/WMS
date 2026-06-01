# WMS - Warehouse Management System

Distributed Product Management System สำหรับจัดการสินค้าและรับคำสั่งซื้อ

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  wms-client │────▶│ wms-core-api │────▶│   postgres  │
│  (React)    │     │  (.NET 10)   │     │  (PostgreSQL)│
└─────────────┘     └──────────────┘     └─────────────┘
       │
       │            ┌──────────────┐
       └───────────▶│wms-order-api │────▶│   postgres  │
                    │  (Go Fiber)  │     │  (wms_order) │
                    └──────────────┘     └─────────────┘
```

## Services

| Service | Technology | Domain |
|---------|-----------|--------|
| wms-client | React 19 + Vite + TypeScript + Tailwind CSS | Frontend SPA |
| wms-core-api | .NET 10 Web API + EF Core + PostgreSQL | Auth + Catalog + Stock |
| wms-order-api | Go Fiber v3 + GORM + PostgreSQL | Order lifecycle |

## Prerequisites

- Docker & Docker Compose
- (Optional) Node.js 22+ for local frontend dev
- (Optional) .NET 10 SDK for local API dev
- (Optional) Go 1.23+ for local order service dev

## Quick Start

```bash
# Clone และเข้า project directory
cd WMS

# Start ทุก services
docker-compose up --build

# รอจน services พร้อม จากนั้นเข้าใช้งานที่:
# Frontend: http://localhost
# Core API: http://localhost:8080/swagger
# Order API: http://localhost:3000/swagger
```

## Default Accounts

ลงทะเบียน user ใหม่ผ่านหน้า Register ได้เลย ระบบจะกำหนด role เป็น `User` โดยอัตโนมัติ

## Features

### Authentication & Authorization
- Register / Login / Logout
- JWT Token strategy
- Role-based access control (Admin, User)

### Catalog
- CRUD Product (Admin only)
- CRUD Category (Admin only)
- Real-time stock display

### Order
- Create order with cart system
- Automatic stock deduction via Core API
- Order history per user
- Order status tracking (Pending, Confirmed, Shipped, Delivered, Cancelled)

## Inter-Service Communication

Order Service สื่อสารกับ Core Service ผ่าน **HTTP REST API** ภายใน Docker Network:
- ดึงข้อมูล product และ stock
- อัปเดต stock เมื่อมีการสั่งซื้อ

## Project Structure

```
WMS/
├── docker-compose.yml
├── init.sql
├── wms-client/          # React SPA
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── wms-core-api/        # .NET 10 Web API
│   ├── Dockerfile
│   ├── Controllers/
│   ├── Models/
│   ├── Data/
│   ├── DTOs/
│   └── Services/
└── wms-order-api/       # Go Fiber v3 API
    ├── Dockerfile
    ├── handlers/
    ├── models/
    ├── routes/
    └── middleware/
```

## Development

### Frontend
```bash
cd wms-client
npm install
npm run dev
```

### Core API
```bash
cd wms-core-api
dotnet restore
dotnet run
```

### Order API
```bash
cd wms-order-api
go mod tidy
go run main.go
```

## Environment Variables

### wms-core-api
| Variable | Default |
|----------|---------|
| ConnectionStrings__DefaultConnection | Host=postgres;Port=5432;Database=wms_core;Username=wms;Password=wms123 |
| Jwt__Key | your-super-secret-key... |
| Jwt__ExpiryHours | 24 |

### wms-order-api
| Variable | Default |
|----------|---------|
| DB_HOST | postgres |
| DB_PORT | 5432 |
| DB_NAME | wms_order |
| JWT_SECRET | your-super-secret-key... |
| CORE_API_URL | http://wms-core-api:8080 |
