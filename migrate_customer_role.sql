-- Run this against your wms_core database to update the schema and seed the Customer user:
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "CustomerId" UUID REFERENCES "Customers" ("Id") ON DELETE SET NULL;

INSERT INTO "Users" ("Id", "Email", "PasswordHash", "FullName", "Role", "CustomerId", "CreatedAt")
VALUES ('f3333333-3333-3333-3333-333333333333', 'customer@wms.com', '$2b$10$J9sKibJrjclqUwDQfz8HruVX9LM1A1QEVrKExSRB7XZd4ByOEzxeu', 'Customer Account', 'Customer', '99999999-9999-9999-9999-999999999999', NOW())
ON CONFLICT ("Email") DO UPDATE SET "Role" = EXCLUDED."Role", "CustomerId" = EXCLUDED."CustomerId";
