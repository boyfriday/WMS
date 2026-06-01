Senior Developer Assignment
ข้อสอบ Senior Developer — Distributed Product Management System
ระยะเวลา: 7 วัน
ส่งงานเป็น Git repository พร้อม README

1. โจทย์
   บริษัทต้องการ distributed system สำหรับจัดการสินค้าและรับคำสั่งซื้อ ผู้สมัครต้องออกแบบและพัฒนาระบบทั้งหมด รวมถึงตัดสินใจ
   เรื่อง architecture, technology choice และ trade-offs ด้วยตัวเอง
2. Scope
   Services (3 services)

   | Service | Language | Domain |
   | :--- | :--- | :--- |
   | Auth Service | เลือกเอง | Identity & access management |
   | Catalog Service | .NET 10 | Product + Category + Stock |
   | Order Service | ไม่ใช่ .NET (เลือกภาษาที่ถนัด) | Order lifecycle |

   Frontend
   React หรือ Next.js — SPA ที่ใช้งานได้จริง

   Communication
   การสื่อสารระหว่าง services ให้ออกแบบเอง

3. Business Requirements
   Authentication & Authorization
   - ผู้ใช้สามารถ register / login / logout ได้
   - ระบบต้องมี role อย่างน้อย 2 ระดับที่มีสิทธิ์ต่างกัน
   - ออกแบบ token strategy เอง
   Catalog
   - จัดการ product และ category (CRUD)
   - จัดการ stock
   Order
   - ผู้ใช้สั่งซื้อสินค้าได้
   - ระบบต้องจัดการ stock เมื่อมีการสั่งซื้อ
   - ผู้ใช้ดู order ของตัวเองได้
