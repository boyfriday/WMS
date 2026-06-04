import { execSync } from 'child_process';

try {
  console.log('Running ALTER TABLE...');
  const out1 = execSync('psql "postgresql://wms:wms123@localhost:5432/wms_core" -c \'ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "CustomerId" UUID REFERENCES "Customers" ("Id") ON DELETE SET NULL;\'');
  console.log(out1.toString());

  console.log('Running INSERT...');
  const out2 = execSync('psql "postgresql://wms:wms123@localhost:5432/wms_core" -c \'INSERT INTO "Users" ("Id", "Email", "PasswordHash", "FullName", "Role", "CustomerId", "CreatedAt") VALUES (\'\'f3333333-3333-3333-3333-333333333333\'\', \'\'customer@wms.com\'\', \'\'$2b$10$J9sKibJrjclqUwDQfz8HruVX9LM1A1QEVrKExSRB7XZd4ByOEzxeu\'\', \'\'Customer Account\'\', \'\'Customer\'\', \'\'99999999-9999-9999-9999-999999999999\'\', NOW()) ON CONFLICT ("Email") DO UPDATE SET "Role" = EXCLUDED."Role", "CustomerId" = EXCLUDED."CustomerId";\'');
  console.log(out2.toString());
  console.log('Migration successful!');
} catch (err) {
  console.error(err.message);
  if (err.stdout) console.log(err.stdout.toString());
  if (err.stderr) console.error(err.stderr.toString());
}
