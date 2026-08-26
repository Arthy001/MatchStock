# แผนพัฒนา MatchStock — Gap Analysis + Design (10 หัวข้อ)

> **สถานะเอกสาร**: ร่าง — ยังไม่ implement อะไรทั้งสิ้น รอ feedback ก่อนนำไปเก็บที่ `backend/prisma/PLAN.md` บน GitHub (`Arthy001/MatchStock`, branch `develop`)
> **บริบท**: เทียบ requirement ของระบบ (real-time stock / FEFO / Cycle Count RFID+บาร์โค้ด / Subscription feature gating / RBAC หลายระดับ / บริษัทย่อย / Platform Admin)
> **Legend สถานะ**: 🔴 ยังไม่มีเลย · 🟡 มีบางส่วน/มีโครงสร้างรอต่อยอด · 🟢 มีแล้ว แค่ต้องต่อยอด/แก้จุดเล็ก

## สารบัญ
1. [FEFO (First-Expired-First-Out)](#1-fefo-first-expired-first-out)
2. [Cycle Count (RFID + บาร์โค้ดผสมกัน)](#2-cycle-count-rfid--บาร์โค้ดผสมกัน)
3. [Subscription Feature Gating](#3-subscription-feature-gating)
   - 3.1 [เมนู (Navigation) ผูกกับ Subscription](#31-เมนู-navigation-ผูกกับ-subscription)
4. [งานเล็กที่พ่วงมาระหว่างรีวิว](#4-งานเล็กที่พ่วงมาระหว่างรีวิว)
5. [Roles / Company / Warehouse Quota / RBAC](#5-roles--company--warehouse-quota--rbac)
6. [Master Data — ขอบเขต Tenant vs Company](#6-master-data--ขอบเขต-tenant-vs-company)
7. [Warehouse/Stock Ops + ค้นหาตำแหน่งจัดเก็บ](#7-warehousestock-ops--ค้นหาตำแหน่งจัดเก็บ)
8. [Sales Order (SO)](#8-sales-order-so)
9. [Reports & Analytics](#9-reports--analytics)
10. [Platform Admin — ควบคุมระบบระดับ Provider](#10-platform-admin--ควบคุมระบบระดับ-provider)
- [ภาคผนวก: ลำดับที่แนะนำ](#ภาคผนวก-ลำดับที่แนะนำ)

---

## 1. FEFO (First-Expired-First-Out)

**สถานะ:** 🟢 มีแล้ว แค่ต้องต่อยอด — `Tag.expiryDate`/`productionDate`/`lotNumber` มีในสคีมาแล้ว แต่ `TagsService.findFifoCandidates()` (`src/modules/tags/tags.service.ts:315`) เรียงด้วย `receivedAt` เท่านั้น ไม่เคยดู `expiryDate`

**สิ่งที่จะเพิ่ม/แก้:**
- แก้ sort logic ใน `findFifoCandidates()` ให้เรียงตาม `expiryDate` ก่อน (fallback `receivedAt` ถ้าไม่มี expiry)

### Schema การเปลี่ยนแปลง
ไม่มี — ใช้ `Tag.expiryDate` ที่มีอยู่แล้ว

### API / Service ที่เพิ่ม-แก้
| Method | Path | คำอธิบาย |
|---|---|---|
| — | — | ไม่มี endpoint ใหม่ แก้ internal logic ของ `TagsService.findFifoCandidates()` เท่านั้น signature เดิมไม่เปลี่ยน |

```ts
// tags.service.ts - findFifoCandidates()
const sorted = [...tagIds].sort((a, b) => {
  const tagA = tagsById.get(a);
  const tagB = tagsById.get(b);
  const aKey = tagA?.expiryDate?.getTime() ?? tagA?.receivedAt?.getTime() ?? Infinity;
  const bKey = tagB?.expiryDate?.getTime() ?? tagB?.receivedAt?.getTime() ?? Infinity;
  return aKey - bKey;
});
```
ต้อง include `expiryDate` เข้า query ที่ดึง tag มาด้วย — ชื่อฟังก์ชัน `findFifoCandidates` ไม่เปลี่ยน (5 stock-transaction services เรียกใช้อยู่ เปลี่ยนชื่อ blast radius กว้าง) แค่เพิ่ม doc comment ว่าเป็น FEFO-when-possible

### การตัดสินใจที่ยืนยันแล้ว ✅
1. ไม่มี `expiryDate` → fallback ไป `receivedAt` (พฤติกรรมเดิมสำหรับสินค้าที่ไม่ track expiry)
2. เรียง `expiryDate ASC NULLS LAST` ก่อน แล้วค่อย `receivedAt ASC`

### คำถามเปิด ⚠️
ไม่มี — พร้อมทำได้ทันที

### Dependency
ไม่ผูกกับข้อไหน ทำก่อนได้เลย — ข้อ 8 (Sales Order) ต้องพึ่งพาอันนี้ทำงานถูกต้องก่อน

---

## 2. Cycle Count (RFID + บาร์โค้ดผสมกัน)

**สถานะ:** 🔴 ยังไม่มี — `CycleCount` ผูกกับ RFID tag แบบ serialized 100% ผ่าน `CycleCountExpectedTag`/`CycleCountCountedTag` ไม่มีที่เก็บ "นับได้ N ชิ้น" แบบไม่ผูก tag เฉพาะตัว ไม่บันทึกว่าใช้เครื่องไหนนับ ไม่มี workflow กระทบยอด (reconciliation) เมื่อของหาย/tag เสีย

**สิ่งที่จะเพิ่ม/แก้:**
- รองรับ RFID (fixed + handheld) และบาร์โค้ดในรอบนับเดียวกัน — ไม่มี field เลือกโหมดระดับ `CycleCount` เลย ให้ 2 ชุดข้อมูล (tag-based / quantity-based) อยู่ร่วมกันได้เสมอ
- Reconciliation workflow: บังคับ resolve ทีละตัวก่อน approve (ไม่มี auto-guess)
- Middleware เชื่อมเครื่องอ่านหลายยี่ห้อผ่าน MQTT (ต่อยอด infrastructure เดิม ไม่ต้องสร้างใหม่)
- Policy ใหม่: 1 สินค้า = 1 วิธี track (`Product.trackingMethod`) ไม่ผสมระดับ unit

### Schema การเปลี่ยนแปลง
```prisma
model CycleCount {
  // ...fields เดิมทั้งหมดไม่เปลี่ยน ไม่มี countMethod...
  expectedTags       CycleCountExpectedTag[]
  countedTags        CycleCountCountedTag[]
  expectedQuantities CycleCountExpectedQuantity[]
  countedQuantities  CycleCountCountedQuantity[]
}

enum CycleCountTagResolution {
  confirmed_missing // ยืนยันว่าหายจริง - ตัดสต็อกออก
  found_tag_failed  // ของอยู่จริง แต่ tag เสีย/หลุด - ออก tag ใหม่แทน ไม่ตัดสต็อก
  found_elsewhere   // นับเจอแล้วคนละจุด/คนละรอบ - ไม่ตัดสต็อก
}

model CycleCountExpectedTag {
  id           String @id @default(uuid()) @db.Uuid
  cycleCountId String @map("cycle_count_id") @db.Uuid
  tagId        String @map("tag_id") @db.VarChar(64)

  // ใหม่ - ใช้เฉพาะแถวที่ "คาดว่ามี" แต่นับไม่เจอเท่านั้น นับเจอปกติ = null เสมอ
  resolution       CycleCountTagResolution? @map("resolution")
  replacementTagId String?                  @map("replacement_tag_id") @db.VarChar(64)
  resolutionNote   String?                  @map("resolution_note") @db.VarChar(500)
  resolvedByType   String?                  @map("resolved_by_type") @db.VarChar(20)
  resolvedById     String?                  @map("resolved_by_id") @db.Uuid
  resolvedAt       DateTime?                @map("resolved_at")

  cycleCount CycleCount @relation(fields: [cycleCountId], references: [id], onDelete: Cascade)

  @@unique([cycleCountId, tagId])
  @@map("cycle_count_expected_tags")
}

// เพิ่ม deviceId + countedAt ให้รู้ว่า tag นี้อ่านด้วยเครื่องไหน/เมื่อไหร่
model CycleCountCountedTag {
  id           String    @id @default(uuid()) @db.Uuid
  cycleCountId String    @map("cycle_count_id") @db.Uuid
  tagId        String    @map("tag_id") @db.VarChar(64)
  deviceId     String?   @map("device_id") @db.Uuid
  countedAt    DateTime  @default(now()) @map("counted_at")

  cycleCount CycleCount @relation(fields: [cycleCountId], references: [id], onDelete: Cascade)
  device     Device?    @relation(fields: [deviceId], references: [id], onDelete: SetNull)

  @@unique([cycleCountId, tagId])
  @@map("cycle_count_counted_tags")
}

// Snapshot ตอนเปิดรอบนับ สำหรับสินค้าที่ไม่มี RFID tag (track ด้วยบาร์โค้ด)
model CycleCountExpectedQuantity {
  id               String  @id @default(uuid()) @db.Uuid
  cycleCountId     String  @map("cycle_count_id") @db.Uuid
  tenantId         String  @map("tenant_id") @db.Uuid
  productId        String  @map("product_id") @db.Uuid
  binLocationId    String? @map("bin_location_id") @db.Uuid
  expectedQuantity Int     @map("expected_quantity")

  cycleCount CycleCount @relation(fields: [cycleCountId], references: [id], onDelete: Cascade)

  @@unique([cycleCountId, productId, binLocationId])
  @@index([tenantId])
  @@map("cycle_count_expected_quantities")
}

// แต่ละครั้งที่สแกนบาร์โค้ด+กรอกจำนวน - append-only log (ไม่ replace)
model CycleCountCountedQuantity {
  id              String   @id @default(uuid()) @db.Uuid
  cycleCountId    String   @map("cycle_count_id") @db.Uuid
  tenantId        String   @map("tenant_id") @db.Uuid
  productId       String   @map("product_id") @db.Uuid
  binLocationId   String?  @map("bin_location_id") @db.Uuid
  countedQuantity Int      @map("counted_quantity")
  scannedCode     String?  @map("scanned_code") @db.VarChar(64)
  deviceId        String?  @map("device_id") @db.Uuid
  countedByType   String?  @map("counted_by_type") @db.VarChar(20)
  countedById     String?  @map("counted_by_id") @db.Uuid
  countedAt       DateTime @default(now()) @map("counted_at")

  cycleCount CycleCount @relation(fields: [cycleCountId], references: [id], onDelete: Cascade)
  device     Device?    @relation(fields: [deviceId], references: [id], onDelete: SetNull)

  @@index([cycleCountId, productId])
  @@index([tenantId])
  @@map("cycle_count_counted_quantities")
}

enum ProductTrackingMethod {
  rfid
  barcode
}

model Product {
  // ...fields เดิมทั้งหมด...
  trackingMethod ProductTrackingMethod @default(barcode) @map("tracking_method")
}
```
`Device` ต้องเพิ่ม reverse relation: `countedCycleCountTags CycleCountCountedTag[]`, `countedCycleCountQuantities CycleCountCountedQuantity[]`

### API / Service ที่เพิ่ม-แก้
| Method | Path | คำอธิบาย |
|---|---|---|
| POST | `/cycle-counts/{id}/scan-barcode` | ใหม่ — `{ scannedCode, quantity, deviceId? }` resolve เป็น Product ผ่าน `barcodeValue`/`code` → insert `CycleCountCountedQuantity` |
| POST | `/cycle-counts/{id}/expected-tags/{tagId}/resolve` | ใหม่ — `{ resolution, note?, replacementTagId? }` reconcile ของหาย/tag เสีย |
| GET | `/cycle-counts/{id}/expected-tags?resolution=null` | ใหม่ — list รายการที่ยัง resolve ไม่เสร็จ (checklist ก่อน approve) |
| POST | `/tags/replace` | ใหม่ — `TagsService.replaceTag(oldTagId, newTagId)` retire tag เดิม + ออก tag ใหม่สืบทอด product/lot/expiry/cost |
| (MQTT) | `devices/<t>/<d>/cycle-count/tags` | ใหม่ — publish: RFID อ่านเจอ tag ระหว่างรอบนับ |
| (MQTT) | `devices/<t>/<d>/cycle-count/scan` | ใหม่ — publish: สแกนบาร์โค้ด+จำนวนระหว่างรอบนับ |
| (แก้) | `CycleCountsService.open()` | snapshot ทั้ง `expectedTags` (สินค้า `trackingMethod=rfid`) และ `expectedQuantities` (สินค้า `trackingMethod=barcode`) พร้อมกันเสมอ |
| (แก้) | `CycleCountsService.close()` | คำนวณ variance รวมทั้ง 2 แหล่ง |
| (แก้) | `CycleCountsService.approve()` | บังคับทุกแถวใน `expectedTags` ที่ไม่มีคู่ใน `countedTags` ต้องมี `resolution` ไม่ null ก่อนเสมอ ไม่งั้น reject `BadRequestException` |

```ts
// tags.service.ts - เมธอดใหม่
async replaceTag(oldTagId: string, newTagId: string): Promise<Tag> {
  const old = await this.getByTagIdInCompany(oldTagId);
  return this.prisma.$transaction(async (tx) => {
    const created = await tx.tag.create({
      data: {
        tagId: newTagId, tenantId: old.tenantId, productId: old.productId,
        lotNumber: old.lotNumber, productionDate: old.productionDate,
        expiryDate: old.expiryDate, unitCostMinor: old.unitCostMinor,
        status: 'bound', boundAt: new Date(), receivedAt: old.receivedAt,
      },
    });
    await tx.tag.update({ where: { tagId: oldTagId }, data: { status: 'retired' } });
    // ย้าย TagCurrentState จาก tag เดิมไปตัวใหม่
    return created;
  });
}
```

**Middleware/MQTT** — ไม่ต้องสร้าง auth ใหม่: ทุก `Device` มี `DeviceMqttCredential` อยู่แล้ว, ACL (`mqtt-plugin-auth.controller.ts:219-222`) เป็น prefix check `devices/<tenantId>/<deviceId>/` เท่านั้น — topic ใหม่ใต้ namespace เดิมผ่านอัตโนมัติ ไม่ต้องแก้ ACL เลย จุดที่ต้องแก้จริงมีแค่ 2 จุด: (1) `MqttDeviceTelemetrySubscriberService` (`mqtt-device-telemetry-subscriber.service.ts:172-173`) เพิ่ม 2 topic เข้า subscribe list เดิม แล้วเรียก `CycleCountsService.submitCount()`/`scanBarcode()` ตรงๆ (2) `BACKEND_SERVICE_WILDCARD_TOPIC_PATTERN` (`mqtt-plugin-auth.controller.ts:26`) เพิ่ม topic 2 ตัวใหม่ให้ backend subscribe ได้ — REST endpoint เดิม (`scan-barcode`) ยังเก็บไว้สำหรับกรณีคนกดเองผ่านแอป (กล้องมือถือ), auth เป็น user JWT ตามเดิม

### การตัดสินใจที่ยืนยันแล้ว ✅
1. RFID+บาร์โค้ดอยู่ร่วมกันได้ในรอบนับเดียวกัน ไม่มี `CycleCountMethod` เลือกโหมด
2. **Reconciliation**: บังคับ resolve ทีละตัวก่อน approve เสมอ ไม่มี auto-guess (ทางเลือกเดิมคือเดาตาม FEFO order ถูกตัดออกเพราะเสี่ยงตัดสต็อกผิด)
3. **1 สินค้า = 1 วิธี track** (`Product.trackingMethod`) ไม่ผสมระดับ unit — เหตุผล: หักลบแบบผสมมีปัญหาซ้อน 2 ชั้น (พนักงานแยกด้วยตายาก + RF อ่านไม่ครบทำให้เข้าใจผิดว่าหน่วยที่หายเป็นบาร์โค้ด) ส่วนช่วงเปลี่ยนผ่านใช้ **cutover ครั้งเดียว** (retag สินค้าทั้งหมดในสต็อกก่อนเปลี่ยน flag ไม่ใช่ค่อยๆ ไล่ติด)
4. **Self-healing ระหว่างใช้งานปกติ (ไม่ใช่ cycle count) มีอยู่แล้ว ไม่ต้องแก้**: `MissingDetectorScheduler` เช็คทุก 30s ถ้า tag ไม่มีใครอ่านเจอเกิน 2 นาที → flag `missing` + ยิง webhook `tag.missing`; ถ้าอ่านเจออีกครั้ง `flush.scheduler.ts:86` เขียน `status='in_stock'` ทับอัตโนมัติทุกครั้งที่มี read ใหม่ ไม่ต้องมีคนกด
5. Transport ของ middleware ใช้ **MQTT** (ไม่ใช่ REST+Device API-key ที่เคยเสนอไว้) — สอดคล้องกับสถาปัตยกรรมเดิมมากกว่า และ auth พร้อมอยู่แล้ว 100%
6. Payload MQTT รู้ `cycleCountId` ผ่าน topic `devices/<t>/<d>/commands` เดิม (สั่ง "เริ่มนับรอบนี้" ก่อนเริ่มอ่าน) — กันพนักงานพิมพ์/เลือกรอบผิด

### คำถามเปิด ⚠️
ไม่มีคำถามใหญ่ค้าง — รายละเอียดย่อยทั้งหมดตัดสินใจแล้วตามข้างบน

### Dependency
งานใหญ่สุดในแผนทั้งหมด ควรทำหลังสุด — ต้องมี **ข้อ 4.1 (`receiveByQuantity`)** เสร็จก่อน (ไม่มีอะไรให้นับถ้ายังรับเข้าไม่ได้) ลำดับย่อยที่แนะนำ: (1) 4.1 ByQuantity ops → (2) schema Cycle Count ข้างบน → (3) reconciliation workflow → (4) MQTT middleware

---

## 3. Subscription Feature Gating

**สถานะ:** 🟡 มีบางส่วน — `EntitlementGuard` (`src/common/entitlements/entitlement.guard.ts`) เช็คแค่ "มี subscription active ไหม" (binary) `SubscriptionPlan.features` (Json) resolve ส่งกลับตอน login แล้ว แต่**ไม่เคยถูกใช้ตรวจสอบใน backend เลย** (grep ทั้งโปรเจกต์ไม่เจอ `features.includes(...)` ที่ไหน) เป็นข้อมูลให้ frontend ซ่อน/โชว์เมนูเท่านั้น

**สิ่งที่จะเพิ่ม/แก้:**
- เพิ่มชั้นตรวจสอบ feature ใน `EntitlementGuard` ที่ระดับ endpoint จริง ไม่ใช่แค่ UI

### Schema การเปลี่ยนแปลง
ไม่มี — `SubscriptionPlan.features Json` มีอยู่แล้ว

### API / Service ที่เพิ่ม-แก้
| Method | Path | คำอธิบาย |
|---|---|---|
| — | — | ไม่มี endpoint ใหม่ เพิ่ม decorator + แก้ guard เดิม |

```ts
// decorators/require-feature.decorator.ts (ใหม่)
export const REQUIRE_FEATURE_KEY = 'require_feature';
export const RequireFeature = (feature: string) => SetMetadata(REQUIRE_FEATURE_KEY, feature);
```
```ts
// EntitlementGuard - เพิ่มหลังเช็ค status.active แล้ว
const requiredFeature = this.reflector.getAllAndOverride<string>(REQUIRE_FEATURE_KEY, [context.getHandler(), context.getClass()]);
if (requiredFeature) {
  const features = (status.features as string[]) ?? [];
  if (!features.includes(requiredFeature)) {
    throw new HttpException({ error: 'FEATURE_NOT_INCLUDED', feature: requiredFeature }, HttpStatus.FORBIDDEN);
  }
}
```
`EntitlementsService.getStatus()` ต้อง return `features` ด้วย (ดึงจาก `SubscriptionPlan.features` ที่ resolve ไว้แล้วตอน login) — ติด `@RequireFeature('reports.view')` ที่ controller ตามต้องการ

### การตัดสินใจที่ยืนยันแล้ว ✅
- โครงสร้างเทคนิค (decorator+guard) ไม่ต้องออกแบบใหม่ — พร้อมใช้ทันทีที่มี business list

### คำถามเปิด ⚠️ (ต้องตอบก่อนเริ่มเขียนโค้ด — เป็น business decision ไม่ใช่ technical)
1. feature code ทั้งหมดที่มีในระบบคืออะไรบ้าง (เห็นแค่ตัวอย่าง: `products.manage`, `warehouses.manage`, `reports.view`, `stock.manage` — น่าจะไม่ครบ)
2. แต่ละ controller/endpoint ควรผูกกับ feature code ไหน (Import/Export, Webhooks ควรอยู่ feature ไหน)
3. แต่ละ `SubscriptionPlan` ควรมี feature อะไรบ้างจริงใน `features` array — ยังไม่เช็คว่าข้อมูลใน DB ปัจจุบันถูก/ครบตามที่ตั้งใจขายจริงหรือเปล่า

แนะนำทำ list นี้เป็นเอกสารแยกก่อน แล้วค่อยติด decorator ตาม list

### Dependency
ไม่ผูกกับข้อไหน ทำได้ทันทีที่มี business list — ข้อ 3.1 (เมนู) และข้อ 9 (Reports RBAC) ใช้ feature code ชุดเดียวกัน ควรทำ list ให้เสร็จรอบเดียวแล้วใช้พร้อมกัน

---

### 3.1 เมนู (Navigation) ผูกกับ Subscription

**สถานะ:** 🟡 มีบางส่วน — สร้าง/grant เมนูผ่าน API ได้แล้วจริง แต่การเห็นเมนูไม่ผูกกับ subscription เลย

**สิ่งที่จะเพิ่ม/แก้:**
- ผูก `MenuItem` เข้ากับ feature code ชุดเดียวกับข้อ 3 ให้เมนูตามแผนของ tenant อัตโนมัติ

### Schema การเปลี่ยนแปลง
```prisma
model MenuItem {
  // ...fields เดิมทั้งหมด...
  requiredFeature String? @map("required_feature") // null = ทุก tenant เห็นเสมอ, มีค่า = ต้องมี feature code นี้ใน SubscriptionPlan.features ของ tenant ปัจจุบัน
}
```

### API / Service ที่เพิ่ม-แก้
| Method | Path | คำอธิบาย |
|---|---|---|
| POST | `/platform/menu-items` | มีอยู่แล้ว — เพิ่มรายการเมนูเข้าแคตตาล็อกกลาง (platform admin) |
| POST | `/platform/companies/:tenantId/menu-items` | มีอยู่แล้ว — grant/revoke เมนูต่อ tenant (manual override) |
| GET | `/menu` | มีอยู่แล้ว — แก้ `getMenuForUser()` เพิ่มเงื่อนไข |

```ts
// menu-items.service.ts - getMenuForUser() เพิ่มเงื่อนไขที่ 4
// visible ถ้า (requiredFeature เป็น null หรืออยู่ใน plan.features ปัจจุบัน) OR (มี TenantMenuItem grant ตรงๆ)
```

### การตัดสินใจที่ยืนยันแล้ว ✅
1. ใช้ **OR ไม่ใช่แทนที่** — `TenantMenuItem` grant เดิมยังทำงานต่อได้เป็น manual override (เช่นให้สิทธิ์ทดลองฟีเจอร์นอกแผนเป็นราย tenant) ไม่ต้อง migrate ข้อมูลเดิม
2. ผลคือ platform admin ตั้ง `requiredFeature` ครั้งเดียวตอนสร้างเมนู จากนั้นเมนูตามแผนของ tenant อัตโนมัติทันทีที่ subscription เปลี่ยน ไม่ต้อง grant/revoke มือทุกครั้ง

### คำถามเปิด ⚠️
ขึ้นกับข้อ 3 (business feature-code list) ต้องเสร็จก่อน — `MenuItem.requiredFeature` ต้องใช้ code ชุดเดียวกับที่ผูก endpoint ไว้ ไม่งั้นเมนูโชว์แต่กดแล้ว 403 (หรือกลับกัน)

### Dependency
ขึ้นกับข้อ 3 โดยตรง แนะนำทำพร้อมกัน

---

## 4. งานเล็กที่พ่วงมาระหว่างรีวิว

**สถานะ:** 🟡 พบระหว่างตรวจข้อ 2/7 — เป็นงานเสริมเล็กๆ ที่ไม่ใช่ฟีเจอร์ใหญ่แยกต่างหาก

### 4.1 ทุกหน่วยมี virtual Tag เสมอ — เติม "ByQuantity" ให้ครบ

**สถานะ:** 🟢 — `GoodsIssue` มีทั้ง 2 โหมดอยู่แล้วเป็นต้นแบบ (`goods-issues.service.ts:68-79`) ที่เหลือแค่ทำตาม pattern เดียวกันให้ครบ 3 service

| Service | มีอยู่แล้ว (RFID) | ต้องเพิ่ม (บาร์โค้ด) |
|---|---|---|
| `GoodsReceiptsService` | `receive(tagIds[])` | **`receiveByQuantity(productId, quantity, ...)`** — generate virtual tagId ให้ครบ quantity ตัว วิ่ง pipeline เดิม (`preRegister`→`bind`→`in_stock`→`setTagLocation`) |
| `GoodsIssuesService` | `dispatch`/`dispatchByQuantity` | ✅ มีครบแล้ว |
| `StockTransfersService` | `create(tagIds[])` | **`transferByQuantity(productId, quantity, fromWarehouseId, toWarehouseId, ...)`** — เรียก `findFifoCandidates()` เลือก tag เอง |
| `StockAdjustmentsService` | `createAdjustment(lines[])` | **`createAdjustmentByQuantity(productId, quantity, newStatus, ...)`** — `exited` ใช้ `findFifoCandidates()`, `in_stock` generate virtual tagId ใหม่ |

**การตัดสินใจที่ยืนยันแล้ว ✅**: virtual tagId format `VTAG-<uuid>` (prefix ต่างจาก EPC จริงที่เป็น hex ล้วนเสมอ) ไม่ต้องเพิ่ม field ใหม่ในสคีมา

**Dependency**: ทำก่อนข้อ 2 (Cycle Count) เสมอ — ไม่มีอะไรให้นับถ้ายังรับเข้าไม่ได้

### 4.2 ขาด endpoint ดูรายการที่ยัง reconcile ไม่เสร็จ
รวมอยู่ในตาราง endpoint ของข้อ 2 แล้ว (`GET /cycle-counts/{id}/expected-tags?resolution=null`)

### 4.3 middleware รู้ cycleCountId ที่ active ได้ยังไง
ตัดสินใจแล้วในข้อ 2 — ใช้ topic `commands` เดิมสั่ง "เริ่มนับรอบนี้" ก่อน

### 4.4 (เสริม ไม่จำเป็น) Feature catalog endpoint
**สถานะ:** 🔴 (เสนอใหม่ ไม่บังคับ) — `GET /platform/features` (catalog แบบเดียวกับ `ReaderModel`) ให้ platform-admin จัดการ list feature code ในที่เดียว ไม่ต้องพิมพ์ string เองตอนตั้งค่า `SubscriptionPlan.features` — ลดความผิดพลาดตอนตั้งค่าจริง ไม่ใช่ของที่ต้องมีก่อนเริ่มข้อ 3

---

## 5. Roles / Company / Warehouse Quota / RBAC

> เพิ่มจาก requirement ใหม่: role 4 ระดับ, 1 account อาจมีบริษัทย่อย, 1 account มีได้หลายคลังตามโควตา subscription

### 5.1 Role tenant-side — เพิ่ม `superadmin`

**สถานะ:** 🟡 — role ปัจจุบัน (`owner, admin, manager, warehouse_staff, purchasing_staff, operator, viewer`) ตรงกับ requirement เกือบหมด (`Operational` ≈ `operator`) ขาดแค่ `superadmin` — `Role` เป็น catalog ที่ platform-admin แก้ได้จริงผ่าน `POST /platform/roles` (ไม่ใช่ enum ตายตัว) เพิ่ม role ใหม่ไม่ต้องแก้โค้ดฝั่งข้อมูล แต่การ**ผูกสิทธิ์**ต้องแก้โค้ด (62 จุดใช้ `@Roles('owner', ...)`)

### Schema การเปลี่ยนแปลง
ไม่มี — insert row ใหม่ใน `Role` table ผ่าน `POST /platform/roles` ที่มีอยู่แล้ว

### API / Service ที่เพิ่ม-แก้
| Method | Path | คำอธิบาย |
|---|---|---|
| (แก้ 62 จุด) | ทุก `@Roles('owner', ...)` ที่เป็นงาน operational | เพิ่ม `'superadmin'` เข้าไปด้วย (reader-config, stock-transfers/adjustments, goods-receipts/issues, devices, cycle-counts, import-export, companies, users, webhooks, warehouses, monitoring) |
| (แก้ใหม่) | `billing.controller.ts` — `POST /billing/subscriptions`, `.../cancel`, `POST /billing/checkout` | เพิ่ม `@Roles('owner')` **เท่านั้น ไม่ใส่ `superadmin`** — พบว่าตอนนี้ไม่มี `@Roles()` เลยทั้งไฟล์ (ช่องโหว่จริงที่เจอระหว่างวิเคราะห์ role ไหนก็แตะเงินได้) |
| (แก้) | `PATCH /companies/me` | เพิ่ม `superadmin` เข้าไปด้วย (operational ไม่ใช่ billing) |

### การตัดสินใจที่ยืนยันแล้ว ✅
1. **`superadmin` = เพิ่มใหม่คู่กับ `owner` เดิม** (ไม่ใช่ rename) — `owner` = เจ้าของบัญชี/billing, `superadmin` = พนักงานสิทธิ์สูงสุดแต่ไม่ใช่เจ้าของบัญชี
2. เส้นแบ่งชัดเจน: operational (62 จุด) → `superadmin` ได้ด้วย, billing (3 จุดใหม่ที่เจอ) → `owner` เท่านั้น

### คำถามเปิด ⚠️
ไม่มี

### Dependency
ทำแยกจากข้อ 5.5 ได้ (เป็น role แบบ hardcoded เดิม ยังไม่ใช่ dynamic RBAC) แนะนำทำเป็นชุดเดียวกับ 5.2-5.4

---

### 5.1b Platform-side role — ยังไม่ enforce (รายละเอียดเต็มอยู่ในข้อ 10.1)
`PlatformAdminRole { super_admin, billing, support }` ออกแบบไว้ดีแล้วในสคีมา guard/decorator พร้อม (`PlatformRolesGuard`, `@PlatformRoles(...)`) แต่ไม่เคยถูกติดที่ controller ไหนเลย — แผนแก้เต็มอยู่ในหัวข้อ 10

---

### 5.2 `Company` ↔ `Warehouse`/`Supplier` — ยังไม่เชื่อมกันเลย

**สถานะ:** 🔴 — `Warehouse` มีแค่ `tenantId`, `Company` ไม่มี relation ไปหา `Warehouse`/`Supplier` เลย (grep `companyId` ทั้งสคีมา = 0 จุด)

### Schema การเปลี่ยนแปลง
```prisma
model Warehouse {
  // ...fields เดิมทั้งหมด...
  companyId String? @map("company_id") @db.Uuid // null = คลังกลางระดับ tenant ใช้ร่วมกันได้ทุกบริษัทย่อย, มีค่า = คลังเฉพาะบริษัทย่อยนั้น

  company Company? @relation(fields: [companyId], references: [id], onDelete: SetNull)
}

model Company {
  // ...fields เดิมทั้งหมด...
  warehouses Warehouse[]
}

model Supplier {
  // ...fields เดิมทั้งหมด...
  companyId String? @map("company_id") @db.Uuid // มีค่า = supplier รายนี้คือบริษัทย่อยของตัวเอง (inter-company trading), null = ซัพพลายเออร์ภายนอกจริง

  company Company? @relation(fields: [companyId], references: [id], onDelete: SetNull)
}
```

### API / Service ที่เพิ่ม-แก้
| Method | Path | คำอธิบาย |
|---|---|---|
| — | — | ไม่มี endpoint ใหม่ — เพิ่ม field `companyId` เข้า DTO ของ `WarehousesService`/`SuppliersService` เดิม |

### การตัดสินใจที่ยืนยันแล้ว ✅
1. `Warehouse.companyId` nullable — null = คลังกลางที่ทุกบริษัทย่อยมองเห็น/ใช้ร่วมกันได้
2. `Supplier.companyId` = inter-company trading (บริษัทย่อยในเครือขายของให้กันเอง) — `GoodsReceipt` ที่อ้างอิง supplier แบบนี้ถือเป็นการโอนภายในเครือ ไม่ใช่ซื้อจากภายนอกจริง (รายงาน/ต้นทุนแยกภายหลัง ไม่รวมในแผนนี้)

### คำถามเปิด ⚠️
ไม่มี

### Dependency
เป็นฐานให้ข้อ 6 (company-scoped data access) ทำงานได้

---

### 5.3 Quota enforcement (`maxUsers`/`maxDevices`/`maxTags`/`maxWarehouses`)

**สถานะ:** 🔴 — `SubscriptionPlan` มี `maxUsers`/`maxDevices`/`maxTags` อยู่แล้วแต่ **ไม่เคยถูกใช้เช็คที่ไหนเลย** (grep ทั้งโปรเจกต์ = 0 จุด) เหมือนปัญหา `features` ในข้อ 3 — ขาด `maxWarehouses` ด้วย

### Schema การเปลี่ยนแปลง
```prisma
model SubscriptionPlan {
  // ...fields เดิมทั้งหมด...
  maxWarehouses Int? @map("max_warehouses")
}
```

### API / Service ที่เพิ่ม-แก้
| Method | Path | คำอธิบาย |
|---|---|---|
| — | — | ขยาย `EntitlementGuard`/`EntitlementsService` (ข้อ 3) ให้เช็คโควตาตัวเลขด้วย ก่อนอนุญาต create ใหม่ในแต่ละ resource เช่น `WarehousesService.create()` นับ warehouse ที่ `deletedAt: null` เทียบ `maxWarehouses` reject 402/403 ถ้าเกิน |

### การตัดสินใจที่ยืนยันแล้ว ✅
รวมเข้ากับงาน enforcement ข้อ 3 เป็นเนื้อเดียวกัน ไม่ใช่งานแยก

### Dependency
ผูกกับข้อ 3 โดยตรง — ทำพร้อมกันได้

---

### 5.4 Registration ไม่สร้าง Company อัตโนมัติ
**สถานะ:** ✅ ยืนยันแล้ว — ปล่อยให้ user สร้างเองทีหลังตามเดิม ไม่ต้องแก้อะไร

---

### 5.5 Dynamic RBAC ต่อ tenant (owner กำหนดสิทธิ์/สร้าง role เอง)

**สถานะ:** 🔴 — งานใหญ่สุดในแผนทั้งหมด เปลี่ยนกลไก authorization หลักทั้งแอป ตอนนี้สิทธิ์ทุกจุด**hardcoded ในซอร์สโค้ดล้วนๆ** (`roles.guard.ts` เทียบ `user.role` กับ array ที่ฝังในโค้ดตรงๆ ไม่มีการอ่าน DB เรื่องสิทธิ์เลย) — ต่อให้เพิ่ม row ใหม่ใน `Role` table ก็ยังทำอะไรไม่ได้เพราะไม่มี `@Roles()` ไหนอ้างถึงมัน

### Schema การเปลี่ยนแปลง
```prisma
model Role {
  // ...fields เดิม...
  tenantId String? @map("tenant_id") @db.Uuid // null = role มาตรฐานของระบบ ใช้ร่วมกันทุก tenant, มีค่า = role ที่ tenant นั้นสร้างเอง

  tenant      Tenant?  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  permissions String[] @map("permissions") // list ของ Permission.code (native array เหมือน mfaRecoveryCodes)

  @@unique([tenantId, code]) // เดิมเป็น @unique เดี่ยว - เปลี่ยนเป็น composite ให้แต่ละ tenant ตั้งชื่อซ้ำกันได้
}
// pattern เดียวกับ ProductAttributeOption ที่มีอยู่แล้ว (nullable tenantId = master-vs-tenant tier)

model Permission {
  id          String  @id @default(uuid()) @db.Uuid
  code        String  @unique @db.VarChar(100) // เช่น "products.manage", "reports.view"
  name        String  @db.VarChar(150)
  description String? @db.VarChar(500)
  category    String? @db.VarChar(50)

  createdByType String?   @map("created_by_type") @db.VarChar(20)
  createdById   String?   @map("created_by_id") @db.Uuid
  updatedByType String?   @map("updated_by_type") @db.VarChar(20)
  updatedById   String?   @map("updated_by_id") @db.Uuid
  deletedAt     DateTime? @map("deleted_at")
  deletedByType String?   @map("deleted_by_type") @db.VarChar(20)
  deletedById   String?   @map("deleted_by_id") @db.Uuid

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("permissions")
} // catalog model เหมือน Unit/Brand/TaxType - ต้องมี audit block เต็มตาม convention เดียวกัน

model User {
  // ...fields เดิม...
  companyId String? @map("company_id") @db.Uuid // null = เห็น/ทำงานได้ทุกบริษัทย่อยในเทแนนต์, มีค่า = จำกัดเฉพาะบริษัทย่อยนั้น

  company Company? @relation(fields: [companyId], references: [id], onDelete: SetNull)
}
```

### API / Service ที่เพิ่ม-แก้
| Method | Path | คำอธิบาย |
|---|---|---|
| POST | `/roles` | ใหม่ (tenant-scoped คนละตัวกับ `/platform/roles`) — owner สร้าง role ใหม่ในเทแนนต์ตัวเอง เลือก permission จาก catalog |
| PATCH | `/roles/{id}` | ใหม่ — แก้ permission เฉพาะ role ที่ tenant สร้างเอง (ห้ามแก้ role มาตรฐานระบบ กัน owner ล็อกตัวเองออก) |
| GET | `/permissions` | ใหม่ — catalog ให้ UI render checklist |
| — | — | แทนที่ `RolesGuard` เดิม: query `Role.permissions` จาก DB เช็คแทนเทียบ array hardcoded — migrate `@Roles(...)` → `@RequirePermission(...)` ทั่วแอป (62+ จุด) พร้อม seed permission ให้ตรงพฤติกรรมปัจจุบันทุกตัว |
| — | — | เพิ่ม `COMPANY_SCOPED_MODELS` คู่กับ `TENANT_SCOPED_MODELS` เดิม (`prisma-tenant.extension.ts`) กรอง `Warehouse`/`BinLocation`/stock ด้วย `user.companyId` เพิ่มอีกชั้น |
| — | — | `UsersService.createInCompany()` เช็ค `maxUsers` (ข้อ 5.3) ก่อนสร้างใหม่เสมอ |

### การตัดสินใจที่ยืนยันแล้ว ✅
1. `Permission.code` รูปแบบเดียวกับ `SubscriptionPlan.features` — **รวมเป็น catalog เดียวกัน** ตรวจ 2 ชั้นต่อ request: แพ็กเกจต้องมี feature นี้ (tenant level) + role ต้องมี permission นี้ (user level)
2. แก้ role มาตรฐานระบบ (`admin`/`manager`) ไม่ได้ แก้ได้แค่ role ที่ tenant สร้างเอง
3. `User.companyId`: default ไม่เห็นข้ามบริษัทย่อย แต่ **owner เป็นคนกำหนดเองได้** ต่อ user แต่ละคน (null = เห็นทุกบริษัท, มีค่า = จำกัดบริษัทเดียว) — ตรงกับหลักฐานที่เจอใน `CreateUserDto` (`create-user.dto.ts:4-15`) ที่มีคอมเมนต์บอกเองว่า `ASSIGNABLE_ROLES` เป็น known gap รอผูกกับ `Role` table จริง — พอทำข้อนี้ ต้องอัพเดต `CreateUserDto`/`UpdateUserDto` ให้ดึง role list จาก `Role` table จริง + เพิ่ม `companyId?` เข้า DTO ด้วย

### คำถามเปิด ⚠️
ไม่มีคำถามใหญ่ค้าง — ทุกจุดตัดสินใจแล้ว เหลือแค่ปริมาณงาน migrate

### Dependency
**แนะนำแยกเป็น track ของตัวเอง ทำหลังสุด** — เปลี่ยนกลไก authorization หลักทั้งแอป ผลกระทบกว้างกว่าทุกข้ออื่นรวมกัน ควรให้ข้อ 1-4 นิ่งก่อนค่อยเริ่ม ลดความเสี่ยงชนกันตอน merge

---

## 6. Master Data — ขอบเขต Tenant vs Company

**สถานะ:** 🟡 — ตรวจ 6 หมวดตามที่ขอ เทียบกับโค้ดจริง สรุปว่าควรแยกตาม Company จริงแค่ 2 จุด นอกนั้นควรคงเป็น shared ทั้ง tenant

| หมวด | สถานะ | ควรผูก `companyId` ไหม | เหตุผล |
|---|---|---|---|
| Owner login | ✅ ครบแล้ว | – | `POST /auth/login`, JWT `{userId, tenantId, role}`, คืน `subscription.features` — ทดสอบจริงแล้วหลายรอบ |
| Companies (บริษัทในเครือ) | 🟡 CRUD ครบแต่เป็น record ลอย | – | ต่อเมื่อทำข้อ 5.2 เสร็จถึงจะ "มีความหมาย" จริง |
| Products (SKU) | ✅ ครบ | **ไม่ต้อง** | ธุรกิจส่วนใหญ่อยากมีแคตตาล็อกกลางชุดเดียวใช้ร่วมกันทุกบริษัทย่อย ส่วนที่ต่างจริงคือสต็อกอยู่คลังไหน → แยกที่ `Warehouse.companyId` (5.2) แทน |
| Units & Dimensions | ✅ ครบ | **ไม่ต้อง** | หน่วยวัด (PCS/KG/BOX) ใช้ร่วมกันได้ทั้งกลุ่มบริษัท |
| Warehouse & Bins | ⚠️ ยังไม่เชื่อม | **ต้อง** — ตามแผน 5.2 | ตรงตาม requirement เดิม ("อาจใช้คลังเดียวกันหรือแยกก็ได้") |
| Suppliers | 🟡 | **ต้อง** (nullable) — ตามแผน 5.2 | เคส inter-company |
| Tax Types | ✅ ครบ | **ไม่ต้อง** | อัตราภาษีเป็นอัตรารัฐกำหนดระดับประเทศ ไม่ต่างตามบริษัทย่อย |
| Users / RBAC | ⚠️ พบช่องว่างใหม่ | **ต้อง** — ตามแผน 5.5 | `User` ไม่มี `companyId` เลย ตอนนี้ทุกคนเห็นข้อมูลทั้งเทแนนต์เสมอ ไม่มีกลไกจำกัดตาม Company |

### Schema การเปลี่ยนแปลง
ดูข้อ 5.2 (`Warehouse.companyId`, `Supplier.companyId`) และข้อ 5.5 (`User.companyId`) — ไม่มี schema เพิ่มเติมนอกเหนือจากที่ระบุไว้แล้วในสองข้อนั้น

### การตัดสินใจที่ยืนยันแล้ว ✅
Finding หลัก: grep `companyId` ทั้งสคีมาก่อนแก้ = 0 จุด → ทุก master-data model ตอนนี้ผูกกับ `tenantId` เท่านั้น ไม่มีการแยกตามบริษัทย่อยเลยในระบบจริง — การตัดสินใจแยกเป็นรายโมเดลตามตารางข้างบนคือทางออก ไม่ใช่ผูก `companyId` ทุกโมเดลแบบเหมารวม

### Dependency
ขึ้นกับข้อ 5.2 (Warehouse/Supplier) และ 5.5 (User) โดยตรง — ไม่มีงานอิสระของตัวเองแยกออกมา

---

## 7. Warehouse/Stock Ops + ค้นหาตำแหน่งจัดเก็บ

**สถานะ:** 🟡 — GR/GI/Transfer/Adjustment/Cycle Count ออกแบบไว้ครบแล้วในข้อ 2/4.1 เจอช่องว่างใหม่ 1 จุด: ค้นหาตำแหน่งจัดเก็บ

**ยืนยันแล้ว ไม่ต้องแก้**: bin-to-bin ภายในคลังเดียวกัน **ใช้งานได้อยู่แล้ว** — `StockTransfersService.createTransfer()` ไม่มีเช็คห้าม `fromWarehouseId === toWarehouseId` เลย ส่ง `fromBinLocationId`/`toBinLocationId` ต่างกันในคลังเดียวกันได้ทันที

### ⚠️ ค้นหาตำแหน่งจัดเก็บ — ไม่มี endpoint ที่ใช้งานได้จริง
3 endpoint ที่มีอยู่ตอนนี้ไม่มีตัวไหนตอบโจทย์ "สแกน/พิมพ์แล้วรู้ว่าของอยู่ตรงไหน":
1. `GET /tags/{tagId}` — ได้แค่ตำแหน่งของ tag เดียวที่รู้ id ตรงๆ
2. `GET /tags?productId=X` — ไม่ join `currentState` เลย (N+1 ถ้าอยากรู้ตำแหน่งทุกชิ้น)
3. `GET /warehouses/{id}/stock` — แค่จำนวนรวมต่อคลังเดียว ไม่แจกแจงราย bin ไม่ข้ามคลัง

### Schema การเปลี่ยนแปลง
ไม่มี

### API / Service ที่เพิ่ม-แก้
| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/stock/lookup?code=<ข้อความ>` | ใหม่ — endpoint เดียว รองรับพิมพ์/สแกน Barcode/SKU/Serial พร้อมกัน ระบบเดาชนิดให้เอง |

```ts
async lookup(code: string) {
  // 1) ลองเป็น Serial (RFID tagId) ก่อน - เจาะจงหน่วยเดียวเป๊ะ
  const tag = await this.prisma.scoped.tag.findUnique({ where: { tagId: code } });
  if (tag) return { type: 'serial', tag: await this.tagsService.getDetail(code) };

  // 2) ลองเป็น Barcode/SKU/Code ของ Product (OR ทั้ง 3 field)
  const product = await this.prisma.scoped.product.findFirst({
    where: { OR: [{ barcodeValue: code }, { sku: code }, { code: code }] },
  });
  if (product) return { type: 'product', product: await this.enrichOne(product), locations: await this.getLocationBreakdown(product.id) };

  throw new NotFoundException(`No product or tag matches "${code}"`);
}

async getLocationBreakdown(productId: string) {
  return this.prisma.scoped.tagCurrentState.groupBy({
    by: ['lastWarehouseId', 'lastBinLocationId'],
    where: { productId, status: 'in_stock' },
    _count: { tagId: true },
  });
}
```
`GET /products?search=<code>` เดิมยังเก็บไว้ตามเดิม (คนละ use case — endpoint ใหม่นี้เจาะจง "พิมพ์/สแกนโค้ดเดียว หาให้ตรงตัว")

### การตัดสินใจที่ยืนยันแล้ว ✅
ต้องรองรับพิมพ์เองได้ด้วย ไม่ใช่แค่สแกน และต้องมีช่องค้นหาเดียว ไม่ต้องเลือกชนิดโค้ดล่วงหน้า

### คำถามเปิด ⚠️
ไม่มี

### Dependency
ไม่ผูกกับข้อไหน ทำเมื่อไหร่ก็ได้ — แนะนำแซงคิวทำพร้อมข้อ 1 เพราะเล็กและเป็นประโยชน์ทันที

---

## 8. Sales Order (SO)

**สถานะ:** 🔴 ไม่มีอยู่เลย — `Customer`/`SalesOrder` ไม่มีในสคีมาเลยทั้งคู่ `GoodsIssue.reference` เป็นแค่ free-text ไม่ใช่ FK จริง — ฟีเจอร์ใหม่ทั้งชั้น แต่กลไกสต็อกที่ต้องใช้ (reserve/release/FEFO/dispatch) **มีอยู่แล้วครบ** จากข้อ 1/4.1

**สิ่งที่จะเพิ่ม/แก้:**
- ระบบ SO เต็มรูปแบบ: จองสต็อก → ยืนยัน → เบิกจ่าย (หลายคลังต่อออเดอร์ได้) → ยกเลิก/คืนจอง
- Import แบบ multi-row-to-one-group เหมือน StockTransfer/CycleCount

### Schema การเปลี่ยนแปลง
```prisma
model Customer {
  id            String  @id @default(uuid()) @db.Uuid
  tenantId      String  @map("tenant_id") @db.Uuid
  code          String  @db.VarChar(50)
  name          String  @db.VarChar(255)
  contactPerson String? @map("contact_person") @db.VarChar(100)
  phone         String? @db.VarChar(50)
  email         String? @db.VarChar(255)
  taxId         String? @map("tax_id") @db.VarChar(20)
  address       String? @db.Text
  isActive      Boolean @default(true) @map("is_active")
  // ...audit fields ตาม pattern เดิมทุกโมเดล...

  tenant      Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  salesOrders SalesOrder[]

  @@unique([tenantId, code])
  @@index([tenantId])
  @@map("customers")
} // โครงเดียวกับ Supplier - ฝั่งตรงข้ามของธุรกรรมเดียวกัน

enum SalesOrderStatus {
  draft
  confirmed
  partially_fulfilled
  fulfilled
  cancelled
}

model SalesOrder {
  id                String           @id @default(uuid()) @db.Uuid
  tenantId          String           @map("tenant_id") @db.Uuid
  orderNumber       String           @map("order_number") @db.VarChar(100)
  customerId        String           @map("customer_id") @db.Uuid
  status            SalesOrderStatus @default(draft)
  orderDate         DateTime         @map("order_date")
  requestedShipDate DateTime?        @map("requested_ship_date")
  customerReference String?          @map("customer_reference") @db.VarChar(255)
  notes             String?          @db.VarChar(1000)
  // ...audit fields...

  customer    Customer         @relation(fields: [customerId], references: [id])
  lines       SalesOrderLine[]
  goodsIssues GoodsIssue[]

  @@unique([tenantId, orderNumber])
  @@index([tenantId])
  @@index([tenantId, customerId])
  @@map("sales_orders")
}

model SalesOrderLine {
  id                String  @id @default(uuid()) @db.Uuid
  salesOrderId      String  @map("sales_order_id") @db.Uuid
  productId         String  @map("product_id") @db.Uuid
  warehouseId       String  @map("warehouse_id") @db.Uuid // แต่ละ line เลือกคลังเองอิสระ - รองรับหลายคลังต่อออเดอร์
  quantity          Int
  unitPriceMinor    BigInt? @map("unit_price_minor") // override ราคา list price ของ Product ได้ต่อลูกค้า
  fulfilledQuantity Int     @default(0) @map("fulfilled_quantity")

  createdAt DateTime @default(now()) @map("created_at") // บรรทัดเดียวพอ ไม่ใช่ audit block เต็ม - ตาม convention ของ InvoiceLine (child/line-item ใต้เอกสารหัวบิล)

  salesOrder SalesOrder @relation(fields: [salesOrderId], references: [id], onDelete: Cascade)
  product    Product    @relation(fields: [productId], references: [id])
  warehouse  Warehouse  @relation(fields: [warehouseId], references: [id])

  @@index([salesOrderId])
  @@map("sales_order_lines")
}

model GoodsIssue {
  // ...fields เดิมทั้งหมด...
  salesOrderId String? @map("sales_order_id") @db.Uuid // nullable - GoodsIssue ยังสร้างเองไม่ผูก SO ได้เหมือนเดิม

  salesOrder SalesOrder? @relation(fields: [salesOrderId], references: [id], onDelete: SetNull)
}
```

### API / Service ที่เพิ่ม-แก้
| Method | Path | คำอธิบาย |
|---|---|---|
| — | `CustomersService` | CRUD มาตรฐาน ก็อปแบบ `SuppliersService`/`ManufacturersService` |
| POST | `/sales-orders` | `create(dto)` — สร้างที่ status `draft` พร้อม lines ยังไม่แตะสต็อก |
| POST | `/sales-orders/{id}/confirm` | จัดกลุ่ม lines ตาม `warehouseId` → สร้าง `GoodsIssue` 1 ใบต่อ 1 คลัง → เรียก `findFifoCandidates()`/`reserveTag()` ต่อ line — ทั้งหมดครอบด้วย `$transaction` |
| POST | `/sales-orders/{id}/dispatch` | เรียก `GoodsIssuesService.dispatch()`/`dispatchByQuantity()` เดิม แล้วอัพเดต `fulfilledQuantity` + คำนวณ SO status ใหม่ |
| POST | `/sales-orders/{id}/cancel` | วนทุก `GoodsIssue` ที่ยังไม่ dispatch → `releaseTag()` คืนสต็อก → status `cancelled` |
| GET | `/sales-orders`, `/sales-orders/{id}` | มาตรฐาน |
| (import) | `entityType: 'sales-orders'` | 1 แถว = 1 line, กลุ่มด้วย `orderNumber` เดียวกัน (`importGroup()`/`groupByColumn` pattern เดิมจาก StockTransfer/CycleCount) |

```
readonly importExportColumns: ColumnSpec[] = [
  { header: 'orderNumber', field: 'orderNumber' },
  { header: 'customerCode', field: 'customerCode' },
  { header: 'warehouseCode', field: 'warehouseCode' },
  { header: 'orderDate', field: 'orderDate' },
  { header: 'productSku', field: 'productSku' },
  { header: 'quantity', field: 'quantity' },
  { header: 'unitPrice', field: 'unitPrice' }, // optional
];
```

### การตัดสินใจที่ยืนยันแล้ว ✅
1. **สต็อกไม่พอตอน `confirm()` → block ทั้งใบ** — ไม่มี backorder, ไม่ partial-reserve, ใช้ `$transaction` ให้ atomic
2. **รองรับหลายคลังต่อออเดอร์** — `warehouseId` อยู่ระดับ `SalesOrderLine` ไม่ใช่ `SalesOrder`, `confirm()` สร้าง `GoodsIssue` แยกต่อคลังอัตโนมัติ
3. **ไม่ทำ Sales Invoice ในรอบนี้** — โจทย์เดิมคือ "WMS & Inventory Management Platform" ไม่ใช่ ERP/บัญชีเต็มรูปแบบ ใบกำกับภาษีไทยเป็นงานใหญ่แยกต่างหาก ธุรกิจส่วนใหญ่มีโปรแกรมบัญชีแยกอยู่แล้ว ข้อมูลที่ SO เก็บ (ลูกค้า/ราคา/จำนวน/วันที่) พอให้ต่อยอดทีหลังได้เสมอ
4. Import ลงเป็น `draft` เสมอ ไม่ auto-confirm (กันจองสต็อกผิดจากไฟล์พิมพ์ผิด)

### คำถามเปิด ⚠️
ไม่มี — ตัดสินใจครบทั้ง 3 จุดหลักแล้ว

### Dependency
ควรทำหลังข้อ 1 (FEFO) และอาศัย `dispatchByQuantity` ที่พร้อมอยู่แล้ววันนี้ — ไม่ผูกกับ Cycle Count/RBAC เลย ทำคู่ขนานกับ track อื่นได้

---

## 9. Reports & Analytics

**สถานะ:** 🟡 มี 3 report จริงแล้ว (`ReportsService`) — **Stock Card**, **Moving Analysis**, **Stock Valuation** (FIFO specific-identification จริงจาก `Tag.unitCostMinor`) ออกแบบเชิงเทคนิคดี (`uncostedCount` รายงานตรงๆ แทนที่จะแกล้งคิดเป็น 0)

**สิ่งที่จะเพิ่ม/แก้:**
- Stock Card: เพิ่มตัวกรองช่วงวันที่
- Backfill `unitCostMinor` ของ tag เก่า
- เพิ่ม `@Roles()` guard (ไม่มีเลยสักตัวตอนนี้)
- เพิ่มการกรองตามคลัง/บริษัทย่อย (กันข้อมูลรั่วหลังทำข้อ 5.2/6)
- เพิ่มรายงานสินค้าใกล้หมดอายุ

### Schema การเปลี่ยนแปลง
ไม่มี — ใช้ข้อมูลที่มีอยู่แล้วทั้งหมด (`TagEvent`, `Tag.expiryDate`, `Tag.unitCostMinor`)

### API / Service ที่เพิ่ม-แก้
| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/reports/stock-card?productId=X&from=&to=` | แก้ — เพิ่ม `from`/`to` query param กรองที่ query DB ตรงๆ (ตัด client-side filter ทั้งหมด) |
| GET | `/reports/expiring-soon?days=30` | ใหม่ — list tag/สินค้าที่ `expiryDate` อยู่ใน N วันข้างหน้า จัดกลุ่มตามสินค้า+lot |
| (แก้) | ทุก endpoint ใน `ReportsController` | เพิ่ม `@Roles()` — Stock Valuation ควรจำกัดเข้มกว่า (`reports.valuation.view` แยกจาก `reports.view`) |
| (แก้) | ทั้ง 3 report | เพิ่ม `warehouseId`/company filter เมื่อทำข้อ 5.2+6 เสร็จ |
| (script) | one-time backfill | ไล่ tag เก่าที่ `unitCostMinor IS NULL` แต่มี `productId` → backfill จาก `Product.costPriceMinor` ปัจจุบัน (ระบุชัดว่าเป็นค่าประมาณย้อนหลัง) |

### การตัดสินใจที่ยืนยันแล้ว ✅
- Dead-stock/Slow-mover **ครบแล้วไม่ใช่ gap** — Moving Analysis ทำหน้าที่นี้อยู่แล้ว (เรียงเคลื่อนไหวน้อยสุดก่อน + `daysSinceLastMovement`)
- **ไม่รวมรอบนี้**: รายงานยอดขาย/ลูกค้า (รอข้อ 8 เสร็จก่อน), Export Excel/CSV (ยังไม่มีคนขอตรงๆ — ถ้าต้องการ reuse `file-codec.util.ts` ที่มีอยู่แล้วได้)

### คำถามเปิด ⚠️
`@RequirePermission('reports.valuation.view')` ผูกกับข้อ 5.5 — ต้องรอ dynamic RBAC เสร็จก่อนถึงจะ implement guard แบบละเอียดนี้ได้ (ระหว่างนี้ใช้ `@Roles()` ธรรมดาไปก่อนก็ได้)

### Dependency
แบ่ง 2 กลุ่ม:

**(ก) ทำได้ทันที ไม่ผูกกับข้ออื่น** — date filter, expiry report, backfill script

**(ข) ต้องรอ** — แยกเป็น 2 เส้นที่ต้องรอคนละของ เหตุผลที่รอไม่ใช่แค่ "ผูกกัน" เฉยๆ แต่เป็นเพราะ**โครงสร้างที่ต้องใช้ยังไม่มีอยู่จริง**:

1. **RBAC ระดับ permission ละเอียด (`reports.valuation.view`) → ต้องรอข้อ 5.5**: ตอนนี้ระบบมีแค่ `@Roles()` แบบ hardcoded เทียบ `user.role` ตรงๆ ไม่มี permission catalog ให้แยกสิทธิ์ "ดูรายงานทั่วไป" ออกจาก "ดูมูลค่า/ต้นทุน" ได้ละเอียดขนาดนั้น — ถ้าจะรีบทำตอนนี้ทำได้แค่ `@Roles('owner', 'admin', 'superadmin')` แบบหยาบๆ ไปก่อน (ไม่ต้องรอ 5.5) แต่ owner จะยังเลือกเองไม่ได้ว่า role ไหนดู valuation ได้บ้างจนกว่า `Permission`/`Role.permissions` (5.5) จะพร้อม

2. **warehouse/company filter → ต้องรอทั้งข้อ 5.2 และข้อ 6/5.5 พร้อมกัน (ขาดตัวใดตัวหนึ่งไม่พอ)**:
   - ข้อ 5.2 ให้ `Warehouse.companyId` — บอกว่าคลังไหนเป็นของบริษัทย่อยไหน (ข้อมูลตั้งต้น)
   - ข้อ 6/5.5 ให้ `User.companyId` + `COMPANY_SCOPED_MODELS` — บอกว่า user คนนี้ถูกจำกัดเห็นแค่บริษัทไหน (กลไกกรอง)
   - Reports ต้องใช้**ทั้งคู่ร่วมกัน**: query `warehouseId IN (SELECT id FROM warehouses WHERE companyId = user.companyId OR companyId IS NULL)` ก่อนส่งต่อให้ `ReportsService` ทั้ง 3 ตัว — ถ้ามีแค่ 5.2 (Warehouse ผูก company แล้ว) แต่ยังไม่มี 6 (ไม่รู้ว่า user คนไหนถูกจำกัดบริษัทไหน) ก็ยังกรองไม่ได้อยู่ดี เพราะไม่รู้จะกรองด้วยเงื่อนไขอะไร

**สิ่งที่ต้องแก้จริงตอนนั้น (ทำพร้อมกันในรอบเดียว ห้ามลืม)**:
- `getStockCard()`, `getMovingAnalysis()`, `getStockValuation()` ทั้ง 3 ตัว เพิ่ม join/where กรอง `warehouseId` ตาม company scope ของ `user.companyId` ก่อนคำนวณทุกครั้ง (ตอนนี้ทั้ง 3 อ่านทั้งเทแนนต์เสมอไม่มี filter เลย)
- ติด `@RequirePermission('reports.valuation.view')` แทน `@Roles()` ชั่วคราวที่ทำไว้ในข้อ (ก)/ช่วงต้น

**ผลถ้าไม่ทำพร้อมกัน**: user ที่ถูก `User.companyId` จำกัดให้เห็นแค่บริษัทย่อย B (ตาม 5.5/6) จะยังเรียก `GET /reports/stock-valuation` แล้วเห็นมูลค่า/การเคลื่อนไหวสต็อกของบริษัทย่อย A ได้อยู่ดี เพราะ endpoint ของ Reports ไม่รู้จัก company scope เลยถ้าไม่แก้คู่กัน — เป็นช่องโหว่ข้อมูลรั่วข้ามบริษัทย่อยที่เงียบและตรวจจับยาก (ไม่ error ไม่ 403 แค่เห็นข้อมูลที่ไม่ควรเห็น)

---

## 10. Platform Admin — ควบคุมระบบระดับ Provider

**สถานะ:** 🟡 — Authentication พร้อมสมบูรณ์ (`PlatformAdmin` แยกจาก tenant `User` เต็มรูปแบบ, JWT+refresh, MFA, lockout, throttle) Role มีจริง (`PlatformAdminRole { super_admin, billing, support }`) แต่**ไม่เคย enforce** ขอบเขตควบคุมจำกัดมาก (6 controller: auth, devices, reader-models, rentals, menu-items, roles) — ไม่มี tenant management, billing oversight, หรือ admin account management ผ่าน API เลย

**สิ่งที่จะเพิ่ม/แก้:**
- บังคับใช้ `@PlatformRoles()` จริงตาม list ที่ตัดสินใจแล้ว
- เพิ่ม platform-level tenant management (list/suspend)
- เปิดใช้ billing oversight (`RefundsService` มีโค้ดแล้วแต่เข้าไม่ถึง)
- เพิ่ม API จัดการบัญชี platform admin (ตอนนี้ทำได้แค่ CLI script)
- **ไม่รวม**: บังคับ MFA สำหรับ `super_admin` (ตามที่แจ้งไว้ ยังไม่ทำรอบนี้)

### Schema การเปลี่ยนแปลง
```prisma
model Tenant {
  // ...fields เดิมทั้งหมด...
  suspendedAt     DateTime? @map("suspended_at")
  suspendedReason String?   @map("suspended_reason")
}
```
(ไม่มี schema เปลี่ยนสำหรับ 10.1/10.3/10.4 — ใช้ `PlatformAdmin.isActive`/`PlatformAdminRole` ที่มีอยู่แล้ว)

### API / Service ที่เพิ่ม-แก้

**10.1 บังคับใช้ `@PlatformRoles()`** — ติด decorator ตาม list นี้กับ controller เดิม 5 ตัว:

| Controller / Route | เสนอ role | เหตุผล |
|---|---|---|
| `platform/auth/*` | ไม่จำกัด | self-service ของ admin เอง |
| `platform/roles` | `super_admin` เท่านั้น | กระทบ permission ทุก tenant พร้อมกัน |
| `platform/reader-models` | `super_admin` เท่านั้น | แคตตาล็อกกลางกระทบทุก tenant |
| `platform/menu-items` | `super_admin` เท่านั้น | โครงสร้าง menu กลาง |
| `platform/companies/:tenantId/menu-items` | `super_admin`, `billing` | ผูกกับแผนการเงินโดยตรง |
| `platform/devices/owned` | `super_admin`, `support` | operations ประจำวัน |
| `platform/rentals/units`, `/rentals/assignments` | `super_admin`, `support` | operations เดียวกัน |

**10.2 Tenant Management** (ใหม่ — `TenantsAdminController`, `platform/tenants`, role: ดู=ทุก role / suspend=`super_admin` เท่านั้น)

| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/platform/tenants` | list ทุก tenant พร้อม pagination+search, สรุป user count/subscription status |
| GET | `/platform/tenants/:id` | รายละเอียด (companies, subscription, usage เทียบ quota ข้อ 5.3) |
| POST | `/platform/tenants/:id/suspend` | ระงับการใช้งานทันที |
| POST | `/platform/tenants/:id/reactivate` | คืนสิทธิ์ |

**10.3 Billing Oversight** (ใหม่ — `BillingAdminController`, `platform/billing`, role: `super_admin`, `billing`)

| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/platform/billing/subscriptions` | list ข้าม tenant (filter status/planCode/tenantId) |
| GET | `/platform/billing/invoices`, `/platform/billing/payments` | เหมือนกัน ข้าม tenant |
| POST | `/platform/billing/payments/:id/refund` | เรียก `RefundsService` ที่มีอยู่แล้วตรงๆ |

**10.4 Platform Admin Account Management** (ใหม่ — `PlatformAdminsAdminController`, `platform/admins`, role: `super_admin` เท่านั้นทั้งไฟล์)

| Method | Path | คำอธิบาย |
|---|---|---|
| POST | `/platform/admins` | สร้าง admin ใหม่ — reuse `PlatformAdminsService.create()` เดิม |
| GET | `/platform/admins` | list ทั้งหมด (ไม่คืน passwordHash/mfaSecret/recoveryCodes) |
| PATCH | `/platform/admins/:id` | แก้ role/fullName |
| POST | `/platform/admins/:id/deactivate` | ตั้ง `isActive=false` |

### การตัดสินใจที่ยืนยันแล้ว ✅
1. List role-mapping ของ 10.1 ตามตารางข้างบน — ตัดสินใจครบแล้วทุก controller
2. **ไม่บังคับ MFA สำหรับ `super_admin` ในรอบนี้** ตามที่แจ้งไว้ — MFA คงเป็น optional เหมือนเดิมทุกประการ

### คำถามเปิด ⚠️
1. **(10.2)** suspend แล้ว user ที่ login ค้างอยู่ (token ยังไม่หมดอายุ) ควรถูกเตะออกทันที หรือรอ token หมดอายุเอง?
2. **(10.4)** `super_admin` deactivate/ลด role ตัวเองได้ไหม — แนะนำบล็อก (ต้องเหลืออย่างน้อย 1 `super_admin` ที่ `isActive=true` เสมอ)
3. **(พบเพิ่มระหว่างออกแบบ)** `PlatformAdmin.isActive` มีในสคีมาแล้วแต่ **ไม่มีจุดไหนเช็คตอน login เลย** (`platform-auth.service.ts`) — ต้องแก้คู่กับ 10.4 ไม่งั้น `deactivate` ที่จะสร้างใหม่ไม่มีผลจริง

### Dependency
แยกอิสระจากทุกข้อ (คนละระบบสิทธิ์กับ tenant RBAC ข้อ 5.5 — `PlatformAdmin` vs tenant `User`) ทำเมื่อไหร่ก็ได้ ลำดับย่อยแนะนำ: (1) 10.1+10.4 ก่อน (controller/role กลุ่มเดียวกัน) → (2) 10.3 (อิสระ ไม่มี unknown) → (3) 10.2 ทำหลังสุด (มีคำถามเปิดต้องตอบก่อน + แตะ schema)

---

## ภาคผนวก: ลำดับที่แนะนำ

1. **ข้อ 1 (FEFO)** — ทำได้เลย ไม่มี unknown
2. **ข้อ 3 (Feature gating)** — โครงสร้างพร้อมแล้ว รอ business feature-code list
3. **ข้อ 7 (`GET /stock/lookup`)** — เล็ก ไม่ผูกกับข้ออื่น แซงคิวทำพร้อมข้อ 1 ได้
4. **ข้อ 5.1-5.4** (role/company/warehouse quota) — ขนาดกลาง ทำแยกจากข้อ 2/3 ได้ (5.3 ผูกกับข้อ 3 ทำพร้อมกันได้)
5. **ข้อ 8 (Sales Order)** — ทำหลังข้อ 1 พร้อม `dispatchByQuantity` ที่มีอยู่แล้ว ไม่ผูกกับ Cycle Count/RBAC ทำคู่ขนานได้
6. **ข้อ 2 (Cycle Count)** — ใหญ่สุด ทำหลังสุด ลำดับย่อย: 4.1 ByQuantity → schema → reconciliation → transferByQuantity/createAdjustmentByQuantity → MQTT middleware
7. **ข้อ 5.5 + ข้อ 6 (Dynamic RBAC)** — แยก track ของตัวเอง ทำหลังสุด (กระทบกว้างสุด 62+ จุด) รวม `User.companyId` เข้าไปพร้อมกันเพราะเป็นระบบสิทธิ์ชุดเดียวกัน
8. **ข้อ 9 (Reports)** — กลุ่ม (ก) เล็กทำได้ทันที: date filter/expiry report/backfill script · กลุ่ม (ข) รอข้อ 5.5+5.2/6
9. **ข้อ 10 (Platform Admin)** — อิสระจากทุกข้อ ทำเมื่อไหร่ก็ได้ ลำดับย่อย: 10.1+10.4 → 10.3 → 10.2
