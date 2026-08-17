# 🎯 MatchStock - Sprint 1 Task Tickets Backlog

เอกสารรวมรายละเอียด Ticket ของ **Sprint 1 (ระยะเวลา 2 สัปดาห์)**
สำหรับให้ **PM (@Arthy001)** นำไปสร้างบน [GitHub Issues](https://github.com/Arthy001/MatchStock/issues) หรือ [GitHub Projects](https://github.com/Arthy001/MatchStock/projects) ได้ทันที

---

## 🎟️ Ticket 1: [BE-01] Database Migration & Seeder Implementation
* **ประเภท:** Feature / Task
* **ผู้รับผิดชอบ (Assignee):** `pairot.buabmee@gmail.com` (คุณไพโรจน์ - Back-End)
* **Branch ที่แนะนำ:** `feature/be-01-prisma-db-setup`
* **รายละเอียด (Description):**
  เชื่อมต่อ PostgreSQL บน Supabase และรัน Prisma Migration เพื่อสร้างโครงสร้างตาราง 18+ ตาราง พร้อมรัน Seed Data สำหรับทดสอบระบบ
* **Acceptance Criteria (AC):**
  - [ ] เชื่อมต่อ `DATABASE_URL` และ `DIRECT_URL` ของ Supabase ใน `.env` สำเร็จ
  - [ ] รัน `npx prisma migrate dev --name init_schema` ผ่าน 100% ไม่มี Error
  - [ ] รัน `npx prisma db seed` เพื่อสร้างข้อมูลเริ่มต้น (Plans, 4 Users, Warehouses, Bins, Products, Initial Balances) สำเร็จ
  - [ ] สามารถเปิด GUI ดูและแก้ไขข้อมูลผ่าน `npx prisma studio` ได้ที่พอร์ต `5555`

---

## 🎟️ Ticket 2: [BE-02] JWT Authentication & Multi-Tenant Guard Middleware
* **ประเภท:** Feature / Task
* **ผู้รับผิดชอบ (Assignee):** `pairot.buabmee@gmail.com` (คุณไพโรจน์ - Back-End)
* **Branch ที่แนะนำ:** `feature/be-02-auth-tenant-middleware`
* **รายละเอียด (Description):**
  พัฒนาระบบ Login และ Guard Middleware สำหรับความปลอดภัยระดับ Multi-tenant
* **Acceptance Criteria (AC):**
  - [ ] Endpoint `POST /api/v1/auth/login` รับ email + password และตรวจสอบรหัสผ่านด้วย `bcrypt`
  - [ ] คืนค่า JWT Token ที่มี Payload: `{ userId, tenantId, role }`
  - [ ] คืนค่า Object `subscription.features` เพื่อให้ Front-End นำไปใช้ซ่อน/แสดงเมนู
  - [ ] Endpoint `GET /api/v1/auth/me` คืนค่าโปรไฟล์ผู้ใช้งานปัจจุบัน
  - [ ] มี `requireTenant` middleware บังคับสกัด `tenant_id` จาก Token และตอบ 401 ถ้าไม่มี Tenant Context

---

## 🎟️ Ticket 3: [BE-03] Master Data CRUD APIs (Products, Warehouses, Bins)
* **ประเภท:** Feature / Task
* **ผู้รับผิดชอบ (Assignee):** `pairot.buabmee@gmail.com` (คุณไพโรจน์ - Back-End)
* **Branch ที่แนะนำ:** `feature/be-03-masterdata-apis`
* **รายละเอียด (Description):**
  พัฒนา RESTful CRUD APIs สำหรับจัดการข้อมูล Master Data ตามสเปคใน `docs/openapi.yaml`
* **Acceptance Criteria (AC):**
  - [ ] `GET /api/v1/products` (รองรับ Pagination, ค้นหาตาม SKU/Barcode/Name, Filter หมวดหมู่)
  - [ ] `POST /api/v1/products` (สร้างสินค้า บันทึกมิติขนาด กว้างxยาวxสูง, น้ำหนัก, Reorder Point, Lot Control flag)
  - [ ] `GET /api/v1/warehouses` และ `GET /api/v1/warehouses/:id/bins`
  - [ ] `POST /api/v1/warehouses` และ `POST /api/v1/warehouses/:id/bins`
  - [ ] มีการ Validate Request Body ด้วย `Zod`
  - [ ] ทุก Prisma Query ต้องมี Filter `{ where: { tenantId } }` เสมอ

---

## 🎟️ Ticket 4: [FE-01] Authentication Screen & Role-Based Dashboard Layout
* **ประเภท:** Feature / Task
* **ผู้รับผิดชอบ (Assignee):** `Thanathat.kj@gmail.com` (คุณธนทัต - Front-End)
* **Branch ที่แนะนำ:** `feature/fe-01-auth-dashboard-layout`
* **รายละเอียด (Description):**
  พัฒนาหน้า Login และโครงหน้าจอ Dashboard สวยงาม รองรับการแสดงเมนูตาม Role และ Feature Flags
* **Acceptance Criteria (AC):**
  - [ ] หน้าจอ Login สวยงาม responsive รองรับการกรอก Email/Password พร้อม Form Validation
  - [ ] เมื่อ Login สำเร็จ ให้บันทึก JWT Token ลง State / Storage และ Redirect ไปหน้า Dashboard
  - [ ] Top Navbar แสดงชื่อผู้ใช้งาน, Role Badge และชื่อ Tenant ปัจจุบัน
  - [ ] Sidebar Menu ปรับเปลี่ยนแบบ Dynamic ตาม Feature Flags ใน `subscription.features`
  - [ ] มีระบบ Logout และ Route Guard ป้องกันไม่ให้เข้าหน้าภายในถ้ายังไม่ได้ Login

---

## 🎟️ Ticket 5: [FE-02] Master Data Management Screens (Products, Warehouses, Bins)
* **ประเภท:** Feature / Task
* **ผู้รับผิดชอบ (Assignee):** `Thanathat.kj@gmail.com` (คุณธนทัต - Front-End)
* **Branch ที่แนะนำ:** `feature/fe-02-masterdata-ui`
* **รายละเอียด (Description):**
  พัฒนาหน้าจอสำหรับดูรายการและจัดการข้อมูลสินค้า คลังสินค้า และตำแหน่ง Bin
* **Acceptance Criteria (AC):**
  - [ ] หน้าตารางสินค้า (Product List) แสดง Code, SKU, Barcode, ชื่อสินค้า, ราคา, หน่วยนับ, สถานะสต็อก
  - [ ] มีช่อง Search ค้นหาสินค้าแบบ Real-time และมีระบบ Pagination
  - [ ] ฟอร์มเพิ่ม/แก้ไข สินค้า (Modal หรือ Page) รองรับการกรอกข้อมูลมิติขนาด (cm), น้ำหนัก (kg), Reorder Point
  - [ ] หน้าจัดการคลังสินค้า (Warehouse List) และดูรายการ Bins ภายใต้คลังสินค้านั้นๆ
  - [ ] มี Loading Skeletons และ Toast Alerts แจ้งเตือนเมื่อบันทึกข้อมูลสำเร็จ/ผิดพลาด

---

## 🎟️ Ticket 6: [QA-01] Master Test Plan, RBAC & Multi-Tenant Security Tests
* **ประเภท:** QA / Testing
* **ผู้รับผิดชอบ (Assignee):** `dechasitbird@gmail.com` (คุณเดชสิทธิ์ - QA / Tester)
* **Branch ที่แนะนำ:** `test/qa-01-sprint1-testsuites`
* **รายละเอียด (Description):**
  จัดทำ Test Cases และทดสอบความถูกต้อง ความปลอดภัยของระบบใน Sprint 1
* **Acceptance Criteria (AC):**
  - [ ] จัดทำเอกสาร Test Cases ครอบคลุม Auth, Master Data CRUD, และ Form Validation
  - [ ] **Multi-Tenant Security Test:** ทดสอบยิง API หรือเข้าหน้าเว็บข้าม Tenant ต้องไม่สามารถอ่านหรือแก้ข้อมูลของ Tenant อื่นได้ 100%
  - [ ] **RBAC Permission Test:** ทดสอบล็อกอินด้วย Users ทั้ง 4 บทบาท (Admin, Manager, Staff, Purchaser) เมนูและการเข้าถึงต้องถูกต้องตามสิทธิ์
  - [ ] ทดสอบ Boundary & Negative Cases (ราคาติดลบ, SKU ซ้ำ, ข้อมูลไม่ครบ)
  - [ ] สร้าง Postman Collection สำหรับรัน API Regression Test
  - [ ] ส่งมอบ QA Sign-off Report เมื่อผลการทดสอบผ่านเกณฑ์ครบถ้วน
