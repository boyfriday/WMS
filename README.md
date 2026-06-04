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

## Running Locally without Docker Compose

หากต้องการรันแต่ละ service บนเครื่องตัวเอง (Local Host) โดยไม่ผ่าน Docker Compose สามารถทำตามขั้นตอนต่อไปนี้ได้:

### 1. Start Infrastructure Services (PostgreSQL & RabbitMQ)

รัน PostgreSQL และ RabbitMQ ในรูปแบบของ standalone Docker container เพื่อให้ระบบเก็บข้อมูลและส่ง message ทำงานได้:

```bash
# 1. รัน PostgreSQL Container
docker run -d \
  --name wms-postgres-local \
  -p 5432:5432 \
  -e POSTGRES_USER=wms \
  -e POSTGRES_PASSWORD=wms123 \
  -e POSTGRES_DB=wms_core \
  postgres:17-alpine

# 2. รัน RabbitMQ Container พร้อม Management Plugin
docker run -d \
  --name wms-rabbitmq-local \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=wms \
  -e RABBITMQ_DEFAULT_PASS=wms123 \
  rabbitmq:4-management-alpine
```

### 2. Initialize Database และใส่ Mock Data

รันคำสั่งด้านล่างเพื่อประมวลผลไฟล์ `init.sql` บน PostgreSQL container ที่สร้างขึ้น เพื่อสร้างฐานข้อมูล ตารางข้อมูล และใส่ mock data:

```bash
docker exec -i wms-postgres-local psql -U wms -d wms_core < init.sql
```

### 3. Start WMS Core Service (C# Web API)

ตัวโปรเจกต์ .NET จะใช้ค่าคอนฟิกจาก `appsettings.Development.json` โดยอัตโนมัติ ซึ่งตั้งค่าให้เชื่อมต่อฐานข้อมูลและ RabbitMQ ไปยัง `localhost` เรียบร้อยแล้ว:

```bash
cd wms-core-api
dotnet restore
dotnet run
```
*API จะรันอยู่ที่ http://localhost:8080 (Swagger: http://localhost:8080/swagger)*

### 4. Start WMS Order Service (Go Fiber API)

โดยปกติ Go Service จะดึงค่า fallback ไปยัง `localhost` สำหรับ database และ rabbitmq แต่อย่างไรก็ตาม จะต้องระบุ `CORE_API_URL` ให้เชื่อมต่อมายังเครื่องเครื่องตัวเอง:

```bash
cd wms-order-api
go mod tidy

# รันโดยตั้งค่า environment variable สำหรับ local host
CORE_API_URL=http://localhost:8080 go run main.go
```
*API จะรันอยู่ที่ http://localhost:3000 (Swagger: http://localhost:3000/swagger)*

### 5. Start WMS Frontend Client (React)

ตรวจสอบให้แน่ใจว่าติดตั้ง Node.js แล้ว โดย Vite dev server จะทำการ proxy request ไปยัง localhost APIs โดยอัตโนมัติ:

```bash
cd wms-client
npm install
npm run dev
```
*Frontend จะรันอยู่ที่ http://localhost:5173*


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
