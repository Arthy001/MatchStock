# Changelog ของ Prisma Schema + API Docs

บันทึกการเปลี่ยนแปลงทุกครั้งที่ `schema.prisma` หรือ `docs/openapi.yaml` ใน repo นี้ถูก sync จากโค้ด backend ตัวจริง

## 2026-09-01 (3) — Implement Goods Receipt Lines + Flexible Putaway เข้า backend จริง

ต่อยอดจาก commit `ce4aa7b` (rework goods receipt schema with lines and flexible putaway design) - ตอนตรวจสอบ backend เทียบกับ `schema.prisma` บน develop พบว่าฟีเจอร์นี้ยังไม่ได้ implement เข้า backend เลย รอบนี้คือ **implement เข้าจริงครบทุกจุดตาม `docs/RECEIVING_AND_PUTAWAY_DESIGN.md` ทดสอบ end-to-end บน local Docker และ production แล้ว**:

1. **`GoodsReceipt`**: เพิ่ม `supplierId`/`poNumber`/`supplierInvoiceNo`/`photoUrls` จริง (FK constraint จริงสำหรับ `supplierId` -> `suppliers.id` ON DELETE SET NULL)
2. **`GoodsReceiptLine` (โมเดลใหม่)**: `quantity`/`damagedQuantity`/`putawayQuantity`/lot-expiry/`unitCostMinor`/`binLocationId` ตาม spec เป๊ะ - **ตัดสินใจ implementation**: ไม่มี `@relation`/FK constraint ให้ `goodsReceiptId`/`productId`/`binLocationId` โดยตั้งใจ (ต่างจาก commit `ce4aa7b` ที่เขียนไว้) เพื่อให้ตรงกับ convention เดิมของทั้งตระกูล stock-transactions (`GoodsReceipt`/`GoodsIssue`/`StockTransfer` ทุกตัวเป็น plain UUID column ไม่มี FK มาตั้งแต่ต้น) - validate ที่ service layer ผ่าน `getByIdInCompany()` แทน
3. **1-Step vs 2-Step Putaway**: `POST /goods-receipts` รับ `lines[]` พร้อม header ได้เลย - line ที่ระบุ `binLocationId` จะ `putawayQuantity = quantity` ทันที (1-Step), ถ้าไม่ระบุจะสร้างแบบ staged (`putawayQuantity: 0`) รอ 2-Step
4. **`GET /goods-receipts/staged-items`**: คิวงาน Putaway ที่ยังไม่เสร็จ (`quantity > putawayQuantity`) - join กับ receipt/product ผ่าน `$queryRaw` (เทียบคอลัมน์สองตัวในแถวเดียวกัน Prisma query builder ทำไม่ได้ ต้อง raw SQL แบบเดียวกับ `ReportsService.getStockValuation()`)
5. **`GET /putaway/suggest-bin`**: แนะนำ bin ตาม free capacity เท่านั้น (`maxCapacity` ลบยอด `putawayQuantity` ที่ลงไปแล้วในแต่ละ bin ผ่าน ledger นี้) - **ข้อจำกัดที่ทราบ**: schema ปัจจุบันไม่มี zone/category บน `BinLocation` เลย จับคู่ตาม "หมวดหมู่สินค้า" ตามที่ design doc อธิบายไว้ไม่ได้จริง เป็นแค่ soft suggestion ตาม capacity อย่างเดียว (design doc เองก็ระบุว่าไม่บังคับ override ได้เสมอ)
6. **`POST /putaway/confirm`**: รองรับ partial/multi-bin putaway (design doc ยง4.1) - line หนึ่งมี `binLocationId` ได้แค่ช่องเดียว ดังนั้นการวางแบบแยกหลาย bin จะ **หด `quantity` ของ line เดิมที่ยัง staged อยู่ ลง และสร้าง line ใหม่ที่ปิดงานแล้ว (`putawayQuantity == quantity`) ชี้ไปที่ bin เป้าหมาย** แทนที่จะพยายามเก็บสอง bin ไว้ในแถวเดียว - ทดสอบ full close + partial split + over-confirm (400) + cross-tenant isolation (404) ผ่านหมดบน local Docker
7. **`docs/openapi.yaml`**: แทนที่ placeholder ที่ทีมเขียนไว้ล่วงหน้า (`StagedItemDto`/`PutawaySuggestionResponseDto`/`PutawayConfirmDto`) ด้วย spec จริงจาก live `/api-docs-json` (`GoodsReceiptLine`/`CreateGoodsReceiptLineDto` จริง) เพราะฟีเจอร์นี้ implement เสร็จแล้ว ไม่ใช่ placeholder อีกต่อไป

**ทดสอบแล้ว**: 1-Step direct putaway, 2-Step staged->confirm เต็มจำนวน, partial putaway แยก 2 bin (60+35), over-confirm เกินจำนวนคงเหลือ block ด้วย 400, cross-tenant เข้าถึง line คนอื่นไม่ได้ (404) - ยืนยันบน production (`match-stock.ddns.net`, path เพิ่มจาก 90 เป็น 93) แล้ว ไม่ใช่แค่ local

**ยังไม่ทำรอบนี้ (นอกขอบเขต design doc)**: reconciliation ระหว่าง stock ที่นับผ่าน `GoodsReceiptLine` (barcode/manual) กับ stock ที่นับผ่าน Tag/RFID (`GET /warehouses/:id/stock` เดิม) - เป็นสองระบบนับสต็อกคู่ขนานที่ยังไม่เชื่อมกัน

## 2026-09-01 — Sync `docs/openapi.yaml` จาก live spec จริงอีกรอบ + แก้ Swagger cache

**ปัญหาที่พบ**: หลังจากงาน isDeleted rollout เมื่อวาน (`DELETE /{id}` ใหม่ให้ 10 master-data model) เอกสาร `docs/openapi.yaml` **ไม่เคย sync ตามเลย** — ยัง"ไม่มี" `delete:` method ให้ endpoint พวกนี้แม้แต่ตัวเดียว (มีแค่ `get`/`patch`) และตัวอย่าง response ยังไม่มี field `isDeleted` เลยด้วย

**สาเหตุที่ Swagger (live `/api-docs`) เองก็ดู "ไม่เปลี่ยน" ทั้งที่โค้ดจริงอัพเดทแล้ว**: `/api-docs`/`/api-docs-json` ไม่เคยส่ง `Cache-Control` header เลย ทำให้ browser ใช้ heuristic cache ของตัวเองได้ตามใจ (reload ธรรมดาอาจไม่ re-fetch จริง) — เพิ่ม `Cache-Control: no-store` ให้ทั้งสอง route แล้ว (`main.ts`) ตาม pattern เดียวกับ `platform.html`/`monitoring.js` ที่ทำไว้อยู่แล้วในแอปนี้

**การแก้ไข `docs/openapi.yaml`**:
- ดึงจาก `GET https://match-stock.ddns.net/api-docs-json` ตรงๆ อีกครั้ง (source เดียวกับ PR #13) — คราวนี้ **ไม่ได้ทับทั้งไฟล์แบบ PR #13** เพราะพบว่าไฟล์เดิมมี "hand-written forward-spec" ของทีมอยู่ 11 path (`/billing/*`, `/platform/billing/*`, `/platform/subscription-plans*`, `/goods-receipts/staged-items`, `/putaway/*`) ที่**ตั้งใจไม่โผล่ใน live spec** (controller เหล่านี้เป็น `@ApiExcludeController()` ทั้งหมด - Billing/Platform เป็น internal, ส่วน putaway/staged-items ยังไม่ implement จริง) — ทับทั้งไฟล์แบบเดิมจะ**ลบเอกสารพวกนี้ทิ้งโดยไม่ตั้งใจ**
- แก้เป็น **merge**: sync ทุก path/schema ที่มีอยู่จริงใน live spec (รวม `delete:` ใหม่ทั้ง 10 model + example ที่มี `isDeleted` ถูกต้อง) แต่ยังคง 11 path + 10 schema (`SubscribeRequestDto`, `CreateSubscriptionPlanDto`, `StagedItemDto`, ฯลฯ) ที่ทีมเขียนไว้ล่วงหน้าไว้ครบ ไม่ลบทิ้ง

**ยืนยันแล้ว**: `/api-docs` และ `/api-docs-json` มี `Cache-Control: no-store` จริงบน production, ไฟล์ที่ sync ใหม่มี 97 path (86 จาก live + 11 ที่เก็บไว้) ตรวจ `delete:` ของ Product/Category/Warehouse/Units ฯลฯ มีครบทุกตัว

## 2026-08-31 — Implement Subscription Quotas, Feature Gating, Company Scoping และ Billing API เข้า backend จริง

ต่อยอดจาก `docs/TENANT_USER_SUBSCRIPTION_PLAN.md` + ส่วน Backend ของ `docs/BACKEND_FRONTEND_IMPLEMENTATION_GUIDE.md` — schema.prisma/openapi.yaml ของ repo นี้ระบุ spec ไว้แล้ว (commit `2fa27ea`) รอบนี้คือ **implement เข้า backend จริงครบทุกจุด ทดสอบ end-to-end บน local Docker และ production แล้ว**:

1. **Migration ใหม่** (`20260831150000_subscription_quotas_company_scoping_menu_gating`): `User.companyId`, `Supplier.companyId`, `Warehouse.companyId` (ทุกตัว nullable + FK ไป `Company`), `SubscriptionPlan.maxWarehouses`/`maxProducts`, `MenuItem.requiredFeature`
2. **Feature Gating จริง**: `EntitlementGuard` เช็ค `@RequireFeature('code')` เทียบกับ `SubscriptionPlan.features` ของ tenant ปัจจุบัน หลังผ่านเช็ค active แล้ว — ติดตัวอย่างจริงที่ `GET /reports/stock-valuation` (`reports.valuation`) และ `GET /reports/moving-analysis` (`reports.moving_analysis`)
3. **Quota Enforcement จริง**: `UsersService.createInCompany()`/`WarehousesService.createWarehouse()`/`ProductsService.createProduct()` เช็ค `COUNT < plan.maxXxx` ก่อนสร้างเสมอ throw `403 QUOTA_EXCEEDED` ตาม payload ที่ spec กำหนดเป๊ะ
4. **Billing API ใหม่**: `GET /billing/current-subscription` (แพ็กเกจ+โควตาการใช้งานจริง), `POST /billing/subscribe` (ทางลัดขั้นตอนเดียว ครอบ `createSubscription()`+`checkout()` เดิม รองรับ upgrade แบบ swap แผนในที่), `POST /billing/cancel` (ยกเลิก subscription ปัจจุบันไม่ต้องส่ง id), `GET /platform/billing/subscriptions` (ภาพรวมข้าม tenant), `POST`/`PATCH /platform/subscription-plans` (Platform Admin จัดการแพ็กเกจ) — endpoint เดิม (`/billing/subscriptions`, `/checkout`) ยังอยู่ครบสำหรับ flow 3DS/PromptPay
5. **Company Scoping (เก็บ field เท่านั้น รอบนี้)**: `companyId` เพิ่มเข้า Create/Update DTO ของ Warehouse/Supplier/User แล้ว บันทึกได้จริง — **ยังไม่กรอง data visibility ตาม company** (ส่วนต่อขยายที่ค้างไว้ตามที่ตกลงกัน)
6. **Menu Feature Gating**: `MenuItemsService.getMenuForUser()` มองเห็นเมนูอัตโนมัติถ้า `MenuItem.requiredFeature` อยู่ใน `plan.features` ปัจจุบัน (หรือถูก grant มือไว้แล้วผ่าน `TenantMenuItem` เดิม) — `platform/menu-items` รับ `requiredFeature` ตอนสร้าง/แก้ได้แล้ว
7. **Seed**: แทนที่ `STARTER`/`GROWTH`/`ENTERPRISE` ด้วย `FREE`/`PRO_MONTHLY`/`ULTRA_MONTHLY` ตาม spec เป๊ะ (ราคา/โควตา/ฟีเจอร์ครบ) — plan เก่าถูก deactivate ไม่ลบ (ยัง resolve ได้สำหรับ subscription เก่าที่ migrate ไม่ทัน) — **migrate `Subscription.planCode` ของทุก tenant ที่มีอยู่จริงจากโค้ดเก่าไปโค้ดใหม่แล้ว** ตาม tier เทียบเท่า (`STARTER`→`FREE`, `GROWTH`→`PRO_MONTHLY`, `ENTERPRISE`→`ULTRA_MONTHLY`)
8. **บั๊กที่พบและแก้ระหว่างทำ**: global exception filter (`all-exceptions.filter.ts`) เดิมทิ้งฟิลด์ custom ของ HttpException payload (เช่น `error`/`resource`/`currentUsage`) เหลือแค่ `message`/`errors` — ทำให้ payload ของ `QUOTA_EXCEEDED`/`FEATURE_NOT_INCLUDED` ที่ spec กำหนดไว้ไม่ครบตอนตอบกลับจริง แก้ให้ spread field เพิ่มเติมผ่านแล้ว; `prisma/seed.ts` มีบั๊กเดิมค้างอยู่ (`tenantId_email` ไม่ใช่ unique key จริงหลัง migration email-unique-ทั้งระบบ) แก้เป็น `email` ตรงๆ ด้วยเพราะบล็อกการรัน seed ทั้งไฟล์

**ทดสอบแล้ว**: quota block เมื่อเกิน, feature-gate บล็อก FREE tier ไม่ให้เข้า valuation/moving-analysis จริง, เมนูโชว์/ซ่อนอัตโนมัติตามแผน, upgrade/cancel subscription ทำงานถูกต้อง, platform billing overview เห็นข้าม tenant จริง — ทั้งหมดยืนยันบน production (`match-stock.ddns.net`) แล้ว ไม่ใช่แค่ local

**ยังไม่ทำรอบนี้ (ตามที่ตกลง)**: กรอง data visibility ตาม `companyId` จริง (list/get ต่างๆ ยังไม่กรอง), ตัดสิทธิ์ `@RequireFeature` ให้ endpoint อื่นนอกจาก reports 2 ตัว (รอ business ตัดสินใจ mapping ที่เหลือ)

## 2026-08-31 — Rework ระบบรับสินค้า (Goods Receiving) & จัดเก็บ (Flexible Putaway)

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
