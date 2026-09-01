# Changelog ของ Prisma Schema + API Docs

บันทึกการเปลี่ยนแปลงทุกครั้งที่ `schema.prisma` หรือ `docs/openapi.yaml` ใน repo นี้ถูก sync จากโค้ด backend ตัวจริง

## 2026-09-01 (7) — ตรวจสอบ + ทดสอบตาม `TENANT_USER_SUBSCRIPTION_PLAN.md` ครบ + ใส่ค่า `maxCompanies` จริง

ตรวจสอบ backend เทียบกับ `docs/TENANT_USER_SUBSCRIPTION_PLAN.md` ทั้งฉบับ (เอกสารอัปเดตใหม่ มีตาราง `maxCompanies` เพิ่มมาที่ยังไม่เคยตรวจ) ด้วยการทดสอบจริงบน local Docker ไม่ใช่แค่อ่านโค้ด:

**ตรงและยืนยันด้วยการทดสอบแล้ว**: Company Scope concept (§1) ตรงกับที่ implement ไว้เป๊ะ, ตัวเลขโควตา `maxUsers`/`maxWarehouses`/`maxProducts`/`maxDevices` และ `features[]` ทั้ง 3 แพ็กเกจตรงกับ production 100%, quota enforcement, EntitlementGuard, Dynamic Menu

**เพิ่ม `maxCompanies` ค่าจริงตามเอกสาร** (ก่อนหน้านี้เป็น `null`/admin กำหนดเองตามที่ user เคยสั่งไว้ - ตอนนี้เอกสารระบุตัวเลขชัดแล้ว user เลยให้ใส่ตามนั้น): `FREE:1`, `PRO_MONTHLY:3`, `ULTRA_MONTHLY:9999` (unlimited ตาม convention เดียวกับ `maxWarehouses`/`maxProducts` ของ ULTRA) - เพิ่มใน `seed.ts` และใส่ค่าจริงลง production/local ตรงๆ ผ่าน script เดียวกับที่เคยใช้ตอน migrate plan (ไม่รัน seed.ts เต็มไฟล์ใส่ production) - ทดสอบแล้ว: FREE โดน `company.multi_branch` feature-gate บล็อกอยู่แล้วตั้งแต่ก่อนถึง quota, PRO ที่มี 3 companies อยู่แล้วสร้างที่ 4 โดน `QUOTA_EXCEEDED` ถูกต้อง

**Gap ที่เจอจากการทดสอบจริง (แจ้งไว้ ยังไม่ได้แก้ - รอ business ตัดสินใจ/เป็นงานแยก)**:
- `stock.lot_expiry` **ไม่ถูก enforce เลย** - tenant FREE ใส่ Lot/วันหมดอายุตอนรับสินค้าได้ปกติ ทดสอบยืนยันแล้ว
- `stock.fefo` (FEFO Engine) **ไม่มี logic นี้อยู่จริง** - dispatch-by-quantity เป็น FIFO ไม่ใช่ FEFO
- `sales_orders.manage` **ไม่มีโมดูล Sales Order อยู่จริงเลย** ทั้งที่ PRO อ้างว่ามี
- `reports.expiring_soon` ไม่มี endpoint รายงานนี้ (มีแค่ stock-card/moving-analysis/stock-valuation)
- `rbac.custom_roles` ไม่ตรงกับของจริง - `Role` เป็น catalog กลางระดับ platform ใช้ร่วมกันทุก tenant ไม่ใช่ custom เฉพาะ tenant
- Barcode "สร้าง" บาร์โค้ด (CODE128/EAN13/QR) - มีแค่เก็บค่าที่สแกน/กรอกเอง ไม่มี logic สร้างภาพจริง
- §2.2 ของเอกสารพูดถึงตาราง `zones` - ไม่มี model นี้อยู่จริง (มีแค่ `bin_locations`)

**ตรวจสอบแล้วไม่แก้**: `POST /cycle-counts` ที่ gate ด้วย `cycle_count.barcode` (PR ก่อนหน้า) - ตรวจโค้ดจริงพบว่า mechanism เป็น RFID Tag-based ล้วน (`expectedTags`/`tagId`) ไม่ใช่บาร์โค้ดเลย ชื่อ feature ไม่ตรงกับ mechanism จริง แต่ user ยืนยันให้คงไว้เหมือนเดิม (ไม่เปลี่ยนเป็น `cycle_count.rfid_hybrid`) - บันทึกไว้เผื่อทีมอื่นสงสัยว่าทำไม feature ชื่อ "barcode" ถึง gate endpoint ที่เป็น RFID

## 2026-09-01 (6) — Reserve/Release quantity, Company Data Isolation, Feature-gating ขยาย, `maxCompanies`

ทำ 4 เรื่องที่ user ขอเพิ่มพร้อมกัน หลังตัดสินใจเรื่อง risk แต่ละอย่างแล้ว:

1. **Wire `reserve`/`release` เข้า `StockBalanceService`**: `POST /goods-issues/:id/reserve` และ `/release` รับ `lines[]` เพิ่ม (นอกจาก `tagIds` เดิม) - เพิ่ม/ลด `StockBalance.quantityReserved` โดยไม่แตะ `quantityOnHand` - **หมายเหตุ**: reserve ผ่านทางนี้กับ dispatch ตรงผ่าน `POST /goods-issues` (`lines[]`, implement ไปก่อนหน้า) เป็นคนละ bookkeeping กัน ยังไม่เชื่อมกัน (dispatch ตรงไม่ได้ไปลด quantityReserved ที่เคย reserve ไว้)
2. **Company Data Isolation**: เพิ่ม `companyId` เข้า JWT payload (เหมือน `role` - เปลี่ยนแล้วมีผลตอน login/refresh ครั้งถัดไป) กรอง `Warehouse`/`Supplier`/`User` ตาม company ของผู้ใช้ที่ login อยู่ - `companyId: null` (HQ/tenant-wide) เห็นทุกอย่าง, `companyId` ระบุค่า เห็นเฉพาะของ company ตัวเอง + ของที่ยังไม่ผูก company (`null`) - บังคับใช้ที่ `getByIdInCompany()` ด้วยไม่ใช่แค่ list เพื่อกันการอ้างอิงข้าม company ตอนสร้างธุรกรรม (GoodsReceipt/GoodsIssue/ฯลฯ) ด้วย
3. **ขยาย Feature-gating** (`@RequireFeature`) ไป 6 endpoint ใหม่ ตามที่ user ยืนยันว่า **บังคับกับทุก Tenant ทันทีไม่ grandfather**: `POST /warehouses/:id/bins` (`warehouse.bins`), `POST /stock-transfers` (`stock.transfer`), `POST /stock-adjustments` (`stock.adjustment`), `POST /cycle-counts` (`cycle_count.barcode`), `POST /webhook-subscriptions` (`integrations.webhooks`), `POST /companies` (`company.multi_branch`) - **ตั้งใจไม่แตะ** `rfid.tags`/`hardware.mqtt_devices` (เสี่ยงตัดขาดข้อมูลจากอุปกรณ์ที่เชื่อมต่ออยู่จริงแบบกู้คืนไม่ได้ ต่างจาก endpoint อื่นที่แค่ 403 หน้าจอ) และ `integrations.api_access`/`sales_orders.manage`/`reports.expiring_soon`/`stock.fefo`/`rbac.custom_roles` (ไม่มี endpoint ที่ map ตรงๆ ได้ - บาง feature ยังไม่ implement จริงด้วยซ้ำ เช่น FEFO ยังใช้ FIFO อยู่)
4. **`SubscriptionPlan.maxCompanies`**: quota ใหม่สำหรับจำกัดจำนวน Company/branch ต่อ tenant - **ไม่ seed ค่าตายตัวต่อแพ็กเกจ** ตามที่ user บอกว่าอยากให้ Platform Admin กำหนดเองได้ (`null` = ไม่จำกัด ทุกแพ็กเกจเริ่มต้นแบบนี้จนกว่า admin จะตั้งค่า)

**บั๊กเอกสารที่แก้ไปด้วย**: `HYBRID_INVENTORY_ARCHITECTURE.md` §3 `'shipped'` → `'exited'` (ตามที่แจ้งไว้ก่อนหน้า)

**ทดสอบแล้วบน local Docker ทุกจุด**: feature-gate บล็อก FREE tenant จริง (403 FEATURE_NOT_INCLUDED) ปล่อยผ่าน PRO เหมือนเดิม, company isolation กรอง warehouse ถูกต้อง (user ที่ผูก Company A ไม่เห็น warehouse ของ Company B แต่เห็นของ Company A + ของที่ไม่ผูก company ใดเลย, 404 ตรงเมื่อพยายามเข้าถึงข้าม company), maxCompanies บล็อกถูกต้องเมื่อ admin ตั้ง quota ไว้ - ยืนยันบน production แล้ว (deploy + migrate สำเร็จ, health check + smoke test ผ่าน)

## 2026-09-01 (5) — Implement Hybrid Inventory (StockBalance + Outbound/Transfer/Adjust) เข้า backend จริงครบ

ต่อยอดจาก entry ก่อนหน้า (`StockBalance`/`GoodsIssueLine`/`StockTransferLine`/`StockAdjustmentLine` ที่ DevOps เขียน schema ไว้ก่อน) - รอบนี้คือ **implement เข้า backend จริงครบทุกจุด ทดสอบ end-to-end บน local Docker และ production แล้ว**:

1. **`StockBalanceService`** (`add`/`deduct`/`transfer`/`reserve`/`releaseReservation`) - atomic SQL ตาม `DATABASE_PERFORMANCE_OPTIMIZATION_GUIDE.md` §1 แต่แก้บั๊กสำคัญ: `ON CONFLICT` ตัวอย่างในเอกสารจะไม่ยุบแถว Staging (NULL bin/lot) เข้าด้วยกัน (Postgres ไม่ถือว่า NULL = NULL) - แก้เป็น raw-SQL expression unique index ที่ COALESCE ไปเป็น sentinel แทน (migration `20260902100000_stock_balance_null_safe_unique_index`)
2. **Inbound**: `GoodsReceiptsService.createReceipt()`/`confirmPutaway()` อัปเดต `StockBalance` จริงแล้ว (1-Step ลง bin ทันที, 2-Step ลง Staging แล้วย้ายตอน confirm)
3. **Outbound**: `POST /goods-issues` รับ `lines[]` (`CreateGoodsIssueItemDto`) เพิ่มเข้ามา - หัก `StockBalance` ทันทีในทรานแซกชันเดียวกับสร้าง header (ตรงข้ามกับ Inbound ที่มี Staging - ของออกต้องมีชั้นวางต้นทางเสมอ ไม่มีสถานะ "รอ")
4. **Transfer**: `POST /stock-transfers` รับ `lines[]` (`CreateStockTransferItemDto`) - ประกาศ "pending" พร้อม header เหมือน `tagIds` เดิม **ยังไม่แตะ `StockBalance` จนกว่าจะ `POST /stock-transfers/:id/complete`** (จับเวลาให้ตรงกับฝั่ง Tag ที่มีอยู่แล้ว)
5. **Adjustment**: `POST /stock-adjustments` รับ `quantityLines[]` (`CreateStockAdjustmentItemDto`, `adjustedQuantity` +/-) แยกจาก `lines[]` เดิม (Tag-based) - **ตั้งใจไม่ใช้ชื่อ "Line"** ให้ตรงกับ `StockAdjustmentLineDto` เดิมที่มีความหมายคนละอย่าง (tagId+newStatus) ใช้ชื่อ "Item" ตามที่ schema ที่ DevOps เคย draft ไว้ (orphaned, ไม่มี path ไหนอ้างถึง) แทน - ปิดความเสี่ยงชื่อชนกัน
6. **`GET /stock/balances`, `GET /stock/lookup`** - ใหม่ทั้งคู่ ตามสเปกที่ตั้งใจไว้ใน `HYBRID_INVENTORY_ARCHITECTURE.md` §4 (`lookup` ค้นด้วย SKU/code/barcode ก่อน ถ้าไม่เจอ fallback ไปหา RFID `Tag.tagId`)
7. **`.env`/`docker-compose.yml`**: เพิ่ม `connection_limit=15&pool_timeout=30` ตาม §2 ของ performance guide

**บั๊กที่พบในเอกสารเอง (ยังไม่ได้แก้/ไม่ใช่ backend gap)**: `HYBRID_INVENTORY_ARCHITECTURE.md` §3 (Transaction Lifecycle Matrix) แถว "จ่ายออก (RFID)" เขียนว่า `tag_current_state.status = 'shipped'` - **ค่านี้ไม่มีอยู่จริงใน enum `TagCurrentStatus`** (มีแค่ `unknown/in_stock/exited/missing`, โค้ดจริงใช้ `exited`) ควรแก้ไขคำในเอกสาร

**บั๊กที่พบซ้ำ (ของเดิมที่เคยแก้ใน PR #22 แต่ PR นั้นไม่เคย merge)**: `docs/openapi.yaml` มี duplicate mapping key ซ้ำอีกรอบ (`/goods-receipts/staged-items`, `/putaway/suggest-bin`, `/putaway/confirm` ถูกเขียนทับด้วย placeholder เก่าอีกครั้งจาก commit ที่ merge หลัง PR #22) - `js-yaml` throw error โหลดไฟล์ไม่ผ่านอีกรอบ แก้ไปพร้อมกับรอบนี้แล้ว (ดู PR #22 เดิม ปิดได้เลยเพราะซ้ำซ้อนกับ PR นี้)

**ทดสอบแล้ว**: 1-step/2-step inbound เข้า StockBalance ถูกต้อง, dispatch เกินยอด block, over-dispatch ทำให้ header ไม่ถูกสร้าง (transaction rollback ถูกต้อง), transfer pending ไม่แตะยอดจนกว่าจะ complete, adjustment +/- คำนวณถูกต้องทั้งคู่, validation ทุกจุด (ต้องมีอย่างน้อย 1 ใน lines/quantityLines, quantityLines ต้องมี warehouseId) - ยืนยันบน production แล้ว ไม่ใช่แค่ local

**Known limitation ที่ยังไม่ทำ (นอกขอบเขตรอบนี้)**: reservation ("จองบิล") ยังไม่ต่อเข้า endpoint `POST /goods-issues/:id/reserve`/`release` จริง (มีแค่ `StockBalanceService.reserve()`/`releaseReservation()` พร้อมใช้)

## 2026-09-01 — เพิ่ม Hybrid Inventory Architecture: StockBalance และ Transaction Lines

อัปเดต `schema.prisma` และ `docs/openapi.yaml` เพื่อรองรับทั้งสินค้าบาร์โค้ดนับจำนวน (Bulk / Quantity-based) และสินค้าติดชิป RFID รายชิ้น (Serialized / RFID-based):

1. **`StockBalance` (โมเดลใหม่)**:
   - ตารางบันทึกยอดสต็อกคงเหลือจริง Real-time: `[tenantId, warehouseId, binLocationId, productId, lotNumber]`
   - เก็บ `quantityOnHand` และ `quantityReserved` สำหรับการตรวจสอบยอดคงเหลือความเร็ว $O(1)$
   - เพิ่ม Composite Index `@@index([tenantId, warehouseId, binLocationId])` เพื่อเร่งความเร็ว Query สินค้ารายชั้นวาง 1–3 ms
2. **Transaction Line Items (โมเดลใหม่)**:
   - **`GoodsIssueLine` & `GoodsIssueTag`**: รองรับรายการสินค้าที่จ่ายออกทั้งแบบนับจำนวนและแบบระบุชิป RFID
   - **`StockTransferLine`**: รองรับการโอนย้ายสินค้าข้ามคลัง/ข้ามชั้นวางแบบนับจำนวน (คู่ขนานกับ `StockTransferTag`)
   - **`StockAdjustmentLine`**: รองรับการปรับยอดสต็อกจากการนับของขาด-เกิน
3. **OpenAPI Specs (`docs/openapi.yaml`)**:
   - เพิ่ม `GET /stock/balances` สำหรับดูยอดสต็อกแยกตามคลัง/ชั้นวาง/Lot
   - เพิ่ม `GET /stock/lookup` สำหรับค้นหาตำแหน่งและยอดสินค้าด้วย Barcode/SKU/Tag
   - ปรับ DTOs ของ Goods Issue, Transfer, และ Adjustment ให้รองรับทั้งแบบ `items` (บาร์โค้ด) และ `tagIds` (RFID)
4. **เอกสารสถาปัตยกรรม**: เพิ่ม `docs/HYBRID_INVENTORY_ARCHITECTURE.md` อธิบาย Dual-Engine Design ครบถ้วน

## 2026-09-01 (4) — Sync `schema.prisma` กลับ: 2 field ที่ backend มีอยู่แล้วแต่ docs ตกหล่น

อัปเดต `schema.prisma` เพื่อรองรับระบบรับสินค้าที่ยืดหยุ่นและการจัดเก็บเข้าชั้นวาง (1-Step / 2-Step Putaway):

1. **`GoodsReceipt`**:
   - เพิ่ม `supplierId` (`supplier_id` - Nullable): รองรับการผูกกับ Supplier
   - เพิ่ม `poNumber` (`po_number` - Nullable): รองรับเลขที่ใบสั่งซื้อ PO จากกระดาษ
   - เพิ่ม `supplierInvoiceNo` (`supplier_invoice_no` - Nullable): รองรับเลขที่ใบส่งของ/ใบกำกับสินค้า
   - เพิ่ม `photoUrls` (`photo_urls` - String Array): แนบรูปถ่ายใบส่งของหรือสภาพกล่องสินค้า
   - ผูกความสัมพันธ์กับ `Supplier?`
2. **`GoodsReceiptLine` (โมเดลใหม่)**:
   - ตารางรายการสินค้ารายบรรทัด: `productId`, `quantity` (ยอดรับสมบูรณ์), `damagedQuantity` (ยอดชำรุดตอนตรวจรับ), `putawayQuantity` (ยอดที่ขึ้นชั้นวางแล้ว)
   - ข้อมูล Lot/FEFO: `lotNumber`, `productionDate`, `expiryDate`, `unitCostMinor`
   - พิกัดจัดเก็บ: `binLocationId` (`null` = พักที่จุด Staging รอ Putaway, ระบุค่า = 1-Step Direct Putaway)
   - ผูกความสัมพันธ์กับ `GoodsReceipt`, `Product`, `BinLocation`
3. **เอกสารการออกแบบ**: จัดทำ `docs/RECEIVING_AND_PUTAWAY_DESIGN.md` อธิบาย Workflow และข้อกำหนดระบบครบถ้วน

อัปเดต `schema.prisma`, `seed.ts`, และ `docs/openapi.yaml` เพื่อรองรับระบบ Subscription Packages (Free, Pro, Ultra) และ Multi-Company Scoping:

1. **`SubscriptionPlan`**: เพิ่ม `maxWarehouses` (`max_warehouses`) และ `maxProducts` (`max_products`) สำหรับควบคุมโควตาคลังสินค้าและจำนวน SKU ตามแพ็กเกจ
2. **`MenuItem`**: เพิ่ม `requiredFeature` (`required_feature`) เพื่อให้ Frontend ซ่อน/แสดงเมนูตามชุด `SubscriptionPlan.features` ของ Tenant ปัจจุบัน
3. **Multi-Company Scoping**:
   - `User`: เพิ่ม `companyId` (`company_id`) ผูกกับ `Company` เพื่อจำกัดสิทธิ์พนักงานระดับสาขา/บริษัทย่อย (`null` = เข้าถึงได้ทุกสาขาใน Tenant)
   - `Warehouse` & `Supplier`: เพิ่ม `companyId` (`company_id`) ผูกกับ `Company` เพื่อรองรับคลังสินค้าและซัพพลายเออร์ประจำสาขา
   - `Company`: เพิ่ม Reverse Relations (`warehouses`, `suppliers`, `users`)
4. **`seed.ts`**: เพิ่มข้อมูล Default Subscription Plans 3 ระดับ (`FREE`, `PRO_MONTHLY`, `ULTRA_MONTHLY`) พร้อม Quotas และ Feature Codes
5. **`docs/openapi.yaml`**: เพิ่ม Endpoints หมวด Billing ฝั่ง Tenant (`/billing/*`) และ Platform Admin (`/platform/billing/*`) พร้อม Error Response Models (`402`, `FeatureNotIncludedError`, `QuotaExceededError`)
6. **เอกสารสถาปัตยกรรม**: เพิ่ม `docs/TENANT_USER_SUBSCRIPTION_PLAN.md` สรุปภาพรวมความสัมพันธ์และแผนผังทั้งหมด

## 2026-08-31 — เพิ่ม `isDeleted` ให้อีก 10 master-data model ตามที่ทีมออกแบบไว้ (PR #15)

ต่อยอดจาก entry ด้านล่าง (Soft-Delete Policy) — schema.prisma + docs/openapi.yaml ของ repo นี้ถูกอัพเดทไปก่อนแล้ว (commit `3efb224`) เพิ่ม `isDeleted Boolean @default(false)` ให้ `Unit`, `Brand`, `Manufacturer`, `Supplier`, `Company`, `Category`, `BarcodeSymbology`, `Warehouse`, `BinLocation`, `TaxType` และเปิดให้แก้ผ่าน `UpdateXxxDto` (`PATCH .../{id}` ธรรมดา ไม่มี endpoint DELETE ใหม่)

**สิ่งที่เพิ่มในรอบนี้**: sync field เข้า backend จริง — migration (`20260831140000_master_data_is_deleted`), เพิ่ม `isDeleted` เข้า `UpdateXxxDto`/service `update()` ทั้ง 10 โมเดล, ทดสอบ end-to-end ผ่าน API จริงบน local Docker ครบทุกโมเดล (create → default `false` → PATCH `true` → อ่านค่ากลับถูกต้อง) ไม่มี compile/runtime error

**ข้อควรระวังที่ตั้งใจคงไว้ตามที่ทีมออกแบบ ไม่ใช่บั๊ก**:
1. `isDeleted` เป็นแค่ field เก็บค่า **ไม่ได้กรอง list()/getById() ให้หายไปอัตโนมัติ** — พฤติกรรมเดียวกับ `isActive` ของโมเดลกลุ่มนี้ในปัจจุบัน (ซึ่งก็ไม่เคยกรอง list เช่นกัน) ถ้าต้องการซ่อนจริง ฝั่ง client ต้องกรองเอง หรือรอ backend เพิ่ม logic ภายหลัง
2. **`Company` มี 2 สัญญาณ "ถูกลบ" แยกกัน**: `deletedAt` (ของเดิม ใช้งานจริงผ่าน `DELETE /companies/{id}` มีผลซ่อนจาก list/getById จริง) กับ `isDeleted` ใหม่นี้ (ตั้งค่าผ่าน `PUT /companies/{id}` ได้ แต่ไม่มีผลอะไรกับการมองเห็น) — ทดสอบยืนยันแล้วว่าตั้ง `isDeleted:true` ไม่ทำให้บริษัทหายจาก `GET`, ต้องเรียก `DELETE` จริงเท่านั้นถึงจะซ่อน
3. ไม่มีการเพิ่ม partial unique index ให้ทั้ง 10 โมเดล (ต่างจาก `Product`/`Company` ที่มีอยู่แล้ว) — soft-delete แล้ว `code`/`sku` ของโมเดลกลุ่มนี้ยังใช้ซ้ำไม่ได้

**แก้เพิ่มใน `docs/openapi.yaml`**: `DELETE /products/{id}` ยัง summary/response example ค้างพฤติกรรมเก่า (`isActive:false`, `deletedAt:null`) จากก่อนที่ entry ด้านล่างจะแก้ backend จริง — sync ให้ตรงกับ `ProductsController` ปัจจุบัน (`isDeleted:true`, `deletedAt`/`deletedByType`/`deletedById` มีค่าจริง, `isActive` ไม่ถูกแตะ)

## 2026-08-31 — Soft-Delete Policy: ปิดช่องโหว่ hard-delete/ไม่มีกลไกลบ 6 จุด

**ปัญหาที่พบ**: `DELETE /products/:id` เดิมแค่ flip `isActive` (แค่ suspend ที่ reverse ได้) ไม่เคยเขียน `deletedAt`/`deletedBy*` จริงทั้งที่คอลัมน์มีอยู่แล้ว และมีอีก 5 จุดในระบบที่ hard-delete แถวถาวร (กู้คืน/ตรวจสอบย้อนหลังไม่ได้เลย) หรือไม่มีกลไกลบเลย

**การแก้ไข**:
- **`Product`**: เพิ่ม `isDeleted` เป็นตัวบ่งชี้การลบจริงแบบ one-way (แยกจาก `isActive` ที่ยังเป็น suspend แบบ reverse ได้เหมือนเดิม) `DELETE /products/:id` เขียน `isDeleted:true`+`deletedAt`/`deletedBy*` จริง, `sku`/`code`/`slug` ของสินค้าที่ลบแล้วนำกลับมาใช้ซ้ำได้ทันที (partial unique index)
- **Prisma extension กลาง** (`prisma-soft-delete.extension.ts`) ให้ query ทุกตัวกรอง `deletedAt`/`isDeleted` อัตโนมัติ และบล็อกการ hard-delete บนโมเดลกลุ่มนี้
- **ปิดช่องโหว่เพิ่ม 5 จุด**: `WebhookSubscription` (hard-delete จริง → soft-delete), `ReaderOpsOperator` (ไม่มีกลไกลบเลยทั้งที่เป็นบัญชี MFA login → เพิ่ม `isActive`+soft-delete), `Role`, `TenantMenuItem`, `ProductImage` (ทั้ง 3 เปลี่ยนจาก hard-delete เป็น soft-delete)

**ผลกระทบต่อ API สาธารณะ**: มีแค่ `DELETE /products/{id}` จุดเดียวที่ response เปลี่ยนแบบมีผลต่อผู้ใช้ API จริง (endpoint อื่นที่แก้เป็น platform-admin internal ที่ไม่อยู่ใน public docs อยู่แล้ว หรือ response shape ไม่เปลี่ยน)

**ยังไม่ทำรอบนี้**: soft-delete ให้ master-data อีก ~9 ตาราง — ดู entry ด้านบน (ทำแล้วในรอบถัดมาแบบ `isDeleted` เดี่ยวๆ ไม่ใช่ `deletedAt` แบบเดียวกับที่นี่ เป็นการตัดสินใจที่ต่างกัน)

## 2026-08-28 — แก้ Cross-Origin-Resource-Policy ทำให้ frontend คนละ origin โหลดรูปสินค้าไม่ได้

frontend ที่ host คนละ origin โหลด `<img src="https://match-stock.ddns.net/uploads/products/xxx.jpg">` แล้วโดนเบราว์เซอร์บล็อกด้วย `net::ERR_BLOCKED_BY_RESPONSE.NotSameOrigin` (response เป็น 200 OK จริง แต่ browser ไม่ยอมส่ง byte ต่อให้หน้าเว็บ)

**สาเหตุ**: `helmet()` ใน `src/main.ts` ตั้ง `Cross-Origin-Resource-Policy: same-origin` ให้ทุก response รวมถึง byte ของรูปจาก `ProductImagesController` — ไม่ใช่ปัญหา CORS: `Access-Control-Allow-Origin` แก้ไม่ได้เพราะการโหลด `<img>` เป็น request แบบ no-cors

**การแก้ไข**: set `Cross-Origin-Resource-Policy: cross-origin` เฉพาะ route `GET /uploads/products/:filename` ใน `src/modules/products/product-images.controller.ts` (รูปสินค้าเป็น public, ชื่อไฟล์เป็น UUID ที่ generate ใหม่ทุกครั้ง เดาไม่ได้ — ปลอดภัยที่จะให้ embed ข้าม origin) ไม่ได้ลด CORP ทั้งแอป — scoped เฉพาะ route นี้ pattern เดียวกับ CSP override เฉพาะ `/api-docs` ใน `main.ts`

Deploy ขึ้น production (`match-stock.ddns.net`) แล้ว ยืนยัน header ของ response รูปเปลี่ยนเป็น `Cross-Origin-Resource-Policy: cross-origin` และ `/health` = 200

_หมายเหตุ: entry นี้ไม่ใช่การ sync `schema.prisma`/`docs/openapi.yaml` แต่บันทึกไว้เป็น log การแก้ไข backend ของวันนี้_

## 2026-08-26 — Regenerate docs/openapi.yaml จาก live Swagger spec จริง (PR #13)

เอกสารเดิมมีแค่ 10 endpoint จากที่ backend จริงมี 86 endpoint แถม section "Core Stock Operations & Balances (Preview)" อ้างถึง path ที่ไม่มีอยู่จริงเลย (`/inventory/balances`, `/inventory/transactions/receive` — ของจริงคือ `/warehouses/{id}/stock` และ `/goods-receipts`)

**การแก้ไข**: แทนที่ทั้งไฟล์ด้วยข้อมูลจาก `GET https://match-stock.ddns.net/api-docs-json` ตรงๆ (source เดียวกับหน้า `/api-docs` ที่ generate สดจากโค้ดจริงทุกครั้ง) ไม่ได้พิมพ์มือ เพราะฉะนั้น field name/required/example ทุกตัวตรงกับ backend จริง 100% — ครบทั้ง Units, Brands, Manufacturers, Suppliers, Categories, TaxTypes, BarcodeSymbologies, Tags, Devices, GoodsReceipts, GoodsIssues, StockTransfers, StockAdjustments, CycleCounts, Reports, Import/Export, Webhooks, Alerts, Users ที่ไม่เคยมีเอกสารมาก่อน

**ผลข้างเคียงที่พบและแก้แล้ว**: GitHub secret scanning แจ้งเตือน "Stripe Webhook Signing Secret" หลุดใน `docs/openapi.yaml` 2 จุด — ตรวจแล้วเป็น placeholder ตัวอย่างที่ hardcode ไว้ใน `webhooks.controller.ts` มานานแล้ว (ไม่ใช่ secret จริง ไม่เคยดึงจาก env/production) เป็น false-positive จาก pattern `whsec_` ที่ตรงกับของ Stripe โดยบังเอิญ ไม่ต้อง rotate อะไร

## 2026-08-26 — แก้ field name ของ Product ให้ตรงกับ backend (PR #12)

Front-End เจอ 5-6 จุดที่ field name/หน่วยไม่ตรงกันตอนเทียบ response จริงกับ spec — แก้เอกสารให้ตรงกับ backend แทนการแก้ backend (Front-End มี mapper รองรับชื่อจริงของ backend ไว้แล้ว):
`price`→`sellingPriceMinor`, `barcode`→`barcodeValue`, `widthCm/weightKg/lengthCm/heightCm`→`widthValue/weightValue/lengthValue/heightValue` (หน่วยวัดเลือกได้ต่อ tenant ผ่าน `dimensionUnitId`/`weightUnitId` ไม่ตายตัวที่ cm/kg), `isLotControl`→`lotControlled`, `minReorderQty`→`minReorderQuantity`, `baseUnit`→`unit` (backend enrich object ให้อยู่แล้ว ไม่ใช่ส่งแค่ id) พร้อมแก้ `CreateProductInput.required` ที่ระบุผิด (`baseUnitId`/`price` ไม่ควรบังคับ)
