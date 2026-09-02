# MatchStock — Master Data Quality Assurance & Test Plan

เอกสารแผนการทดสอบระบบ (QA Test Plan & Checklists) สำหรับเมนู **Master Data (ข้อมูลหลัก)** ทั้งหมดในระบบ MatchStock WMS & Inventory Management Platform

---

## 🎯 1. วัตถุประสงค์และขอบเขตการทดสอบ (Objectives & Scope)

การทดสอบในหมวด Master Data มีเป้าหมายเพื่อยืนยันความถูกต้องของ:
1. **CRUD & Form Validation**: ความถูกต้องในการกรอกข้อมูล ฟิลด์บังคับ และการแจ้งเตือน Error
2. **Business Constraints**: การป้องกันรหัสซ้ำ (`Unique per tenant`), ความสัมพันธ์ข้อมูล (FK integrity)
3. **Multi-Tenancy Isolation**: การแบ่งแยกข้อมูลระหว่าง Tenant เด็ดขาด ไม่รั่วไหล
4. **Subscription Quotas**: การจำกัดจำนวนตามสิทธิ์ของแพ็กเกจ (Free, Pro, Ultra)
5. **Soft-Delete Behavior**: ข้อมูลที่ถูกลบต้องคงอยู่ในฐานข้อมูล (`isDeleted: true`) แต่ไม่แสดงในหน้ารายการปกติ

---

## 📋 2. แผนการทดสอบรายโมดูล (Module Test Checklists)

### 📦 2.1 รายการสินค้า (Products & Catalog)
> **Route / Endpoint**: `/products`, `POST/GET/PATCH/DELETE /api/v1/products`

- [ ] **PRD-01 (Create Full)**: สร้างสินค้าใหม่พร้อมข้อมูลครบถ้วน (Code, SKU, Name, Unit, Category, Brand, Supplier, Tax Type, Selling/Cost Price, Dimensions, Weight) -> บันทึกสำเร็จ
- [ ] **PRD-02 (Required Fields)**: เว้นว่างช่อง SKU, Code, หรือ Name แล้วกดบันทึก -> แสดง Error แจ้งเตือนใต้ช่องที่เว้นว่าง
- [ ] **PRD-03 (Duplicate SKU/Code)**: กรอก SKU หรือ Code ที่มีอยู่แล้วใน Tenant เดิม -> แจ้งเตือน *"SKU/Code นี้มีอยู่ในระบบแล้ว"* (HTTP 409)
- [ ] **PRD-04 (Image Upload)**: แนบไฟล์รูปภาพสินค้า (.jpg/.png ขนาด < 5MB) และเลือกรูปภาพหลัก -> แสดงรูปภาพในหน้าตารางและหน้ารายละเอียดถูกต้อง
- [ ] **PRD-05 (Lot Control Flag)**: ติ๊กเปิด *"Lot Controlled"* (`lotControlled: true`) -> บันทึกสำเร็จ และระบบอนุญาตให้ระบุ Lot No. / Expiry Date ในตอนรับสินค้า (GR)
- [ ] **PRD-06 (Reorder Point Alert)**: กำหนด `reorderPoint` และ `minReorderQuantity` -> ค่าถูกบันทึกถูกต้องสำหรับระบบแจ้งเตือนสินค้าใกล้หมด
- [ ] **PRD-07 (Soft Delete)**: กดลบสินค้า -> สินค้าเปลี่ยนสถานะเป็น `isDeleted: true` และไม่แสดงในหน้ารายการสินค้าทั่วไป
- [ ] **PRD-08 (Quota Limit)**: Tenant Plan Free สร้างสินค้าชิ้นที่ 501 (โควตา 500) -> ระบบแสดงแจ้งเตือน `403 QUOTA_EXCEEDED` แนะนำให้อัปเกรด

---

### 🏭 2.2 คลังสินค้าและตำแหน่งจัดเก็บ (Warehouses & Bin Locations)
> **Route / Endpoint**: `/warehouses`, `POST/GET/PATCH/DELETE /api/v1/warehouses`

- [ ] **WH-01 (Create Warehouse)**: สร้างคลังสินค้าใหม่ (Code: `WH-01`, Name, Address, Max Capacity) -> บันทึกสำเร็จ
- [ ] **WH-02 (Company Scoping)**: เลือกระบุ `companyId` ผูกกับสาขา หรือเว้นว่างเป็น *"คลังกลาง"* -> บันทึกสำเร็จและแสดงเฉพาะผู้ใช้ที่มีสิทธิ์
- [ ] **WH-03 (Duplicate Code)**: สร้างคลังสินค้าด้วย Code ซ้ำใน Tenant เดียวกัน -> ระบบปฏิเสธพร้อมแจ้งเตือนรหัสซ้ำ
- [ ] **WH-04 (Create Bin Locations)**: เพิ่มตำแหน่งจัดเก็บย่อยใต้คลัง (เช่น `A-01-01`, `A-01-02`) -> Bin ถูกสร้างใต้คลังที่เลือกถูกต้อง
- [ ] **WH-05 (Duplicate Bin Code)**: สร้าง Bin Code ซ้ำในคลังเดียวกัน -> ระบบแจ้งเตือนห้ามซ้ำ
- [ ] **WH-06 (Quota Limit)**: Tenant Plan Free สร้างคลังสินค้าแห่งที่ 2 (โควตา 1 คลัง) -> ระบบแสดงแจ้งเตือน `403 QUOTA_EXCEEDED`
- [ ] **WH-07 (Delete Protection)**: ลบคลังสินค้าที่มีสต็อกคงค้างอยู่ (`quantity_on_hand > 0`) -> ระบบบล็อกการลบเพื่อป้องกันข้อมูลผิดพลาด

---

### 🏢 2.3 บริษัทและสาขา (Companies & Branches)
> **Route / Endpoint**: `/companies`, `POST/GET/PATCH/DELETE /api/v1/companies`

- [ ] **COMP-01 (Create Headquarter)**: สร้างสำนักงานใหญ่ (Tax ID 13 หลัก, Branch Code `00000`, ติ๊ก `isHeadquarter: true`) -> บันทึกสำเร็จ
- [ ] **COMP-02 (Tax ID Validation)**: กรอก Tax ID ไม่ครบ 13 หลัก หรือมีตัวอักษร -> ฟอร์มแจ้งเตือนความถูกต้องทันที
- [ ] **COMP-03 (Create Branch)**: สร้างสาขาย่อย (Branch Code `0001`, Branch Name *"สาขาบางนา"*) -> บันทึกสำเร็จ
- [ ] **COMP-04 (Headquarter Single Rule)**: ติ๊กสาขาใหม่เป็นสำนักงานใหญ่ -> ระบบสลับสถานะสำนักงานใหญ่ให้อัตโนมัติ หรือแจ้งเตือน
- [ ] **COMP-05 (Soft Delete Branch)**: ลบสาขา -> สาขาถูกทำ Soft Delete (`deletedAt` มีค่าจริง)

---

### 📏 2.4 หน่วยนับสินค้า (Units of Measure - UOM)
> **Route / Endpoint**: `/units`, `POST/GET/PATCH/DELETE /api/v1/units`

- [ ] **UNT-01 (Quantity UOM)**: สร้างหน่วยนับจำนวน (Code: `PCS`, Name: *"ชิ้น"*, Type: `quantity`) -> นำไปเลือกเป็น Base Unit ในหน้าสินค้าได้
- [ ] **UNT-02 (Dimension & Weight UOM)**: สร้างหน่วยวัดมิติ (Code: `CM`, Type: `dimension`) และหน่วยน้ำหนัก (Code: `KG`, Type: `weight`) -> แสดงใน Dropdown มิติ/น้ำหนักถูกต้อง
- [ ] **UNT-03 (Duplicate Code)**: สร้างหน่วยนับรหัส `PCS` ซ้ำใน Tenant เดียวกัน -> ระบบแจ้งเตือนรหัสซ้ำ
- [ ] **UNT-04 (Delete Integrity)**: ลบหน่วยนับที่ถูกผูกกับสินค้าอยู่ -> ระบบปฏิเสธการลบ (Foreign Key Restrict)

---

### 🚚 2.5 ซัพพลายเออร์และผู้ผลิต (Suppliers & Manufacturers)
> **Route / Endpoint**: `/suppliers`, `/manufacturers`

- [ ] **SUP-01 (External Supplier)**: สร้างซัพพลายเออร์ภายนอก (Code: `SUP-001`, Name, Contact Person, Phone, Email) -> บันทึกสำเร็จ
- [ ] **SUP-02 (Inter-company Supplier)**: เลือกระบุ `companyId` ผูกกับบริษัทย่อยในเครือ -> บันทึกสำเร็จสำหรับงานโอนสินค้าระหว่างบริษัท
- [ ] **SUP-03 (Email/Phone Validation)**: กรอก Email ไม่ถูกต้องตามรูปแบบ (เช่น `test@`) -> ฟอร์มแจ้งเตือน Error
- [ ] **MFG-01 (Create Manufacturer)**: สร้างผู้ผลิต (Code: `MFG-01`, Name, Contact) -> นำไปเลือกในฟอร์มสินค้าได้

---

### 🏷️ 2.6 หมวดหมู่, ยี่ห้อ, และภาษี (Categories, Brands & Tax Types)
> **Route / Endpoint**: `/categories`, `/brands`, `/tax-types`, `/barcode-symbologies`

- [ ] **CAT-01 (Create Category)**: สร้างหมวดหมู่สินค้า (Code: `ELEC`, Name: *"เครื่องใช้ไฟฟ้า"*) -> แสดงในตัวกรองหน้าสินค้า
- [ ] **BRD-01 (Create Brand)**: สร้างยี่ห้อสินค้า (Code: `LOGI`, Name: *"Logitech"*) -> แสดงใน Dropdown ยี่ห้อ
- [ ] **TAX-01 (Create VAT Type)**: สร้างประเภทภาษี (Code: `VAT_7`, Rate: `7%`, `isInclusive: false`) -> บันทึกสำเร็จ
- [ ] **SYM-01 (Barcode Symbologies)**: ตรวจสอบรายการมาตรฐานบาร์โค้ดสากล (`CODE128`, `EAN13`, `QR_CODE`) -> แสดงครบถ้วนในระบบ

---

## 🔒 3. Cross-Cutting & Security Scenarios

- [ ] **SEC-01 (Tenant Isolation)**: Login ด้วย User Tenant A สร้างสินค้า `SKU-A` จากนั้น Login ด้วย User Tenant B -> User Tenant B ต้องมองไม่เห็น `SKU-A`
- [ ] **SEC-02 (RBAC Permission)**: Login ด้วย User Role `operator` -> ปุ่ม *"สร้าง / แก้ไข / ลบ"* ในเมนู Master Data ต้องถูกซ่อนหรือ Disabled
- [ ] **SEC-03 (Search & Filter)**: ค้นหาสินค้าด้วย Barcode, SKU, หรือ Name -> ผลลัพธ์แสดงตรงตามคำค้นหาทันที
- [ ] **SEC-04 (Pagination)**: ข้อมูลมากกว่า 10 รายการ -> แสดงปุ่มเปลี่ยนหน้า (Pagination 10/25/50) ถูกต้อง

---

## 🎫 4. GitHub Issue Template (สำหรับคัดลอกไปสร้าง Issue ใน GitHub)

ทีมงานสามารถคัดลอกส่วนด้านล่างนี้ไปเปิดเป็น Issue ใน GitHub เพื่อให้ Tester ใช้เมาส์คลิกติ๊กถูก `[x]` ได้แบบ Real-time:

```markdown
### 📋 QA Test Execution: Master Data Verification

**Tester**: @username
**Environment**: Staging (https://match-stock.ddns.net)
**Date**: YYYY-MM-DD

#### 📦 Products & SKUs
- [ ] PRD-01: สร้างสินค้าใหม่สำเร็จ (ข้อมูลครบถ้วน)
- [ ] PRD-02: ตรวจสอบฟิลด์บังคับ (Required fields)
- [ ] PRD-03: ป้องกัน SKU / Code ซ้ำใน Tenant
- [ ] PRD-04: อัปโหลดรูปภาพสินค้า & เลือกรูปหลัก
- [ ] PRD-05: เปิดใช้ Lot Controlled (`lotControlled: true`)
- [ ] PRD-06: ตั้งค่า Reorder Point & Min Reorder Qty
- [ ] PRD-07: การลบสินค้าแบบ Soft Delete (`isDeleted: true`)
- [ ] PRD-08: ตรวจสอบ Quota สินค้าตาม Plan (Free plan <= 500 SKUs)

#### 🏭 Warehouses & Bin Locations
- [ ] WH-01: สร้างคลังสินค้าใหม่สำเร็จ
- [ ] WH-02: ผูกคลังกับบริษัทย่อย (`companyId`)
- [ ] WH-03: ป้องกันรหัสคลังซ้ำ
- [ ] WH-04: สร้างตำแหน่งจัดเก็บย่อย (Bin Locations)
- [ ] WH-05: ป้องกัน Bin Code ซ้ำในคลังเดียวกัน
- [ ] WH-06: ตรวจสอบ Quota คลังสินค้าตาม Plan (Free plan <= 1 คลัง)
- [ ] WH-07: ป้องกันการลบคลังที่มีสต็อกคงค้าง

#### 🏢 Companies & Branches
- [ ] COMP-01: สร้างสำนักงานใหญ่ (Branch `00000`)
- [ ] COMP-02: ตรวจสอบ Tax ID 13 หลัก
- [ ] COMP-03: สร้างสาขาย่อย
- [ ] COMP-04: กฎการมีสำนักงานใหญ่เพียงแห่งเดียว
- [ ] COMP-05: การลบสาขาแบบ Soft Delete

#### 📏 Units, Suppliers & Others
- [ ] UNT-01: สร้างหน่วยนับ Quantity, Dimension, Weight
- [ ] UNT-04: ป้องกันลบหน่วยนับที่มีสินค้าผูกอยู่
- [ ] SUP-01: สร้างซัพพลายเออร์ภายนอก & ในเครือ
- [ ] CAT-01: สร้างหมวดหมู่ & ยี่ห้อสินค้า
- [ ] TAX-01: ตั้งค่าอัตราภาษี 7% / 0%
- [ ] SEC-01: ตรวจสอบการแยกข้อมูล Multi-tenancy
```
