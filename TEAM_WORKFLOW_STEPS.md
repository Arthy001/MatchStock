# 🚀 MatchStock - Team Step-by-Step Execution Guide
## คู่มือขั้นตอนการปฏิบัติงานทีละสเต็ปสำหรับสมาชิกทีมทั้ง 4 คน

คู่มือนี้สรุปขั้นตอน คำสั่ง และแนวทางการทำงานจริงสำหรับแต่ละบทบาท เพื่อให้เริ่มงานและทำงานร่วมกันได้อย่างราบรื่นผ่าน **GitHub**, **Firebase Hosting**, **Google Cloud Run**, **Prisma ORM** และ **PostgreSQL (Supabase)**

---

## 👥 รายชื่อและบทบาททีมงาน

| บทบาท | ผู้รับผิดชอบ (Email / GitHub) | พื้นที่รับผิดชอบ |
| :--- | :--- | :--- |
| **1. PM (Lead)** | **@Arthy001** (คุณ) | ภาพรวมโปรเจกต์, `PROJECT_PLAN.md`, `PM_PLAYBOOK.md`, คุม Sprint & Releases |
| **2. SA (System Analyst)** | **`dechasitbird@gmail.com`** (คุณเดชสิทธิ์) | `/docs/`, `docs/openapi.yaml`, `docs/API_AND_DATA_FLOWS.md`, ERD & Data Dictionary |
| **3. Back-End Developer** | **`pairot.buabmee@gmail.com`** (คุณไพโรจน์) | `/backend/`, `/backend/prisma/`, `Dockerfile` |
| **4. Front-End Developer** | **`Thanathat.kj@gmail.com`** (คุณธนทัต) | `/frontend/`, `firebase.json` |
| **5. QA / Tester** | *(QA Engineer)* | `/tests/`, Test Cases, Postman Testing |

---

## ⚙️ 1. สำหรับ คุณไพโรจน์ (Back-End Developer)

```
[ 1. Clone & แตก Branch ] ➔ [ 2. ตั้งค่า .env Supabase ] ➔ [ 3. รัน Prisma Migrate & Seed ] ➔ [ 4. พัฒนา API ] ➔ [ 5. เปิด PR เข้า develop ]
```

### 📋 ขั้นตอนการทำงานจริง:
1. **Clone โปรเจกต์ และแตก Branch ของตัวเอง:**
   ```bash
   git clone https://github.com/Arthy001/MatchStock.git
   cd MatchStock
   git checkout develop
   git pull origin develop
   git checkout -b feature/be-sprint1-auth-masterdata
   ```

2. **ตั้งค่า Environment & Install Dependencies:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # แก้ไข .env: ใส่ DATABASE_URL และ DIRECT_URL ของ Supabase
   ```

3. **รัน Migration สร้างตารางบน Supabase + เปิด Prisma Studio:**
   ```bash
   # รัน Migration สร้างตาราง 18+ ตารางขึ้น Supabase PostgreSQL
   npx prisma migrate dev --name init_schema

   # เปิดดูและจัดการข้อมูลผ่าน GUI Browser
   npx prisma studio
   ```

4. **ลงมือพัฒนา API (Sprint 1):**
   * ระบบ Authentication (JWT Login/Register) + `tenant.middleware.ts`
   * CRUD APIs สำหรับ Master Data (Products, Warehouses, Bins, Units, Categories, Brands, Suppliers)
   * รัน Local Server ด้วยคำสั่ง:
     ```bash
     npm run dev
     # API จะเปิดทำงานที่ http://localhost:8080
     ```

5. **Commit และเปิด Pull Request (PR):**
   ```bash
   git add .
   git commit -m "feat(be): complete auth and master data CRUD APIs"
   git push origin feature/be-sprint1-auth-masterdata
   ```
   * เข้าไปที่ [GitHub PR](https://github.com/Arthy001/MatchStock/pulls) ➔ กด **"New pull request"** ขอรวมเข้า Branch **`develop`**

---

## 🎨 2. สำหรับ คุณธนทัต (Front-End Developer)

```
[ 1. Clone & แตก Branch ] ➔ [ 2. npm install & npm run dev ] ➔ [ 3. พัฒนาหน้าจอ React ] ➔ [ 4. เชื่อมต่อ API ] ➔ [ 5. เปิด PR เข้า develop ]
```

### 📋 ขั้นตอนการทำงานจริง:
1. **Clone โปรเจกต์ และแตก Branch ของตัวเอง:**
   ```bash
   git clone https://github.com/Arthy001/MatchStock.git
   cd MatchStock
   git checkout develop
   git pull origin develop
   git checkout -b feature/fe-sprint1-ui-masterdata
   ```

2. **Install Dependencies & รัน Dev Server:**
   ```bash
   cd frontend
   npm install
   npm run dev
   # หน้าเว็บจะเปิดทำงานที่ http://localhost:5173
   ```

3. **ลงมือพัฒนาหน้าจอ React + Tailwind CSS (Sprint 1):**
   * หน้า **Login Screen** (เก็บ JWT Token ลง State/Storage)
   * หน้า **Dashboard Layout** (Sidebar ตามสิทธิ์ Role, Top Navbar แสดงชื่อผู้ใช้และ Tenant)
   * หน้า **Master Data Management**:
     * ตารางแสดงรายการสินค้า (Products) พร้อม Search, Filter, Pagination
     * ฟอร์มเพิ่ม/แก้ไข สินค้า (Code, SKU, Barcode, น้ำหนัก, มิติขนาด, Reorder Point)
     * หน้าจัดการคลังสินค้า (Warehouses) และตำแหน่งจัดเก็บ (Bins)

4. **Commit และเปิด Pull Request (PR):**
   ```bash
   git add .
   git commit -m "feat(fe): complete login and master data management screens"
   git push origin feature/fe-sprint1-ui-masterdata
   ```
   * เข้าไปที่ [GitHub PR](https://github.com/Arthy001/MatchStock/pulls) ➔ กด **"New pull request"** ขอรวมเข้า Branch **`develop`**

---

## 🧪 3. สำหรับ QA / Tester

```
[ 1. อ่าน Acceptance Criteria ] ➔ [ 2. เขียน Test Cases / Postman ] ➔ [ 3. ทดสอบบน Staging URL ] ➔ [ 4. รายงานบั๊ก / Sign-off ]
```

### 📋 ขั้นตอนการทำงานจริง:
1. **เตรียม Test Scenarios & Cases ตาม Acceptance Criteria ใน Sprint 1:**
   * สิทธิ์การใช้งาน (RBAC): Admin, Manager, Warehouse Staff เข้าถึงเมนูได้ถูกต้องตามสิทธิ์
   * **Multi-Tenant Security Testing:** ยิง API หรือเปิดหน้าเว็บข้าม Tenant ต้องไม่เห็นข้อมูลของ Tenant อื่นเด็ดขาด
   * Form Validation: ทดสอบกรอกข้อมูลผิดฟอร์แมต, ราคาติดลบ, SKU ซ้ำ
2. **ทดสอบบน Staging URL จริง:**
   * ทดสอบ Web UI บน **Firebase Hosting Staging URL**
   * ทดสอบ API บน **Google Cloud Run Staging URL**
3. **การแจ้งบั๊ก (Bug Report):**
   * บันทึกบั๊กลงใน GitHub Issues พร้อมระบุ:
     1. Steps to Reproduce (ขั้นตอนการทำให้เกิดบั๊ก)
     2. Expected Result (ผลที่ควรจะเป็น)
     3. Actual Result (ผลที่เกิดขึ้นจริง พร้อม Screenshot)

---

## 📐 4. สำหรับ คุณเดชสิทธิ์ (System Analyst - SA)

```
[ 1. วิเคราะห์ Requirements ] ➔ [ 2. เขียน API Spec ใน docs/openapi.yaml ] ➔ [ 3. วาด Data Flow & Sequence Diagrams ] ➔ [ 4. เคลียร์ Business Rules ]
```

### 📋 ขั้นตอนการทำงานจริง:
1. **ออกแบบและบำรุงรักษา API Specification (`docs/openapi.yaml`):**
   * กำหนด Request/Response schemas, Status Codes (`200`, `201`, `400`, `401`, `403`, `404`) ให้ Front-End และ Back-End ใช้ร่วมกัน
2. **ออกแบบ Data Flows & Sequence Diagrams (`docs/API_AND_DATA_FLOWS.md`):**
   * วิเคราะห์กระบวนการทำงานที่ซับซ้อน เช่น การตัดสต็อก FIFO, การตรวจนับ Cycle Count และคำนวณ Variance
3. **ตรวจสอบความสอดคล้องของ Database & Code:**
   * ตรวจสอบไฟล์ `backend/prisma/schema.prisma` ร่วมกับ Back-End ให้รองรับ Multi-tenancy และ Feature Flags ครบถ้วน
4. **เปิด PR เข้า `develop` เมื่อมีการอัปเดตเอกสารใน `/docs/`**

---

## 👔 5. สำหรับ คุณ @Arthy001 (Project Manager - PM)

```
[ 1. Daily Standup 15 นาที ] ➔ [ 2. รีวิว & Merge PR เข้า develop ] ➔ [ 3. ตรวจ Staging Auto-Deploy ] ➔ [ 4. Sign-off & Release to main ]
```

### 📋 ขั้นตอนการทำงานในแต่ละวัน:
1. **ทุกเช้า 10:00 น. (Daily Standup 15 นาที):**
   * สอบถามความคืบหน้าของทีม และช่วยเคลียร์ Blocker
2. **เมื่อลูกทีมเปิด Pull Request เข้า `develop`:**
   * ตรวจสอบว่าโค้ดไม่มี Conflict และฟังก์ชันครบถ้วน ➔ กด **Approve** และ **Merge pull request**
3. **ติดตามผลการ Deploy อัตโนมัติ:**
   * GitHub Actions จะ Build และ Deploy ขึ้น Firebase Staging และ Cloud Run Staging โดยอัตโนมัติ
   * แจ้งให้ QA เข้าไปทดสอบบน Staging URL ทันที
4. **วันศุกร์สิ้น Sprint (Release):**
   * ตรวจสอบรายงานผลการทดสอบจาก QA (QA Sign-off Report)
   * เมื่อผ่าน 100% ➔ **คุณกด Merge จาก `develop` เข้า `main` เพื่อ Release สู่ Production!**

---

## 🔒 กฎเหล็กประจำทีม (Golden Rules)
1. **ห้าม `git push` ตรงเข้า `main` และ `develop`:** ทุกคนต้องทำงานผ่าน Feature Branch และเปิด PR เสมอ
2. **ห้ามแก้ Database บน Supabase GUI ตรงๆ:** ทุกการเปลี่ยนแปลงต้องสร้างผ่าน `npx prisma migrate dev` เสมอ
3. **ทุก Prisma Query ต้องมี Filter `tenant_id`:** เพื่อป้องกันปัญหาข้อมูลรั่วไหลระหว่างองค์กร
