# 📐 MatchStock - System Architecture & Data Flow Specification (SA Document)

เอกสารวิเคราะห์และออกแบบระบบ (System Analysis & Design) จัดทำโดย **SA (System Analyst)**
สำหรับให้อ้างอิงการพัฒนา **Front-End (React)**, **Back-End (Node.js + Prisma)** และ **QA Testing**

---

## 🧭 1. ภาพรวมสถาปัตยกรรม (System Context)

```mermaid
graph TD
    Client["Front-End Client<br>(React on Firebase)"]
    API["Back-End API<br>(Node.js on Cloud Run)"]
    AuthMW["Auth & Tenant Middleware"]
    StockEngine["Core Inventory Engine<br>(Prisma Transactions)"]
    DB[("PostgreSQL DB<br>(Supabase / Cloud SQL)")]

    Client -->|HTTPS + JWT Bearer| API
    API --> AuthMW
    AuthMW -->|Inject tenant_id & user| StockEngine
    StockEngine -->|Isolated Prisma Queries| DB
```

---

## 🔐 2. Authentication & Tenant Resolution Flow

กระบวนการ Login และการดึงสิทธิ์ Feature Flags ของ Subscription เพื่อคุมเมนูบนหน้าจอ:

```mermaid
sequenceDiagram
    autonumber
    actor User as ผู้ใช้งาน (User)
    participant FE as Front-End (React)
    participant BE as Back-End (Node.js)
    participant DB as PostgreSQL (Prisma)

    User->>FE: กรอก Email + Password
    FE->>BE: POST /api/v1/auth/login
    BE->>DB: ค้นหา User ตาม Email + ดึง Tenant & Subscription Plan
    alt รหัสผ่านถูกต้อง & Tenant Active
        BE->>FE: ตอบกลับ 200 OK<br>{ token (JWT), user, tenant, subscription.features }
        FE->>FE: บันทึก Token ลง Storage & เก็บ Features ใน Zustand State
        FE->>User: เปิดหน้า Dashboard แสดงเฉพาะเมนูที่ Plan ได้รับอนุญาต
    else รหัสผ่านผิด หรือ Subscription หมดอายุ
        BE->>FE: ตอบกลับ 401 Unauthorized / 403 Forbidden
        FE->>User: แสดง Error Alert
    end
```

---

## 📦 3. Data Flow: Goods Receive (GR - บันทึกรับสินค้าเข้าคลัง)

เมื่อมีการรับสินค้าเข้าคลัง จะเกิดการสร้าง **Transaction Item**, สร้าง **Lot Number** (ถ้าเป็นสินค้า Lot Control) และอัปเดตยอดใน **`inventory_balances`**:

```mermaid
sequenceDiagram
    autonumber
    actor Staff as เจ้าหน้าที่คลัง (Staff)
    participant FE as Front-End (React)
    participant BE as Back-End (Node.js)
    participant DB as PostgreSQL (Prisma $transaction)

    Staff->>FE: กรอกฟอร์มรับสินค้า (เลือกคลัง, Bin, สินค้า, จำนวน, Lot, วันหมดอายุ)
    FE->>BE: POST /api/v1/inventory/transactions/receive
    Note over BE: เริ่มต้น Database Transaction ($transaction)
    BE->>DB: 1. สร้าง Record ใน `stock_transactions` (Document No: GR-xxxxx)
    BE->>DB: 2. ตรวจสอบ/สร้าง `product_lots` (บันทึก MFD, EXP date)
    BE->>DB: 3. สร้าง `stock_transaction_items`
    BE->>DB: 4. Upsert ยอดใน `inventory_balances` (quantity_on_hand += Qty)
    Note over BE: บันทึก Transaction สำเร็จ (Commit)
    BE->>FE: ตอบกลับ 201 Created (คืนค่า Document No)
    FE->>Staff: แสดงผลสำเร็จ + อัปเดตยอดคงเหลือ Real-time บนหน้าจอ
```

---

## 📤 4. Data Flow: Goods Issue (GI - จ่ายสินค้าออกด้วย FIFO Logic)

การตัดสต็อกสินค้าตามลำดับวันหมดอายุ (`expiration_date`) เก่าสุดก่อน:

```mermaid
sequenceDiagram
    autonumber
    actor Staff as เจ้าหน้าที่เบิกจ่าย
    participant FE as Front-End (React)
    participant BE as Back-End (Node.js)
    participant DB as PostgreSQL (Prisma)

    Staff->>FE: ระบุสินค้าและจำนวนที่ต้องการเบิกจ่าย
    FE->>BE: GET /api/v1/inventory/balances/fifo-suggest?productId=xxx&qty=10
    BE->>DB: ค้นหา Balances เรียงตาม `expiration_date ASC` (Lot หมดอายุก่อน)
    BE->>FE: คืนค่ารายการ Lot และ Bin ที่แนะนำให้ไปหยิบ
    Staff->>FE: กดยืนยันการเบิกจ่าย
    FE->>BE: POST /api/v1/inventory/transactions/issue
    Note over BE: ล็อก Row ด้วย SELECT FOR UPDATE เพื่อกัน Race Condition
    BE->>DB: ตัดยอดใน `inventory_balances` (quantity_on_hand -= Qty)
    BE->>DB: บันทึก `stock_transactions` (GI-xxxxx)
    BE->>FE: ตอบกลับ 200 OK (ตัดสต็อกเรียบร้อย)
```

---

## 📊 5. Standard Response Format มาตรฐานเดียวกันทั้งระบบ

ทุก Endpoint ในระบบ MatchStock จะคืนค่าใน Format เดียวกันเสมอ:

### กรณีสำเร็จ (Success 200/201):
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "totalCount": 105,
    "totalPages": 6
  }
}
```

### กรณีผิดพลาด (Error 400/401/403/404/500):
```json
{
  "success": false,
  "message": "Validation failed / Unauthorized / Not found",
  "errors": [
    "Product code already exists in this tenant",
    "Price cannot be negative"
  ]
}
```
