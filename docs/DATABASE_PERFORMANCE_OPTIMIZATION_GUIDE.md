# MatchStock — Database Performance & Atomic Stock Optimization Guide

คู่มือแนวทางการเขียนโค้ดและปรับแต่งประสิทธิภาพฐานข้อมูลสำหรับทีมพัฒนา **Backend** ของ MatchStock WMS เน้นความเรียบง่าย เสถียรสูง และสต็อกไม่ติดลบ 100% โดยไม่ต้องพึ่งพา Infrastructure ซับซ้อน

---

## 🎯 1. หัวใจสำคัญ: Atomic SQL Stock Updates (ป้องกันสต็อกติดลบ 100%)

ในการจัดการสต็อกคลังสินค้า ห้ามอ่านค่าสต็อกมาลบในโค้ด JavaScript/TypeScript แล้วเซฟกลับเด็ดขาด (เพราะจะเกิด Race Condition เมื่อยิงสแกนพร้อมกัน) **ต้องสั่งอัปเดตตรงที่ Database พร้อมเงื่อนไขเสมอ**

### 1.1 โค้ดตัวอย่างสำหรับการตัดจ่ายสินค้า (Goods Issue / Outbound)
```typescript
// backend/src/services/stock-balance.service.ts

import { PrismaClient } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

export async function deductStockBalance(
  tx: PrismaClient,
  params: {
    tenantId: string;
    warehouseId: string;
    binLocationId?: string | null;
    productId: string;
    lotNumber?: string | null;
    quantity: number;
  }
) {
  const { tenantId, warehouseId, binLocationId, productId, lotNumber, quantity } = params;

  // สั่ง Database ให้ลดยอดเฉพาะเมื่อของในสต็อกมีมากกว่าหรือเท่ากับจำนวนที่ต้องการตัด
  const affectedRows = await tx.$executeRaw`
    UPDATE stock_balances
    SET quantity_on_hand = quantity_on_hand - ${quantity},
        updated_at = NOW()
    WHERE tenant_id = ${tenantId}::uuid
      AND warehouse_id = ${warehouseId}::uuid
      AND (bin_location_id = ${binLocationId}::uuid OR (bin_location_id IS NULL AND ${binLocationId} IS NULL))
      AND product_id = ${productId}::uuid
      AND (lot_number = ${lotNumber} OR (lot_number IS NULL AND ${lotNumber} IS NULL))
      AND quantity_on_hand >= ${quantity};
  `;

  if (affectedRows === 0) {
    throw new BadRequestException(
      `สินค้าในชั้นวางที่ระบุมีจำนวนไม่เพียงพอต่อการตัดจ่าย (ต้องการ ${quantity} ชิ้น)`
    );
  }
}
```

---

### 1.2 โค้ดตัวอย่างสำหรับการรับสินค้าเข้า / วางชั้น (Goods Receipt & Putaway / Inbound)
```typescript
export async function addStockBalance(
  tx: PrismaClient,
  params: {
    tenantId: string;
    warehouseId: string;
    binLocationId?: string | null;
    productId: string;
    lotNumber?: string | null;
    expiryDate?: Date | null;
    quantity: number;
  }
) {
  const { tenantId, warehouseId, binLocationId, productId, lotNumber, expiryDate, quantity } = params;

  // Upsert แบบ Atomic: ถ้ามีรายการอยู่แล้วให้บวกเพิ่ม ถ้ายังไม่มีให้สร้างใหม่
  await tx.$executeRaw`
    INSERT INTO stock_balances (
      id, tenant_id, warehouse_id, bin_location_id, product_id, lot_number, expiry_date, quantity_on_hand, quantity_reserved, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      ${tenantId}::uuid,
      ${warehouseId}::uuid,
      ${binLocationId}::uuid,
      ${productId}::uuid,
      ${lotNumber},
      ${expiryDate},
      ${quantity},
      0,
      NOW(),
      NOW()
    )
    ON CONFLICT (tenant_id, warehouse_id, bin_location_id, product_id, lot_number)
    DO UPDATE SET
      quantity_on_hand = stock_balances.quantity_on_hand + ${quantity},
      updated_at = NOW();
  `;
}
```

---

### 1.3 โค้ดตัวอย่างสำหรับการโอนย้ายสินค้าข้ามชั้นวาง (Stock Transfer)
```typescript
export async function transferStockBalance(
  tx: PrismaClient,
  params: {
    tenantId: string;
    warehouseId: string;
    fromBinLocationId?: string | null;
    toBinLocationId?: string | null;
    productId: string;
    lotNumber?: string | null;
    quantity: number;
  }
) {
  // 1. ตัดจาก Bin ต้นทาง
  await deductStockBalance(tx, {
    tenantId: params.tenantId,
    warehouseId: params.warehouseId,
    binLocationId: params.fromBinLocationId,
    productId: params.productId,
    lotNumber: params.lotNumber,
    quantity: params.quantity,
  });

  // 2. บวกเพิ่มที่ Bin ปลายทาง
  await addStockBalance(tx, {
    tenantId: params.tenantId,
    warehouseId: params.warehouseId,
    binLocationId: params.toBinLocationId,
    productId: params.productId,
    lotNumber: params.lotNumber,
    quantity: params.quantity,
  });
}
```

---

## ⚡ 2. การตั้งค่า Prisma Connection Control ในไฟล์ `.env`

โดยไม่ต้องพึ่งพา DevOps หรือติดตั้ง PgBouncer ทีมพัฒนาสามารถตั้งค่าจำนวน Connection Limit ได้จากระดับ Application `.env` ดังนี้:

```env
# ตั้งค่า connection_limit=10 ถึง 20 ตามสเปกเซิร์ฟเวอร์
DATABASE_URL="postgresql://user:password@localhost:5432/matchstock_db?schema=public&connection_limit=15&pool_timeout=30"
```

---

## 📊 3. สรุป Index หลักใน `schema.prisma`

ตาราง `StockBalance` ได้รับการเพิ่ม Composite Index เพื่อรองรับการค้นหาประสิทธิภาพสูง:
* `@@unique([tenantId, warehouseId, binLocationId, productId, lotNumber])` — ป้องกันแถวซ้ำและใช้ทำ Upsert
* `@@index([tenantId, warehouseId])` — ดึงยอดสต็อกรวมระดับคลัง
* `@@index([tenantId, productId])` — ค้นหาสินค้าชิ้นนั้นว่าวางอยู่ที่ไหนบ้าง
* `@@index([tenantId, warehouseId, binLocationId])` — ดึงรายการสินค้าทั้งหมดในชั้นวางนั้นๆ
