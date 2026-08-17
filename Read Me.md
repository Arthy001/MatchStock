## 📋 Key Features & System Modules

### 1. Master Data Management (การจัดการข้อมูลหลัก)
* **Tenant & User Access Control:** รองรับการใช้งานแบบ Multi-tenant พร้อมระบบกำหนดสิทธิ์การใช้งานตามบทบาท (RBAC)
  * Roles: `admin`, `manager`, `warehouse_staff`, `purchasing_staff`
* **Product Catalog & SKU:** จัดการข้อมูลสินค้าแบบละเอียด (Code, SKU, Slug, หมวดหมู่, ยี่ห้อ, ผู้ผลิต)
* **Units & Dimensions:** กำหนดหน่วยนับหลัก (UOM), น้ำหนัก (kg) และมิติกายภาพ (กว้าง x ยาว x สูง)
* **Barcode Support:** รองรับรหัสบาร์โค้ดสากลมาตรฐาน `CODE128`, `EAN13` และ `QR_CODE`
* **Multi-Warehouse & Bin Locations:** บริหารจัดการคลังสินค้าหลายแห่งพร้อมระบุตำแหน่งจัดเก็บย่อย (Bin Level)
* **Suppliers & Tax Masters:** จัดการฐานข้อมูลผู้จัดจำหน่าย (Suppliers), ประเภทภาษี และรูปแบบส่วนลด

### 2. Core Stock Transactions (ระบบรับ-จ่าย และโอนย้ายสต็อก)
* **Goods Receive (GR):** บันทึกการรับสินค้าเข้าคลัง ระบุหมายเลข Lot/Batch, วันผลิต และวันหมดอายุ
* **Goods Issue / Dispatch (GI):** บันทึกการเบิก/จ่ายสินค้าออกจากคลัง ตัดสต็อกตามตำแหน่ง Bin
* **Stock Transfer:** ระบบโอนย้ายสินค้าระหว่างคลัง (Inter-warehouse) หรือระหว่างตำแหน่งจัดเก็บ (Bin-to-Bin)
* **Stock Adjustment:** ระบบปรับปรุงจำนวนสต็อกสินค้า (ปรับเพิ่ม/ลดตามผลต่างจริงพร้อมระบุเหตุผล)

### 3. Stock Counting Status & Tracking (การติดตามและนับสต็อก)
* **Real-time Stock Balance:** ตรวจสอบยอดสินค้าคงเหลือสุทธิ (`quantity_on_hand`) และยอดที่ถูกจอง (`quantity_reserved`)
* **Batch / Lot & Expiry Tracking:** ระบบติดตามหมายเลข Lot/Batch และวันหมดอายุ ตัดสต็อกแบบ FIFO
* **Manual & Barcode Stock Count:** การตรวจนับสต็อกด้วยมือและการสแกนบาร์โค้ดผ่านอุปกรณ์ Handheld
* **Cycle Count System:** สร้างใบนับสต็อกตามรอบ คำนวณผลต่างยอดระบบกับยอดนับจริง (`variance_quantity`) อัตโนมัติ

### 4. Inventory Control & Smart Alerts (ระบบควบคุมและแจ้งเตือนอัจฉริยะ)
* **Re-order Point Alert:** แจ้งเตือนอัตโนมัติเมื่อสต็อกเหลือน้อยกว่าหรือเท่ากับจุดสั่งซื้อที่กำหนด
* **Min Reorder Quantity:** ระบบคำนวณปริมาณการสั่งซื้อขั้นต่ำอัตโนมัติเพื่อเติมสต็อกให้เหมาะสม
* **Expiration & Low Stock Warnings:** แจ้งเตือนล่วงหน้าสำหรับสินค้าใกล้หมดอายุและสินค้าขาดคลัง
* **Overstock Warning:** แจ้งเตือนเมื่อปริมาณสินค้าเกินความจุสูงสุดของพื้นที่จัดเก็บ

### 5. Standard Analytics & Reports (รายงานและการวิเคราะห์)
* **Stock Card Report:** รายงานประวัติเคลื่อนไหว (In/Out/Move) ของสินค้าแต่ละรายการอย่างละเอียด
* **Slow / Fast Moving Analysis:** รายงานวิเคราะห์อัตราการหมุนเวียนสินค้าเพื่อบริหารการจัดเก็บ
* **Stock Summary & Valuation:** รายงานสรุปภาพรวมปริมาณและมูลค่าสินค้าคงเหลือสำหรับบริหารจัดการ

### 6. System Security & Integration (ความปลอดภัยและการเชื่อมต่อ)
* **Multi-tenancy Isolation:** ระบบแยกฐานข้อมูลและการเข้าถึงข้อมูลของแต่ละองค์กรอย่างเด็ดขาดด้วย `tenant_id`
* **Import / Export Data:** รองรับการนำเข้า-ส่งออกข้อมูล Master Data และรายการ Transaction ผ่านไฟล์ Excel (.xlsx) และ CSV
* **API & Hardware Middleware:** รองรับการเชื่อมต่อเครื่องสแกน Barcode/RFID และมี REST API สำหรับระบบภายนอก