# Changelog ของ Prisma Schema + API Docs

บันทึกการเปลี่ยนแปลงทุกครั้งที่ `schema.prisma` หรือ `docs/openapi.yaml` ใน repo นี้ถูก sync จากโค้ด backend ตัวจริง

## 2026-09-04 (15) — Implement `CreateBinLocationDto` fields เข้า backend จริง (ตามที่ DevOps อัพเดท spec ของ `POST /warehouses/:id/bins`)

ตรวจสอบ `docs/openapi.yaml` เทียบ backend จริงหลัง DevOps push commit `3c8417b` ("improve warehouse & bin location creation, shelf field...") พบว่า DevOps เพิ่ม request body ใหม่ (`CreateBinLocationDto`: `code`/`zoneName`/`rack`/`shelf`/`capacityKg`/`maxCapacity`) ให้ `POST /warehouses/:id/bins` (สร้าง bin เดี่ยว) **แต่ backend จริงยังรับแค่ `code`/`maxCapacity`/`zoneId` เท่านั้น** (`zoneName`/`rack`/`shelf`/`capacityKg` เคยเข้าได้ทางเดียวคือผ่าน `POST /warehouses/:id/bins/batch` ของงาน 3D Blueprint) — หลังคุยกับ user แล้ว **implement เข้า backend จริงครบ ทดสอบ end-to-end บน local Docker และ production แล้ว**:

- ขยาย `CreateBinSchema` (Zod, `warehouse.schema.ts`) ให้รับ `zoneName`/`rack`/`shelf`/`capacityKg` เพิ่ม (optional ทั้งหมด ไม่ต้อง migrate schema ใหม่เลยเพราะ column มีอยู่แล้วบน `BinLocation` ตั้งแต่งาน 3D Blueprint) พร้อม validate ความยาว/ค่าติดลบตาม column constraint จริง (`zoneName` ≤100, `rack`/`shelf` ≤50, `capacityKg` ≥0)
- `WarehousesService.createBin()` ส่งต่อ 4 field ใหม่นี้เข้า `BinLocation.create()`
- **ไม่แตะ** `PATCH /warehouses/:id/bins/:binId` (`UpdateBinLocationDto`) เพราะ `docs/openapi.yaml` ไม่ได้ระบุ schema ใหม่ให้ endpoint นี้ในรอบนี้ (ต่างจาก prototype Express server แยกต่างหากที่ DevOps เก็บไว้ใน repo นี้เอง `backend/src/routes/masterData.routes.ts` ซึ่งแก้ทั้ง create และ update — ไฟล์นั้นเป็นคนละ codebase กับ backend จริงที่ deploy อยู่ที่ `match-stock.ddns.net` ไม่ใช่สิ่งที่ backend ทีมจริงต้องตามให้ตรง)

**ทดสอบแล้วบน local Docker + production**: สร้าง bin พร้อม 4 field ใหม่ครบ ยืนยัน persist ถูกต้องทุกค่า, สร้าง bin แบบเดิม (ส่งแค่ `code`) ยังทำงานเหมือนเดิมทุกประการ (`zoneName`/`rack`/`shelf` เป็น `null`, `capacityKg` ใช้ default 500 ตาม schema), validate ความยาว `zoneName` เกิน 100 ตัวอักษรโดนบล็อกถูกต้อง, `PATCH` เดิมไม่กระทบ

## 2026-09-03 (14) — Sync 2 จุดที่ backend จริงมีอยู่แล้วแต่ยังไม่เคยแก้เอกสาร (ตรวจสอบ backend เทียบ schema.prisma/openapi.yaml เต็มไฟล์)

ตรวจสอบ backend จริงเทียบกับ `schema.prisma`/`docs/openapi.yaml` ของ repo นี้แบบเต็มไฟล์ (diff ทุกบรรทัด ไม่ใช่แค่ high-level) เจอ 2 จุดที่ backend จริง implement ไปแล้วตั้งแต่รอบก่อนหน้า (สอดคล้องกับ standing preference ที่หยุด sync เอกสารไว้ชั่วคราว) แต่ยังไม่เคย sync กลับมาที่นี่เลย:

1. **`Supplier.email`** และ **`TaxType.code`/`isInclusive`** (จาก entry (11) MASTER_DATA_TEST_PLAN.md SUP-01/SUP-03/TAX-01) — เพิ่มเข้า `schema.prisma` ของ repo นี้ให้ตรงกับ backend จริงแล้ว
2. **7 endpoint ของ `BillingController` ที่หายไปจาก `docs/openapi.yaml`** ตั้งแต่ตอนแก้บั๊ก `@ApiExcludeController()` ใน entry (10) — ตอนนั้นเพิ่มแค่ 5 path ที่ถูกถามถึงตรงๆ (`/billing/plans`, `/billing/current-subscription`, `/billing/subscribe`, `/billing/cancel`, `/billing/invoices`) ไม่ได้ sync ทั้ง controller: เพิ่ม `GET /billing/subscriptions`, `POST /billing/subscriptions`, `POST /billing/subscriptions/{id}/cancel`, `POST /billing/checkout`, `GET /billing/invoices/{id}`, `GET /billing/payments`, `POST /billing/_mock/complete/{chargeId}` (endpoint dev-only จริง ยังโผล่ใน Swagger spec ตามปกติเพราะ NestJS ไม่ได้ซ่อน route ระดับ decorator ตาม runtime env - แค่ throw 404 เมื่อเรียกใช้นอกโหมด mock) พร้อม schema `CreateSubscriptionDto`/`CheckoutDto` ที่ยังไม่เคยมีอยู่ใน `components/schemas`

**ยืนยันแล้ว**: `npx prisma validate` ผ่านทั้งไฟล์, YAML parse ผ่านไม่มี duplicate key, diff path ระหว่าง `docs/openapi.yaml` กับ live `/api-docs-json` (normalize `/api/v1` prefix ออกแล้ว) เหลือ 0 จุดต่างกันทั้ง 170 endpoint, request/response field ของ Outbound Fulfillment (`pick`/`pack`/`stage-load`) ที่เพิ่มไปใน entry (13) ตรงกับ backend จริง 100% อยู่แล้วตั้งแต่ก่อนรอบนี้

## 2026-09-03 (13) — Implement Outbound Fulfillment feature เข้า backend จริง (ตามที่ DevOps ร่าง spec ไว้ใน `OUTBOUND_FULFILLMENT_GUIDE.md`)

ตรวจสอบตาม `docs/OUTBOUND_FULFILLMENT_GUIDE.md` (§5. Action Items เฉพาะ Backend) พบว่า DevOps ร่าง spec ฉบับเต็มไว้แล้ว (schema + endpoint ใหม่ 3 ตัว) สำหรับ flow เบิกสินค้าออกแบบหลายขั้นตอน (1/2/3/4-Step Pick→Pack→Load→Ship ตามระดับแพ็กเกจ) **แต่ backend ยังไม่มี implementation เลย** (ยิงจริง 404 ทั้ง 3 endpoint บน production ก่อนแก้ ไม่มี field ใหม่ในสคีมาเลย) — user ให้ทำก่อนโดยตั้งใจ (แจ้งว่า "ยังไม่ต้อง" ก่อนหน้านี้ในวันเดียวกัน แล้วกลับมาสั่งให้ "implement ตอนนี้" ในภายหลัง) **implement เข้า backend จริงครบ ทดสอบ end-to-end บน local Docker และ production แล้ว**:

1. **`OutboundWorkflowMode` enum ใหม่** (`ONE_STEP_DIRECT`/`TWO_STEP_PICK_SHIP`/`THREE_STEP_PACK`/`FOUR_STEP_ENTERPRISE`) และ **`GoodsIssueStatus` enum ใหม่** (`draft`/`reserved`/`picking`/`picked`/`packing`/`packed`/`staged_for_loading`/`completed`/`cancelled`)
2. **`Warehouse.outboundMode`**: ค่า default ต่อคลัง กำหนดว่าใบเบิกที่สร้างจากคลังนี้จะใช้ flow แบบไหน — **snapshot ค่านี้ลงบน `GoodsIssue.workflowMode` ตอนสร้างใบเบิกทันที** (ตั้งใจเลือกแบบนี้เพื่อไม่ให้การเปลี่ยนค่า default ของคลังทีหลังไปกระทบใบเบิกที่กำลังดำเนินการอยู่ - เป็นการตัดสินใจด้าน engineering ที่เอกสารไม่ได้ระบุไว้ตรงๆ)
3. **`GoodsIssue`**: เพิ่ม `soNumber`/`salesOrderId` (plain field ไม่มี FK จริง - ตรงกับ convention เดิมของทั้งตระกูล GoodsReceipt/GoodsIssue/StockTransfer ที่ไม่มี relation บน field อ้างอิงข้ามโมดูล และตอนนี้ระบบยังไม่มี SalesOrder module ให้ validate อยู่ดี), `workflowMode`, `status`, `packageTrackingNo`/`shippingCarrier`/`cartonBarcode`/`stagingDockBarcode`/`totalWeightKg`/`boxCount`, `pickedAt`/`packedAt`/`stagedAt`/`dispatchedAt`
4. **`GoodsIssueLine`**: เพิ่ม `pickedQuantity`/`packedQuantity`/`dispatchedQuantity` (แยกจาก `quantity` เดิมที่หมายถึงจำนวนที่ตั้งใจเบิก)
5. **Behavior ของ `POST /goods-issues` เปลี่ยนแบบมีเงื่อนไข**: ถ้าคลังเป็น `ONE_STEP_DIRECT` (ค่า default) พฤติกรรมเดิมทุกอย่างไม่เปลี่ยน (หัก `StockBalance` ทันที, `status: completed`) — ถ้าเป็นโหมดหลายขั้นตอนจะ **จอง (reserve)** สต็อกแทนการหักทันที (`status: reserved`) และบังคับต้องส่ง `lines[]` มาด้วย (สร้างแบบไม่มี line ไม่ได้อีกต่อไปสำหรับโหมดนี้)
6. **Endpoint ใหม่ 3 ตัว**:
   - `POST /goods-issues/:id/pick` — บันทึกการหยิบสินค้าที่ชั้นวาง รองรับ resolve จาก `productBarcode`/`binBarcode` หรือ id ตรงๆ ก็ได้ หยิบบางส่วนได้ (partial pick, สถานะเปลี่ยนเป็น `picking` จนกว่าจะหยิบครบทุก line ถึงเปลี่ยนเป็น `picked`) กันการหยิบเกิน (`pickedQuantity` เกิน `quantity` ของ line) และกันการหยิบซ้อนพร้อมกันแบบ concurrent ด้วย atomic guard เดียวกับที่ `StockBalanceService` ใช้อยู่แล้ว
   - `POST /goods-issues/:id/pack` — บันทึกการแพ็ค (carton barcode, น้ำหนัก, ผู้ขนส่ง, เลข tracking) ปฏิเสธถ้าใบเบิกเป็น `ONE_STEP_DIRECT`/`TWO_STEP_PICK_SHIP` (ไม่มีขั้นตอนแพ็คในสองโหมดนี้) หรือสถานะยังไม่ถึง `picked`
   - `POST /goods-issues/:id/stage-load` — บันทึกการนำไปเตรียมที่จุดขึ้นรถ **เฉพาะ `FOUR_STEP_ENTERPRISE` เท่านั้น** ปฏิเสธโหมดอื่นทั้งหมด
7. **`POST /goods-issues/:id/dispatch` ขยาย**: ยังรองรับ flow RFID เดิม (`tagIds`) เหมือนเดิมทุกประการ — เพิ่ม branch ใหม่สำหรับปิดงานแบบอิงจำนวน (ไม่ส่ง `tagIds`) ที่เช็คว่าสถานะปัจจุบันตรงกับขั้นตอนสุดท้ายที่โหมดนั้นต้องผ่านก่อน (`TWO_STEP_PICK_SHIP` ต้อง `picked`, `THREE_STEP_PACK` ต้อง `packed`, `FOUR_STEP_ENTERPRISE` ต้อง `staged_for_loading`) ปฏิเสธ `ONE_STEP_DIRECT` ตรงๆ (ปิดงานไปตั้งแต่ตอนสร้างแล้ว ไม่มีอะไรให้ dispatch อีก)
8. **Feature gating ใหม่ 2 รหัส** (เพิ่มเข้า `PRO_MONTHLY`/`ULTRA_MONTHLY` ตามที่เอกสารระบุ): `outbound.pick_pack` (PRO ขึ้นไป) คุม `POST .../pack`, `outbound.enterprise_staging` (ULTRA เท่านั้น) คุม `POST .../stage-load` — **`POST .../pick` ตั้งใจไม่ gate ตามเอกสารระบุตรงๆ**
9. **Migration ใหม่** (`20260903120000_outbound_fulfillment`): เพิ่ม enum + column ทั้งหมดข้างต้น พร้อม backfill ใบเบิกเก่าที่มีอยู่แล้วให้เป็น `status: completed`/`dispatchedAt: issuedAt` (เพราะทุกใบที่มีอยู่ก่อนหน้านี้ถูกสร้างภายใต้ flow แบบหักทันทีเดิมทั้งหมด)

**ทดสอบแล้วบน local Docker + production**: ครบทั้ง 4 โหมดแบบ end-to-end จริง (เช็ค `StockBalance` ก่อน-หลังทุกขั้นตอน ไม่ใช่แค่ดู HTTP 200) — `ONE_STEP_DIRECT` ยืนยัน byte-for-byte เหมือนพฤติกรรมเดิมก่อนแก้ทุกจุด, `TWO_STEP_PICK_SHIP`/`THREE_STEP_PACK`/`FOUR_STEP_ENTERPRISE` ยืนยันครบ reserve→pick→(pack)→(stage-load)→dispatch พร้อมตัวเลข `quantityOnHand`/`quantityReserved` ถูกต้องทุกขั้น, หยิบบางส่วน (partial pick) แล้วสถานะค้างที่ `picking` จนกว่าจะครบ, resolve จาก barcode ถูกต้อง, หยิบเกินโดนบล็อก, เรียก endpoint ผิดลำดับ/ผิดสถานะโดนบล็อกทุกจุด (pack ก่อน pick, stage-load บนโหมดที่ไม่ใช่ enterprise, dispatch ก่อนถึงสถานะที่ต้องผ่าน, dispatch ซ้ำบนใบที่ `ONE_STEP_DIRECT` ปิดไปแล้ว), สร้างใบเบิกแบบไม่มี line บนคลังที่เป็นโหมดหลายขั้นตอนโดนบล็อก, feature-gating ยืนยันถูกต้อง (PRO ใช้ pack ได้แต่โดน 403 ที่ stage-load, ULTRA ใช้ได้ทั้งคู่)

**ข้อสังเกตที่เจอระหว่างทดสอบ ไม่ใช่บั๊กของฟีเจอร์นี้**: tenant ที่ไม่มี subscription หรือ subscription ไม่ active สามารถเรียก `/pack`/`/stage-load` ผ่านได้อยู่ดีแม้ไม่มีสิทธิ์ตามแพ็กเกจ — สาเหตุมาจาก `EntitlementGuard` กลางของระบบตั้งค่า `ENTITLEMENT_ENFORCEMENT=warn` อยู่ (ทั้ง local และ production) ซึ่งเป็นกลไก safety valve เดิมของระบบสำหรับช่วง rollout (M4 grandfather migration) ที่ log แจ้งเตือนอย่างเดียวไม่บล็อกจริง จนกว่าจะ flip เป็น `enforce` — มีผลเหมือนกันกับทุก endpoint ที่ใช้ `@RequireFeature()` อยู่แล้วในระบบ ไม่ใช่เรื่องเฉพาะฟีเจอร์นี้ (เมื่อ subscription active จริง ระบบเช็คสิทธิ์ถูกต้อง 100% ตามที่ทดสอบยืนยันไว้ข้างต้น)

_หมายเหตุ: entry นี้เป็นการบันทึก log การแก้ไข backend เท่านั้น ยังไม่ได้ sync `schema.prisma`/`docs/openapi.yaml` ของ repo นี้ให้ตรงกับ backend จริง (ตามที่ user ให้หยุด sync เอกสารไว้ชั่วคราวตั้งแต่ 2026-09-02 - จะ sync เมื่อถูกขอให้ทำ)_

## 2026-09-03 (12) — Implement 3D Warehouse Blueprint feature เข้า backend จริง (ตามที่ DevOps ร่าง spec ไว้)

ตรวจสอบ `schema.prisma`/`docs/openapi.yaml` เทียบ backend จริงหลัง DevOps push ของใหม่ (commit `6d8efd3`/`7ca0b14`) พบว่า DevOps ร่าง schema + API spec ของฟีเจอร์ **"3D Warehouse Blueprint"** ไว้แล้ว พร้อม frontend ที่สร้างไปเยอะมาก (`Warehouse3DCanvas.tsx` 540 บรรทัด, `WarehouseControlsHUD.tsx`, `BinDetailDrawer.tsx`, `warehouse-layout.calculator.ts`) **แต่ backend ยังไม่มี implementation เลย** (ยิงจริง 404 ทั้งคู่บน production ก่อนแก้) - หลังคุยกับ user แล้ว **implement เข้า backend จริงครบ ทดสอบ end-to-end บน local Docker และ production แล้ว**:

1. **`Warehouse.blueprintUrl`/`blueprintCfg`**: URL รูปแปลน CAD/2D + JSON config การ calibrate โมเดล 3D (opacity, dimensions, zonesConfig, walls, doors) - รวมเป็น JSON blob เดียวตามที่ DevOps ออกแบบ `UpdateBlueprintDto` ไว้
2. **`BinLocation.zoneName`/`rack`/`shelf`/`capacityKg`/`status`**: label แบบ free-text ที่ได้จากการสแกน 3D - **ตั้งใจแยกจาก `zoneId`** (ระบบ Zone ที่ implement ไปก่อนหน้านี้สำหรับ suggest-bin) เพราะ batch import จากการสแกนไม่ควรบังคับให้ต้องมี Zone entity จริงรองรับก่อน
3. **`PUT /warehouses/:id/blueprint`**: อัปเดตรูปแปลน + ค่า calibration 3D
4. **`POST /warehouses/:id/bins/batch`**: bulk สร้าง/แทนที่/merge bin จากการสแกน - `mode: overwrite` จะถูกบล็อกด้วย `400 CANNOT_OVERWRITE_ACTIVE_STOCK` ถ้ามี bin ไหนมีสต็อกอยู่จริง (`StockBalance.quantityOnHand > 0`) ใช้หลักการเดียวกับ WH-07 fix (ดู entry ก่อนหน้า) แค่เช็คก่อนแทนที่ layout แทนที่จะเช็คก่อนลบคลัง - `mode: merge` upsert ตาม `binCode` ไม่ลบอะไรเลยจึงไม่ต้องเช็ค stock lock - บล็อก duplicate `binCode` ภายในคำขอเดียวกันไว้ก่อนถึง DB ด้วย
5. **Migration ใหม่** (`20260902120000_warehouse_3d_blueprint`)

**ทดสอบแล้วบน local Docker + production**: อัปเดต blueprint สำเร็จ, batch overwrite สร้าง/แทนที่ bin ถูกต้อง, duplicate binCode ในคำขอเดียวกันโดนบล็อก, **stock lock protection ทำงานถูกต้อง** (มีสต็อกอยู่ → overwrite โดน 400, merge ยังทำงานได้ปกติ), merge mode upsert (สร้างใหม่/อัปเดตของเดิม) ถูกต้อง, RBAC (`owner`/`admin`/`manager` เท่านั้น) บล็อก `operator` ถูกต้องทั้ง 2 endpoint

## 2026-09-02 (11) — แก้ 8 gap ที่เจอจากการทดสอบ `MASTER_DATA_TEST_PLAN.md` จริง

ทดสอบ backend เทียบ `docs/MASTER_DATA_TEST_PLAN.md` ทั้งฉบับด้วยการยิง API จริง (ไม่ใช่แค่อ่านโค้ด) เจอ 8 จุดที่ไม่ตรงตามเงื่อนไข - หลังคุยกับ user แล้วให้แก้ทั้งหมด **implement เข้า backend จริงครบ ทดสอบ end-to-end บน local Docker และ production แล้ว**:

1. **FREE plan quota ไม่เคยถูกบังคับใช้เลยในทางปฏิบัติ** (พบระหว่างทดสอบ PRD-08/WH-06): tenant ที่สมัคร FREE plan (ราคา 0 บาท ไม่มี trial) ผ่าน flow ปกติจะ**ค้างสถานะ `pending_payment` ตลอดไป** เพราะไม่มีอะไรให้ "จ่าย" - `EntitlementsService.getPlanForTenant()` resolve plan เฉพาะ subscription ที่ active/trialing/past_due เท่านั้น ทำให้โควตาทุกอย่างไม่ถูกเช็คเลยจนกว่าจะ active ด้วยมือ - **แก้**: `SubscriptionsService.createPending()` ให้ plan ราคา 0 บาท (ไม่มี trial) **active ทันที** เหมือน trial (พิสูจน์แล้วว่าพอ flip เป็น active โควตาทำงานถูกต้องทันที)
2. **RBAC ไม่มีเลยในโมดูล Master Data เกือบทั้งหมด** (SEC-02): เพิ่ม `@Roles('owner','admin','manager')` ให้ครบทุก endpoint สร้าง/แก้/ลบใน `Products`, `Categories`, `Brands`, `Units`, `Suppliers`, `Manufacturers`, `TaxTypes`, `BarcodeSymbologies`, `Zones`, `Companies` (ก่อนแก้ role `operator` สร้าง/ลบ master data ได้อย่างไม่มีข้อจำกัดเลย ทดสอบจริงพบว่าลบ category ที่สินค้าอื่นผูกอยู่สำเร็จ)
3. **WH-07**: บล็อกลบคลังสินค้าที่มีสต็อกค้างอยู่จริง (`StockBalance.quantityOnHand > 0`) ก่อนหน้านี้ลบสำเร็จไม่มีการป้องกันเลย
4. **UNT-04**: บล็อกลบหน่วยนับ (`Unit`) ที่สินค้าอื่นผูกอยู่จริง (`unitId`/`dimensionUnitId`/`weightUnitId`) - ก่อนหน้านี้ลบสำเร็จไม่มี FK-restrict
5. **COMP-04**: ตั้ง `isHeadquarter: true` ให้บริษัท/สาขาใหม่จะ**สลับ HQ เดิมออกให้อัตโนมัติ**ในทรานแซกชันเดียวกัน (ก่อนหน้านี้มี 2 HQ พร้อมกันได้ ไม่มีการป้องกัน/แจ้งเตือนเลย)
6. **COMP-02**: validate `taxId` ต้องเป็นตัวเลข 13 หลักเป๊ะ (`Matches(/^\d{13}$/)`) - ก่อนหน้านี้รับ string อะไรก็ได้ไม่เกิน 20 ตัวอักษร
7. **SUP-01/03**: เพิ่ม field `email` ให้ `Supplier` จริง (ไม่เคยมีมาก่อนเลยทั้งที่เอกสารอ้างถึง) พร้อม validate รูปแบบอีเมล
8. **TAX-01**: เพิ่ม field `code` (auto-derive จาก name ถ้าไม่ระบุ ตาม convention เดียวกับ Category/Brand/Unit) และ `isInclusive` ให้ `TaxType` จริง (ไม่เคยมีมาก่อนเลยทั้งที่เอกสารอ้างถึง)
9. **Migration ใหม่** (`20260902110000_master_data_test_plan_fixes`): เพิ่ม `suppliers.email`, `tax_types.code`+`is_inclusive` - ของเดิมที่มีอยู่ก่อน migration ได้ `code` แบบ auto-backfill (`tax-<8 หลักแรกของ id>`) อัตโนมัติ ไม่พัง

**ทดสอบแล้วบน local Docker + production**: ครบทุกจุดข้างต้น ยืนยัน regression ผ่าน (owner/admin ยังสร้าง/แก้/ลบได้ปกติ, คลัง/หน่วยนับที่ไม่มีการอ้างอิงยังลบได้ปกติ, tax type/supplier เดิมที่ backfill ไม่พัง)

## 2026-09-02 (10) — แก้ `BillingController` (`/billing/*`) ถูก `@ApiExcludeController()` โดยไม่ตั้งใจ (บั๊กเดียวกับ Menu/Rentals ใน PR #19)

**ปัญหาที่พบ**: user ถามว่าทำไม `docs/openapi.yaml` มี `/billing/plans`, `/billing/current-subscription`, `/billing/subscribe`, `/billing/cancel`, `/billing/invoices` แต่ Swagger จริงไม่โผล่ - endpoint ทำงานได้ปกติทุกตัว แค่ไม่ขึ้น `/api-docs`/`/api-docs-json` เท่านั้น

**สาเหตุ**: `BillingController` ติด `@ApiExcludeController()` อยู่ ตรวจสอบเทียบกับ `PlatformBillingController` (ตัวที่ควรซ่อนจริง - มี comment อธิบายเหตุผลชัดเจนว่า "super_admin/billing only เพราะเห็นข้อมูลข้าม tenant") พบว่า `BillingController` **ไม่มี comment อธิบายเหตุผลการซ่อนเลย** และมีลักษณะเป็น tenant-facing self-service ชัดเจน (`GET /billing/plans` ติด `@Public()` ไว้สำหรับหน้า signup ก่อน login ด้วยซ้ำ) - ตรงกับรูปแบบเดียวกับ `MenuController`/`RentalsController` ที่เจอใน PR #19 (copy-paste มาจาก controller ฝั่ง admin ที่อยู่ในไฟล์เดียวกัน)

**การแก้ไข**: เอา `@ApiExcludeController()` ออกจาก `BillingController` เพิ่ม doc comment อธิบายเหตุผล (เหมือนที่ `RentalsController` มี) - หลัง user ยืนยันเพิ่มเติมให้เปิด `PlatformBillingController` (`/platform/billing/*`, `/platform/subscription-plans*`) ด้วยเช่นกัน แม้จะเป็นข้อมูลข้าม tenant จริง (ยอมรับ trade-off ที่ endpoint ของ platform admin จะโผล่ใน public Swagger)

**ยืนยันแล้ว**: live `/api-docs-json` มี path เพิ่มจาก 98 เป็น 112, `GET /billing/plans` ยัง public เข้าถึงได้แบบไม่ต้อง login เหมือนเดิม, diff property/param ทุกจุดระหว่าง live กับ docs ที่แก้ไปแล้วเหลือ 0 จุดต่างกัน

## 2026-09-01 (9) — Implement putawayStatus filter + Zone system (suggest-bin category matching) เข้า backend จริง

ต่อยอดจากการตรวจสอบ+ทดสอบ `RECEIVING_AND_PUTAWAY_DESIGN.md` ที่พบ 2 gap ระหว่างเอกสารกับ backend จริง - หลังคุยเรื่อง impact กับ user แล้วให้ทำทั้งคู่ **implement เข้า backend จริงครบ ทดสอบ end-to-end บน local Docker และ production แล้ว**:

1. **`putawayStatus` filter บน `GET /goods-receipts`** (§5 เอกสารระบุว่าควร filter ตามสถานะ putaway ได้ แต่ของจริงไม่มีมาก่อน): เพิ่ม query param `putawayStatus: staged|complete` - `staged` = มีอย่างน้อย 1 line ที่ `quantity > putawayQuantity`, `complete` = ทุก line ปิดงานแล้ว (หรือไม่มี line เลย) ใช้ raw SQL `EXISTS`/`NOT EXISTS` resolve id list ก่อน (ข้อจำกัดเดิม: Prisma query builder เทียบ 2 คอลัมน์ในแถวเดียวกันไม่ได้) ไม่ใส่ param นี้ก็ทำงานเหมือนเดิมทุกประการ
2. **Zone system ใหม่** (§3.2 "Suggested Putaway Helper" เดิมเป็น capacity-only ล้วน ไม่มี zone/category ตามที่เอกสารอธิบาย): เพิ่ม `model Zone` (tenant-scoped master data, ไม่ผูก warehouse - ใช้ zone เดียวกันข้ามคลังได้ ตาม convention เดียวกับ Unit/Brand/Category) พร้อม CRUD เต็ม (`GET/POST/PATCH/DELETE /zones`, `/zones/:id/deactivate`) - เพิ่ม `BinLocation.zoneId` (ชั้นวางอยู่โซนไหน) และ `Category.zoneId` (หมวดหมู่นี้ควรเก็บโซนไหน) ทั้งคู่ nullable/optional
3. **`GET /putaway/suggest-bin` ขยาย**: รับ `productId` เพิ่ม (optional) - ถ้าให้มาและ resolve ได้ถึง zone (Product.categoryId -> Category.zoneId) จะลองหา bin ในโซนนั้นก่อน (มี capacity พอ) **ถ้าไม่มี fallback กลับไป capacity-only ข้ามทุกโซนเหมือนเดิมทันที** (ไม่ block, ตรงกับ §4.2 "soft suggestion" - ไม่ส่ง productId มาก็ทำงานเหมือนเดิม 100%)
4. **Migration ใหม่** (`20260901170000_zones`): สร้างตาราง `zones` + คอลัมน์ `zone_id` (nullable FK, `ON DELETE SET NULL`) บน `bin_locations`/`categories`

**ทดสอบแล้วบน local Docker + production**: `putawayStatus=staged`/`complete` กรองถูกต้อง, `putawayStatus=bogus` โดน validation reject (400), Zone CRUD ครบ (create/update/deactivate/soft-delete/getById 404 หลังลบ), สร้าง category+bin ผูก zone เดียวกันแล้ว `suggest-bin?productId=...` คืน bin ในโซนที่ตรงกันจริง, ทดสอบ fallback ครบ 3 เคส (ไม่ส่ง productId, product ไม่มี category/zone, zone มีแต่ bin เต็มความจุ) กลับไป capacity-only ถูกต้องทุกเคส, สร้าง category/bin ด้วย zoneId ปลอมโดนบล็อก 404, soft-delete zone แล้ว category/bin ที่อ้างถึงไม่พังยังอ่านได้ปกติ (`zoneId` ไม่ถูก null เพราะ soft-delete ไม่ trigger `ON DELETE SET NULL`)

**ยังไม่ทำรอบนี้ (นอกขอบเขตที่ user ขอ)**: `POST /warehouses/:id/bins`/`categories` ยังไม่บังคับต้องมี zone (ทั้งคู่ optional ตามที่ตกลง - migration ทีละน้อยไม่ต้อง backfill ของเดิม)

## 2026-09-01 (8) — Sync `StockBalance` กลับ: บั๊ก NULL-uniqueness ที่แก้ใน backend จริงแล้ว แต่ schema.prisma ที่นี่ยังไม่ตกลง

ตรวจสอบ backend เทียบกับ `docs/openapi.yaml` + `schema.prisma` ทั้งคู่แบบเจาะลึกอีกรอบ (diff ทุกบรรทัดจริง ไม่ใช่แค่ high-level) เจอ 2 เรื่อง:

1. **`StockBalance.@@unique(...)` บั๊กที่แก้ใน backend จริงไปแล้ว (migration `20260902100000_stock_balance_null_safe_unique_index`) แต่ไม่เคย sync กลับมาที่ schema.prisma repo นี้เลย** - ที่นี่ยังมี `@@unique([tenantId, warehouseId, binLocationId, productId, lotNumber])` ตัวเดิมที่มีปัญหา (Postgres ไม่ยุบ NULL=NULL ให้ ทำให้ 2-Step Staging รับซ้ำแล้วแตกแถวแทนที่จะรวมยอด) - ลบออกแล้ว อัปเดต comment อธิบายว่า unique constraint จริงอยู่ใน raw SQL expression index แทน (COALESCE bin/lot เป็น sentinel) ตรงกับที่ backend จริงใช้อยู่แล้ว
2. **`/menu`, `/rentals`, `/rentals/{id}`, `/rentals/{id}/deposit-checkout` ยังหายไปจาก `docs/openapi.yaml`** - endpoint จริงมีบน production ครบ (ยืนยันจาก live `/api-docs-json`) แต่ PR #19 ที่แก้เรื่องนี้ไว้ตั้งแต่ 2026-08-31 **ยังไม่ถูก merge** - ไม่ใช่ backend gap แค่รอ merge PR เดิม

**ที่เหลือ (relation choices บน GoodsReceipt/GoodsReceiptLine/GoodsIssue ที่backend จริงไม่มี tenant/warehouse relation บน header ต่างจาก schema นี้)**: เป็น divergence ที่ตั้งใจและบันทึกไว้แล้วใน entry ก่อนหน้า ไม่ใช่เรื่องใหม่ ไม่แก้

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

ตอนตรวจสอบ backend เทียบกับ `schema.prisma` บน develop (ก่อนหน้านี้) พบว่า backend จริง **มากกว่า** docs อยู่ 2 จุด (คนละทิศกับ gap ปกติ - ของจริง implement ไปแล้วแต่ schema.prisma repo นี้ไม่เคย sync ตาม):

1. **`ReaderOpsOperator`**: ขาด `isActive`/`deletedAt`/`deletedByType`/`deletedById`/`updatedAt` (soft-delete + suspend, แพทเทิร์นเดียวกับ `User`/`PlatformAdmin` - login account ที่มี MFA)
2. **`WebhookSubscription`**: ขาด `deletedAt`/`deletedByType`/`deletedById` (soft-delete ผ่าน `withSoftDelete` extension - ของจริงมีมาตั้งแต่รอบ isDeleted rollout ก่อนหน้านี้)

เพิ่มกลับเข้า `schema.prisma` ให้ตรงกับ backend จริงทุกตัวอักษร แล้วรัน `npx prisma format` ทับ - format เก็บงานที่ตกหล่นให้เพิ่มอีกอย่าง: **`Tenant.goodsReceipts` reverse relation หายไป** ตั้งแต่ commit `ce4aa7b` (เพิ่ม `GoodsReceipt.tenant` relation แต่ไม่เพิ่ม back-relation ฝั่ง `Tenant` - ทำให้ schema จุดนี้ invalid มาตั้งแต่ commit นั้น) - `prisma format` เติมให้อัตโนมัติ ยืนยันด้วย `prisma validate` ผ่านแล้ว

**ยืนยันแล้ว**: diff `schema.prisma` กับ backend จริงเหลือแค่ 2 จุดที่ต่างกันโดยตั้งใจ (บันทึกไว้ใน CHANGELOG entry ก่อนหน้า - `GoodsReceiptLine` ไม่มี `@relation`/FK ตาม convention ตระกูล stock-transactions, และ `Product` ใช้ partial-unique-index แทน plain `@@unique` สำหรับ soft-delete) นอกนั้นตรงกันทุกตัวอักษร ไม่มีการเปลี่ยนแปลงฝั่ง backend จริงเลยรอบนี้ (docs-only sync)

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

## 2026-09-01 (2) — แก้ `MenuController`/`RentalsController` ถูก `@ApiExcludeController()` โดยไม่ตั้งใจ

**ปัญหาที่พบ**: หลังแก้ cache header รอบก่อนแล้ว ผู้ใช้ยังรายงานว่า Swagger endpoint ไม่ครบ — ตรวจ `@Controller()` ทุกตัวใน backend เทียบกับ live spec เจอว่า `GET /menu` (nav tree ที่กรองตาม `MenuItem.requiredFeature`/`SubscriptionPlan.features` — งาน Dynamic Menu จาก PR #17 เมื่อวาน) และทั้ง controller `/rentals` (list/get/deposit-checkout) **หายไปจาก live spec ทั้งคู่**

**สาเหตุ**: ทั้งสองไฟล์เป็น controller ฝั่ง tenant (ไม่ใช่ platform-admin) แต่ติด `@ApiExcludeController()` อยู่ - ตรวจสอบทุก controller ที่มี decorator นี้แล้วพบว่าเป็นกลุ่ม `platform/*` (admin realm, ถูกต้อง), webhook/mqtt callback (ถูกต้อง), reader-ops/monitoring/reader-config (internal ops tool, ถูกต้อง) แต่ `MenuController` (`menu`) กับ `RentalsController` (`rentals`) ไม่มีเหตุผลทางสถาปัตยกรรมรองรับเลย - สันนิษฐานว่า copy-paste มาจาก controller ฝั่ง admin (`MenuItemsAdminController`/`RentalAssignmentsAdminController`) แล้วลืมเอาออก

**การแก้ไข**: เอา `@ApiExcludeController()` ออกจากทั้งสองไฟล์ (`src/modules/menu/menu.controller.ts`, `src/modules/rentals/rentals.controller.ts`) - build/test บน local Docker แล้ว deploy ขึ้น production แล้ว sync `docs/openapi.yaml` เพิ่ม 4 path ใหม่ (`GET /menu`, `GET /rentals`, `GET /rentals/{id}`, `POST /rentals/{id}/deposit-checkout`) + schema `CollectDepositDto`

**ยืนยันแล้ว**: live `/api-docs-json` มี path เพิ่มจาก 86 เป็น 90 จริง เช็คแล้วมี `GET /menu`, `/rentals` ครบทั้ง 3 endpoint

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
