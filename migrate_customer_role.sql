-- Run this against your wms_core database to update the schema and seed the Customer user:
INSERT INTO "Users" ("Id", "Email", "PasswordHash", "FullName", "Role", "CustomerId", "CreatedAt")
VALUES ('f3333333-3333-3333-3333-333333333333', 'customer@wms.com', '$2a$10$zGZANI4ET6leMHveXOgwQ.FeeXVxgWTsmjpNJxWhQpsoQ.0gf0x8O', 'Customer Account', 'Customer', '99999999-9999-9999-9999-999999999999', NOW())
ON CONFLICT ("Email") DO UPDATE SET "Role" = EXCLUDED."Role", "CustomerId" = EXCLUDED."CustomerId";
