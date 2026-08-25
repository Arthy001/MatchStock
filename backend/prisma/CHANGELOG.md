# Changelog ของ Prisma Schema

บันทึกการเปลี่ยนแปลงทุกครั้งที่ `schema.prisma` ใน repo นี้ถูก sync จากโค้ด backend ตัวจริง

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
