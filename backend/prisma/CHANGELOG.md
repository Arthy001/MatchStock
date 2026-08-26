# Changelog ของ Prisma Schema

บันทึกการเปลี่ยนแปลงทุกครั้งที่ `schema.prisma` ใน repo นี้ถูก sync จากโค้ด backend ตัวจริง

## 2026-08-26 — ยกเลิกการ revert ก่อนหน้า กลับไปใช้เวอร์ชัน 24b8018 ทั้งไฟล์

ทีมตัดสินใจว่าจะเก็บ schema แบบ sync จาก backend จริง (entry "Sync schema เต็มรูปแบบกับโค้ดจริง" ด้านล่าง) ไว้ต่อไป **ไม่ revert ตามที่บันทึกไว้ใน entry ก่อนหน้านี้** — entry "Revert schema.prisma กลับเป็นเวอร์ชันทีม" ด้านล่างถูกยกเลิกแล้ว (PR #9 merge ไปแล้วแต่ตัดสินใจกลับคำ) `schema.prisma` ตอนนี้คือเนื้อหาที่ commit `24b8018` ทุกประการ

## 2026-08-26 — Revert schema.prisma กลับเป็นเวอร์ชันทีม (ยกเลิกการ sync วันที่ 2026-08-25) — **ถูกยกเลิกแล้ว ดู entry ด้านบน**

**สาเหตุ**: entry ด้านล่าง "Sync schema เต็มรูปแบบกับโค้ดจริง" เป็นการตัดสินใจผิด — repo นี้กับ backend จริง (`d:\Inventory-saas\backend`) ไม่ใช่ระบบเดียวกันคนละเวอร์ชัน แต่เป็นคนละระบบที่ใช้ field naming convention ต่างกันจริงๆ (เช่น `Tenant.companyName/taxId` vs `name/slug`) และทีมนี้มี OpenAPI spec, SQL DDL, โค้ด frontend ที่วางแผนไว้ตาม naming เดิมของตัวเองอยู่แล้ว การเอา schema จาก backend จริงไปทับทั้งไฟล์เมื่อวานเลยลบงานที่ทีมกำลังพัฒนาอยู่ทิ้งไปด้วยโดยไม่ได้ตั้งใจ (เช่น model `Company`/multi-company-branch ที่เพื่อนร่วมทีมต้องเพิ่มกลับเข้ามาเองวันนี้ใน commit `24b8018` เพื่อให้ตรงกับ openapi spec)

**การแก้ไข**: revert `schema.prisma` กลับไปเป็นเวอร์ชันก่อนการ sync (commit `7974ea4`) ตรงๆ — เวอร์ชันนี้มี model `Company`/branch ของทีมอยู่แล้ว (commit `24b8018` วันนี้แค่กู้สิ่งที่ผมลบไปกลับมา ไม่มีอะไรใหม่เพิ่มเติมนอกจากนี้) เพราะฉะนั้น revert ตรงๆ ก็ครบทั้งของเดิมทีมและงานล่าสุดแล้ว

**บทเรียน**: repo `Arthy001/MatchStock` (`backend/prisma/`) กับ backend จริงเป็นคนละระบบ ห้าม sync แบบ replace-ทั้งไฟล์อีก ถ้าจะเอาการเปลี่ยนแปลงจาก backend จริงเข้ามาในอนาคต ต้องทำเป็น field-by-field mapping ที่ตัดสินใจร่วมกับทีมก่อน ไม่ใช่ overwrite ทั้งไฟล์

## 2026-08-25 — User.email เปลี่ยนเป็น unique ทั้งระบบ (แก้ endpoint login)

> **หมายเหตุ**: entry นี้และ entry ด้านล่าง (sync วันที่ 2026-08-25) ถูก revert ไปแล้วตาม entry ด้านบน — เก็บไว้เป็นบันทึกประวัติเท่านั้น

แก้ตาม AC ของ endpoint `POST /api/v1/auth/login`: ต้อง login ด้วย `email` + `password` เท่านั้น ไม่ต้องส่ง `tenantSlug` แล้ว

**model User**: `@@unique([tenantId, email])` → `@@unique([email])` — อีเมลตอนนี้ unique ทั้งระบบ ไม่ใช่แค่ในแต่ละ tenant เหมือนเดิม (index `@@index([tenantId])` ยังอยู่)

**ผลกระทบ**: คนคนเดียวใช้อีเมลเดียวกันเป็นสมาชิกได้แค่บริษัทเดียวเท่านั้น (จากเดิมที่เป็นสมาชิกหลายบริษัทด้วยอีเมลเดียวกันได้) — เช็คแล้วทั้ง local และ production ไม่มีอีเมลซ้ำข้าม tenant อยู่ก่อนแล้ว ไม่กระทบข้อมูลเดิม, migration `20260825171458_user_email_globally_unique` รันผ่านทั้งสองฝั่งแล้ว

โค้ดที่แก้ไปด้วย (นอก schema): `auth.service.ts`, `auth.controller.ts`, `login.schema.ts` (เอา `tenantSlug` ออก), `users.service.ts` และ `companies.service.ts` (เช็ค email ซ้ำแบบ global แทนที่จะเช็คแค่ในเทแนนต์เดียว), หน้า login ของ `monitoring`/`reader-config` dashboard

## 2026-08-25 — Sync schema เต็มรูปแบบกับโค้ดจริง

`schema.prisma` ในไฟล์นี้เก่ามาก ไม่ตรงกับ schema ที่ backend ใช้งานจริง (ทั้ง dev และ prod) เลย
การอัพเดตนี้แทนที่ด้วย schema ปัจจุบันจริง โดยตั้งใจไม่แตะ `seed.ts` และ `migrations/` — อัพเดตเฉพาะ schema เท่านั้น

**model Tenant ปรับโครงสร้างใหม่**: เอา field `companyName`/`taxId` ออก แทนที่ด้วย `name`/`slug` และ enum `TenantStatus` โค้ดส่วนไหนที่ยังอ้างอิง field เก่าอยู่ต้องไปแก้แยกต่างหาก (ไม่ได้รวมอยู่ในงานนี้)

**Model ที่ถูกลบออก** (ไม่มีอยู่แล้ว ถูกแทนที่ด้วย model ชุดใหม่ด้านล่าง): `Company`, `SubscriptionInvoice`, `DiscountType`, `ProductLot`, `InventoryBalance`, `StockTransaction`, `StockTransactionItem`, `StockCount`, `StockCountItem`

**Model ที่เพิ่มเข้ามาใหม่** — ฟีเจอร์ที่ยังไม่มีตอนที่ schema ใน repo นี้ถูกอัพเดตครั้งล่าสุด:
- Auth/platform: `User`, `Role`, `RefreshToken`, `PlatformAdmin`, `PlatformRefreshToken`
- ระบบเรียกเก็บเงิน (Billing): `SubscriptionPlan`, `Subscription`, `Invoice`, `InvoiceLine`, `Payment`, `Refund`, `PaymentWebhookEvent`
- สต๊อกสินค้าแบบ RFID tag (แทนที่ระบบสต๊อกแบบนับจำนวนเดิม): `Tag`, `TagCurrentState`, `TagEvent`, `GoodsReceipt`, `GoodsIssue`, `StockTransfer`, `StockTransferTag`, `StockAdjustment`, `CycleCount`, `CycleCountExpectedTag`, `CycleCountCountedTag`
- อุปกรณ์/เครื่องอ่าน: `Device`, `DeviceCredential`, `DeviceMqttCredential`, `DeviceGpioState`, `DeviceReaderConfig`, `DeviceAntennaConfig`, `DeviceIngestionStat`, `ReaderOpsOperator`, `ReaderModel`
- ระบบเช่า (Rentals): `RentalUnit`, `RentalAssignment`, `RentalShipment`
- เมนู/webhook/audit: `MenuItem`, `TenantMenuItem`, `WebhookSubscription`, `WebhookDeliveryLog`, `AuditLog`, `SecurityEvent`

**Model ที่ยังอยู่ แต่ปรับโครงสร้างภายใน**: `Product`, `Unit`, `Category`, `Supplier`, `TaxType`, `BarcodeSymbology` — เปลี่ยนแค่ระดับ field ไม่ใช่ model ใหม่ (git diff แสดงเป็นลบ+เพิ่มเพราะมีการจัดเรียงลำดับใหม่เยอะ)

**สิ่งที่ยังไม่ได้ทำในรอบนี้**: `backend/src` (โค้ต Express ต้นแบบเดิมใน repo นี้) ยังอ้างอิง schema แบบเก่าอยู่ — compile ไม่ผ่านกับ schema ตัวนี้ ถือเป็นงานแยกที่ใหญ่กว่าการ sync schema เฉยๆ ทางทีมต้องวางแผนเองต่อไป
