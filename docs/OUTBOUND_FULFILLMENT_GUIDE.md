# MatchStock — คู่มือสถาปัตยกรรมและการพัฒนาระบบเบิกจ่ายสินค้า (Outbound Fulfillment Guide)

เอกสารฉบับนี้สรุป **โครงสร้างกระบวนการเบิกจ่ายสินค้า (Outbound / Goods Issue)**, **การผูกกระบวนการเข้ากับระดับ Subscription**, **ระบบสถานะสินค้า Real-Time**, และ **สิ่งที่แต่ละทีม (Back-End, Front-End, QA) ต้องพัฒนาต่อยอด** เพื่อให้ทีมงานทุกคนเข้าใจและทำงานไปในทิศทางเดียวกันครับ

---

## 🧭 1. ภาพรวมกระบวนการเบิกจ่ายและระดับแพ็กเกจ (Subscription Matrix)

ระบบออกแบบให้ความยาวของขั้นตอนการทำงาน **ผูกกับระดับ Subscription Plan ของลูกค้าโดยตรง** แต่เปิดให้อิสระในการ **ปรับลดขั้นตอนให้สั้นลงตามความสะดวกหน้างาน (Freely Downscale)** ได้เสมอ:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 🥉 1. FREE PLAN (Starter) ➔ บังคับใช้ [ 1-Step Direct Issue ]                           │
│ • ไม่รองรับชั้นวาง (No Bins), สแกนบาร์โค้ดสินค้า 1 ครั้ง ➔ ตัดสต็อกและปิดงานทันที         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 🥈 2. PRO PLAN (Professional) ➔ ปลดล็อค [ 2-Step (Pick-Ship) & 3-Step (Pick-Pack-Ship) ]│
│ • รองรับชั้นวาง (Bin Locations), คุม Lot/FEFO, สร้างใบหยิบของ (Pick List)               │
│ • เพิ่มสถานีแพ็คกล่องพัสดุ (Packing Station & QC) + พิมพ์ใบปะหน้าขนส่ง (Waybill)         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 🥇 3. ULTRA PLAN (Enterprise) ➔ ปลดล็อค [ 4-Step Full Enterprise (Pick-Pack-Load-Ship) ]│
│ • ปลดล็อคขั้นตอนจัดการลานพักหน้าท่าโหลดตู้ (Loading Dock Staging / Bay Staging)          │
│ • รองรับ Wave / Zone Picking และ Multi-Warehouse Cross-Docking                          │
│ • รองรับการเชื่อมต่ออุปกรณ์ RFID Gate / Handheld สแกนอัตโนมัติ                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### ตารางสิทธิ์และการเลือกโหมดประจำคลัง (Warehouse Configuration)

| ระดับ Subscription | สิทธิ์สูงสุดที่ปลดล็อค | โหมดที่ลูกค้ามีสิทธิ์เลือกใช้งานประจำคลัง |
|---|---|---|
| 🥉 **Free Plan** | Level 1 | ใช้งานได้เฉพาะ: **`1-Step Direct`** (สแกนปุ๊บตัดจ่ายทันที) |
| 🥈 **Pro Plan** | Level 3 | เลือกใช้งานได้อิสระ: **`1-Step`**, **`2-Step (Pick ➔ Ship)`**, หรือ **`3-Step (Pick ➔ Pack ➔ Ship)`** |
| 🥇 **Ultra Plan** | Level 4 | เลือกใช้งานได้อิสระครบทั้ง 4 โหมด: **`1-Step`**, **`2-Step`**, **`3-Step`**, หรือ **`4-Step Enterprise`** |

---

## 🎯 2. กลยุทธ์ฮาร์ดแวร์: Barcode-First Standard (Phase 1) + RFID-Ready (Phase 2)

* **Phase 1 (มาตรฐานหลัก):** ทุกกระบวนการ (Pick, Pack, Load, Ship) ทำงานผ่าน **การสแกนบาร์โค้ด 100%** (เครื่องยิงบาร์โค้ด USB/Bluetooth, กล้องมือถือ, หรือ PDA)
* **Phase 2 (รองรับ RFID ล่วงหน้า):** Database Schema และ API ถูกเตรียมฟิลด์ `tagIds: string[]` และตาราง `tags` ไว้ล่วงหน้าแล้ว เมื่อลูกค้าสั่งซื้อ **Device Add-on Subscription (เช่าปืน RFID Handheld หรือ RFID Gate)** สามารถนำสัญญาณคลื่นมาเสียบเข้ากระบวนการได้ทันที **โดยไม่ต้องแก้โค้ดหรือ Migrate Database ใหม่**

---

## 📄 3. วงจรเอกสารใบเดียว (Single Document Lifecycle)

ทุกขั้นตอนตั้งแต่ต้นจนจบ จะใช้ **เอกสาร `GoodsIssue` (เช่น `GI-20260903-001`) เพียงใบเดียว** โดยสถานะจะค่อยๆ เดินหน้าไปตามด่าน:

```
[ เอกสารใบเดียว: GI-20260903-001 ]
      │
      ├─► 1. ตอนสร้างเอกสาร       ➔ สถานะ `draft` / `reserved`
      │
      ├─► 2. แผนกเดินหยิบ (Pick)  ➔ สแกนบาร์โค้ดใบเดิม ➔ สถานะ `picked` + บันทึก `pickedAt`
      │
      ├─► 3. แผนกแพ็คของ (Pack)  ➔ สแกนบาร์โค้ดใบเดิม ➔ สถานะ `packed` + บันทึก `packedAt`
      │
      ├─► 4. แผนกโหลดรถ (Load)   ➔ สแกนบาร์โค้ดใบเดิม ➔ สถานะ `staged_for_loading` + บันทึก `stagedAt`
      │
      └─► 5. ปล่อยรถส่งมอบ (Ship) ➔ สแกนบาร์โค้ดใบเดิม ➔ สถานะ `completed` + บันทึก `dispatchedAt`
```

---

## 🔄 4. ระบบสถานะสินค้า 3 ชั้น (3-Layer Inventory State Machine)

```
                               INVENTORY LIFECYCLE STATE MACHINE
                               
   ┌────────────┐   (Create SO/GI)   ┌────────────┐   (Scan Pick @ Bin)   ┌────────────┐
   │  IN_STOCK  │ ─────────────────► │  RESERVED  │ ────────────────────► │   PICKED   │
   │ (บนชั้นวาง) │                    │ (จองสต็อก) │   [หักยอด Bin ทันที]   │(อยู่บนรถเข็น)│
   └────────────┘                    └────────────┘                       └─────┬──────┘
         ▲                                                                      │
         │ (Cancel Order)                                        (Pack Station) │
         └────────────────────────────────────────────────────────┐             │
                                                                  │             ▼
   ┌────────────┐     (Final Ship)   ┌────────────┐   (Move to Dock)      ┌────────────┐
   │   EXITED   │ ◄───────────────── │   LOADED   │ ◄──────────────── │   PACKED   │
   │(ออกจากคลัง)│                    │(ลานพักท่ารถ)│                       │(แพ็คใส่กล่อง)│
   └────────────┘                    └────────────┘                       └────────────┘
```

| ขั้นตอน (Step) | Layer 1: สถานะเอกสาร (`GoodsIssue.status`) | Layer 2: สต็อกบนชั้นวาง (`StockBalance`) | Layer 3: แท็กรายชิ้น (`Tag.currentStatus`) | กิจกรรมที่พนักงานสแกนบาร์โค้ดหน้างาน |
|---|---|---|---|---|
| **0. สินค้าพร้อมใช้งาน** | - | `quantity: 100`, `allocated: 0`<br>*(Available: 100)* | `in_stock` (บนชั้นวาง) | สินค้าอยู่บนชั้นวางตามปกติ |
| **1. เปิดใบเบิก / Order เข้า** | `draft` / `reserved` | `quantity: 100`, `allocated: 20`<br>*(Available: 80)* | `reserved` (ติดจอง) | จองสต็อกล่วงหน้า ป้องกันการขายซ้ำ |
| **2. สแกน Pick ที่ชั้นวาง ⚡** | `picking` ➔ `picked` | **`quantity: 80`**, **`allocated: 0`** | `picked` (อยู่บนรถเข็น) | **ยิงบาร์โค้ด Bin + สินค้า ➔ หักยอดบนชั้นวางทันที Real-time!** |
| **3. ตรวจนับ & แพ็คกล่อง** | `packing` ➔ `packed` | `quantity: 80` (ไม่เปลี่ยน) | `packed` (ในกล่องพัสดุ) | ยิงบาร์โค้ดสินค้าใส่กล่อง + พิมพ์ใบปะหน้าพัสดุ |
| **4. ย้ายเข้าลานพักท่ารถ** | `staged_for_loading` | `quantity: 80` (ไม่เปลี่ยน) | `staged` (หน้าท่าโหลด) | ยิงบาร์โค้ดกล่อง + บาร์โค้ดเสาท่าโหลดรถ |
| **5. รถขนส่งออก / ส่งมอบ** | **`completed`** | `quantity: 80` (ไม่เปลี่ยน) | **`exited`** (ออกจากคลังแล้ว) | ยิงบาร์โค้ดใบส่งของ (Delivery Note) ปิดงาน |

---

## 🛠️ 5. Action Items: สิ่งที่แต่ละทีมต้องทำ (Implementation Checklist)

### 👨‍💻 1. ฝั่ง Back-End (คุณไพโรจน์ & ทีม Back-End)
- [ ] **Database Migration:** ตรวจสอบ `backend/prisma/schema.prisma` ที่มี `OutboundWorkflowMode`, `GoodsIssueStatus` และรัน `prisma migrate dev`
- [ ] **Subscription Gating Guard:** เขียน Middleware ดักจับการยิง API:
  * บล็อคไม่ให้ Free Plan เรียก Endpoint `/pack` หรือ `/stage-load` (ตอบกลับ `403 Forbidden`)
  * บล็อคไม่ให้ Pro Plan เรียก Endpoint `/stage-load` (ตอบกลับ `403 Forbidden`)
- [ ] **Real-Time Stock Deduction Engine:** เขียน Logic ใน `POST /goods-issues/:id/pick`:
  * ใช้ `prisma.$transaction` หักลด `StockBalance.quantity` บนชั้นวาง Bin นั้นทันที Real-time
  * อัปเดต `GoodsIssueLine.pickedQuantity`
- [ ] **API Endpoints Implementation:** พัฒนาและเชื่อมต่อ Controller ตาม `docs/openapi.yaml`:
  * `POST /api/v1/goods-issues` (สร้างเอกสาร + จองสต็อก)
  * `POST /api/v1/goods-issues/:id/pick` (บันทึกการหยิบ)
  * `POST /api/v1/goods-issues/:id/pack` (บันทึกการแพ็คกล่อง + ขนส่ง)
  * `POST /api/v1/goods-issues/:id/stage-load` (บันทึกลานโหลด - Ultra)
  * `POST /api/v1/goods-issues/:id/dispatch` (ส่งมอบออกคลัง)

---

### 🎨 2. ฝั่ง Front-End (คุณธนทัต & ทีม Front-End)
- [ ] **Warehouse Settings UI:**
  * เพิ่มเมนูเลือกโหมดการเบิกสินค้าในหน้าแก้ไขคลังสินค้า (`Outbound Mode Switcher`)
  * แสดง Badge สิทธิ์แพ็กเกจ (🔒 Pro / 🔒 Ultra) และเชื่อมต่อกับ `UpgradePromptModal` เมื่อคลิกตัวเลือกที่ต้องอัปเกรด
- [ ] **Barcode Fast-Keystroke Scanner Listener:**
  * ฝังระบบตรวจจับการยิงบาร์โค้ดอัตโนมัติในทุกหน้าจอ (พนักงานยิงปืนสแกนเนอร์แล้วส่งข้อมูลทันทีโดยไม่ต้องคลิกเมาส์ในช่อง)
- [ ] **Dynamic Outbound Screens:**
  * **Pick Screen:** หน้าจอนำทางเดินหยิบของ แสดงพิกัด `Zone ➔ Rack ➔ Shelf` พร้อมแถบ Progress Bar (เช่น `5/10 ชิ้น`) มีเสียง Beep และแสงกะพริบเขียวเมื่อสแกนถูกต้อง
  * **Packing Station:** หน้าจอตรวจนับสินค้าลงกล่องพัสดุ บันทึกน้ำหนัก และปุ่มสั่งพิมพ์ใบปะหน้าขนส่ง (Print Shipping Label)
  * **Loading Dock & Dispatch:** หน้าจอยืนยันการโหลดขึ้นรถและปิดงาน
- [ ] **Service Integration:** เรียกใช้งาน `transactionService.pickStock`, `packStock`, `stageLoadStock`, `dispatchStock` ที่เตรียมไว้ใน `frontend/src/services/transaction.service.ts`

---

### 🧪 3. ฝั่ง QA & System Tester
- [ ] **ทดสอบ Subscription Gating:** 
  * ทดสอบสร้าง Tenant บน Free, Pro, Ultra และตรวจสอบว่าโหมดถูกล็อค/ปลดล็อคตามสัญญาถูกต้อง 100%
- [ ] **ทดสอบความแม่นยำของสต็อก Real-Time:** 
  * ทำการยิงสแกน Pick สินค้าจาก Bin A ➔ แล้วเปิดดูหน้า `Stock Balances` ทันทีเพื่อยืนยันว่ายอดบนชั้นวางถูกหักลดลง ณ วินาทีนั้นทันที
- [ ] **ทดสอบ Single Document Lifecycle:** 
  * ยิงสแกนตั้งแต่ด่าน Pick ➔ Pack ➔ Load ➔ Ship โดยใช้เลขที่ใบเบิก `GI-XXXX` ใบเดิมตลอดทั้งกระบวนการ
