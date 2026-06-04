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

| Service       | Technology                                  | Domain                 |
| ------------- | ------------------------------------------- | ---------------------- |
| wms-client    | React 19 + Vite + TypeScript + Tailwind CSS | Frontend SPA           |
| wms-core-api  | .NET 10 Web API + EF Core + PostgreSQL      | Auth + Catalog + Stock |
| wms-order-api | Go Fiber v3 + GORM + PostgreSQL             | Order lifecycle        |

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

# สำหรับการเชื่อมต่อผ่านเครื่องมือภายนอก (เช่น pgAdmin, DBeaver) จากนอก Docker:
# - Host: localhost (หรือ 127.0.0.1)
# - Port: 5432
# - Maintenance Database: wms_core
# - Username: wms
# - Password: wms123

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
docker exec -i wms-postgres-local psql -U wms -d wms_core < migrate_customer_role.sql
```

### 3. Start WMS Core Service (C# Web API)

ตัวโปรเจกต์ .NET จะใช้ค่าคอนฟิกจาก `appsettings.Development.json` โดยอัตโนมัติ ซึ่งตั้งค่าให้เชื่อมต่อฐานข้อมูลและ RabbitMQ ไปยัง `localhost` เรียบร้อยแล้ว:

```bash
cd wms-core-api
dotnet restore
dotnet run
```

_API จะรันอยู่ที่ http://localhost:8080 (Swagger: http://localhost:8080/swagger)_

### 4. Start WMS Order Service (Go Fiber API)

โดยปกติ Go Service จะดึงค่า fallback ไปยัง `localhost` สำหรับ database และ rabbitmq แต่อย่างไรก็ตาม จะต้องระบุ `CORE_API_URL` ให้เชื่อมต่อมายังเครื่องเครื่องตัวเอง:

```bash
cd wms-order-api
go mod tidy

# รันโดยตั้งค่า environment variable สำหรับ local host
CORE_API_URL=http://localhost:8080 go run main.go
```

_API จะรันอยู่ที่ http://localhost:3000 (Swagger: http://localhost:3000/swagger)_

### 5. Start WMS Frontend Client (React)

ตรวจสอบให้แน่ใจว่าติดตั้ง Node.js แล้ว โดย Vite dev server จะทำการ proxy request ไปยัง localhost APIs โดยอัตโนมัติ:

```bash
cd wms-client
npm install
npm run dev
```

_Frontend จะรันอยู่ที่ http://localhost:5173_

## Default Accounts

ระบบได้ทำ seeding บัญชีผู้ใช้เริ่มต้นไว้ 3 roles ในฐานข้อมูลสำหรับการทดสอบ (รหัสผ่านคือ `password123` สำหรับทุกบัญชี):

- **System Administrator (Admin)**
  - **Email:** `admin@wms.com`
  - **Permissions:** จัดการและเข้าถึงข้อมูลทุกส่วนในระบบ รวมถึงการลบข้อมูลลูกค้าและสิทธิ์ควบคุมดูแลทั้งหมด
- **Warehouse Operator (Operator)**
  - **Email:** `operator@wms.com`
  - **Permissions:** สร้าง แก้ไข จัดส่ง ยกเลิกออเดอร์ เคลมคืนสินค้า ดู/เพิ่ม/แก้ไขลูกค้า (ลบไม่ได้) และแก้ไขสินค้า/หมวดหมู่
- **Warehouse Controller (Warehouse)**
  - **Email:** `warehouse@wms.com`
  - **Permissions:** ตรวจสอบและรับสินค้าเข้าสต็อก (Receive Stock) ดูและจัดการสินค้า/หมวดหมู่สินค้า (ไม่สามารถเข้าถึงหน้าออเดอร์และลูกค้าได้)

---

## Security Role Permissions Matrix

| Feature / Resource        | Action                             | Admin | Operator | Warehouse |
| :------------------------ | :--------------------------------- | :---: | :------: | :-------: |
| **Products & Categories** | View                               |  Yes  |   Yes    |    Yes    |
|                           | Add / Edit / Delete                |  Yes  |   Yes    |    Yes    |
| **Stock (Inventory)**     | View Stock                         |  Yes  |   Yes    |    Yes    |
|                           | Receive Stock (รับสินค้าเข้า)      |  Yes  |    No    |    Yes    |
| **Customers**             | View / Add / Edit                  |  Yes  |   Yes    |    No     |
|                           | Delete                             |  Yes  |    No    |    No     |
| **Orders**                | View / Place / Ship / Cancel       |  Yes  |   Yes    |    No     |
|                           | Claim Returns (คืนสินค้าเข้าสต็อก) |  Yes  |   Yes    |    No     |

---

## Features

### 1. Authentication & Authorization

- **Refresh Token Strategy**: รองรับ Access Token และ Refresh Token ในฝั่ง API เพื่อความปลอดภัยในการเข้าถึงทรัพยากร
- **Role-Based Routing & Guards**: หน้าจอและสิทธิ์การกดปุ่มบน Web Client จะปรับเปลี่ยนและถูกล็อกตามบทบาทหน้าที่ของ User ที่เข้าใช้งานโดยอัตโนมัติ

### 2. Inventory & Stock Management

- **Catalog Management**: สามารถเพิ่ม ลบ แก้ไข ข้อมูลสินค้า (Products) และหมวดหมู่ (Categories) ได้โดยทุกบทบาท
- **Receive Stock (การรับสินค้าเข้าคลัง)**: ปุ่ม "Receive Stock" (เฉพาะ Admin และ Warehouse) ในรูปแบบ Modal สำหรับป้อนจำนวนเพื่ออัปเดตระดับสินค้าคงคลังใน Core API
- **Real-time stock display**: แสดงแจ้งเตือน Low Stock เมื่อสินค้าคงคลังเหลือน้อยกว่า 10 ชิ้น

### 3. Order & Shipment Management

- **Order Registry & Checkout**: สร้างออเดอร์จ่ายสินค้าไปยังลูกค้าผ่านเมนูสั่งซื้อแบบตะกร้าสินค้า (Cart System) โดยจะต้องระบุลูกค้าผู้รับสินค้า
- **Order Status Workflow**: ลำดับสถานะออเดอร์ที่เป็นทางการ 4 สถานะ:
  - `pending` (รอขนส่ง)
  - `ordering` (กำลังขนส่ง)
  - `completed` (สำเร็จ)
  - `rejected` (ถูกยกเลิก - เมื่อยกเลิกแล้วระบบจะคืนสินค้าทั้งหมดในออเดอร์กลับเข้าสต็อกทันที)
- **Fulfillment & Stock Returns (การเคลมสินค้า)**:
  - เมื่อคลิกปุ่ม **Ship Order** ออเดอร์จะเปลี่ยนสถานะเป็น `ordering`
  - เมื่อออเดอร์เสร็จสิ้นและคลิกปุ่ม **Complete Order** ออเดอร์จะเปลี่ยนเป็น `completed`
  - ปุ่ม **Claim Items (Returns)** จะช่วยให้เจ้าหน้าที่สามารถเลือกเคลมสินค้าบางรายการในออเดอร์ที่อยู่ระหว่างการขนส่งหรือสำเร็จแล้วกลับเข้าคลัง โดยระบบจะทำการอัปเดตจำนวนสินค้าที่ถูกส่งกลับ (Returned Quantity) และส่งสารผ่าน RabbitMQ Exchange (`wms.direct`) ไปยังคิว `stock.return` เพื่อคืนจำนวนเข้าสต็อกใน Core API อัตโนมัติ

### 4. Printable Invoice Document

- เมื่อสถานะออเดอร์เปลี่ยนเป็น **completed (สำเร็จ)** ปุ่ม **Print Invoice** จะปรากฏขึ้นบนการ์ดออเดอร์
- เมื่อคลิกจะเปิดหน้า Printable Invoice Layout ที่ถูกจัดเตรียมสไตล์ CSS สำหรับการพิมพ์อย่างพรีเมียมโดยเฉพาะ (`@media print`) และเรียกหน้าต่างสั่งพิมพ์ของบราวเซอร์ (`window.print()`) ขึ้นมาให้ทันที แสดงข้อมูลลูกค้า รายการสินค้า ราคาสินค้า จำนวนที่เคลม/คืน และยอดชำระสุทธิ (Net Payable Amount) ที่หักส่วนลดการคืนของเรียบร้อยแล้ว

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

| Variable                               | Default                                                                |
| -------------------------------------- | ---------------------------------------------------------------------- |
| ConnectionStrings\_\_DefaultConnection | Host=postgres;Port=5432;Database=wms_core;Username=wms;Password=wms123 |
| Jwt\_\_Key                             | your-super-secret-key...                                               |
| Jwt\_\_ExpiryHours                     | 24                                                                     |

### wms-order-api

| Variable     | Default                  |
| ------------ | ------------------------ |
| DB_HOST      | postgres                 |
| DB_PORT      | 5432                     |
| DB_NAME      | wms_order                |
| JWT_SECRET   | your-super-secret-key... |
| CORE_API_URL | http://wms-core-api:8080 |
