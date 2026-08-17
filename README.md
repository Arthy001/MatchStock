# 📦 MatchStock - Multi-Tenant WMS & Inventory System

ระบบบริหารจัดการคลังสินค้าอัจฉริยะแบบ Multi-Tenant (WMS & Inventory Management Platform) รองรับการบริหารจัดการสต็อกแบบเรียลไทม์, การตัดสต็อกตามลำดับวันหมดอายุ (FIFO), การตรวจนับสต็อก (Cycle Counting) พร้อมสแกนบาร์โค้ดผ่านกล้องมือถือ/Handheld, และระบบจำกัดสิทธิ์ฟีเจอร์ตามแพ็กเกจสมาชิก (Subscription Plans)

---

## 🛠️ Technology Stack & Architecture

```
+-----------------------------------------------------------------------+
|                           MATCHSTOCK SYSTEM                           |
+-----------------------------------------------------------------------+
       │                                                       │
       ▼                                                       ▼
┌─────────────────────────────┐                 ┌─────────────────────────────┐
│    Front-End (React + TS)   │                 │    Back-End (Node.js + TS)  │
│  - Vite / Tailwind CSS      │   HTTPS / REST  │  - Express / NestJS         │
│  - Barcode Camera Scanner   │◄───────────────►│  - Prisma ORM               │
│  - React Query + Zustand    │   (JWT Auth)    │  - Multi-stage Docker       │
│                             │                 │  - Swagger / OpenAPI 3.0    │
│  🔥 Firebase Hosting        │                 │  ☁️ Google Cloud Run        │
└─────────────────────────────┘                 └──────────────┬──────────────┘
                                                               │
                                                               │ Prisma Connection Pool
                                                               ▼
                                                ┌─────────────────────────────┐
                                                │    PostgreSQL Database      │
                                                │  ⚡ Current: Supabase (Dev) │
                                                │  🏢 Future:  Cloud SQL      │
                                                └─────────────────────────────┘
```

| ส่วนประกอบ (Layer) | เทคโนโลยีที่ใช้ (Tech Stack) | สภาพแวดล้อม / Hosting |
| :--- | :--- | :--- |
| **Frontend** | React (Vite + TypeScript), Tailwind CSS, React Query, Zustand, Html5-qrcode | **Firebase Hosting** |
| **Backend** | Node.js (TypeScript), **Prisma ORM**, Express, JWT, Zod | **Google Cloud Run (Docker)** |
| **Database** | PostgreSQL (18+ Tables, Multi-tenant Isolation) | **Supabase (ปัจจุบัน) ➔ Google Cloud SQL (อนาคต)** |
| **CI / CD** | GitHub Actions (Auto-deploy Frontend & Backend + Prisma Migrate) | GitHub Actions |

---

## 👥 ทีมงานและบทบาทหน้าที่ (Team Structure)

| ลำดับ | บทบาท | ผู้รับผิดชอบ (Email / GitHub) | พื้นที่ดูแลใน Repository |
| :---: | :--- | :--- | :--- |
| **1** | **Project Manager & System Analyst (Lead)** | **@Arthy001** (Project Owner) | `/docs/`, เอกสารแผนงาน, คุม Sprint & Releases |
| **2** | **Back-End Developer** | **`pairot.buabmee@gmail.com`** (คุณไพโรจน์) | `/backend/`, `/backend/prisma/`, `Dockerfile` |
| **3** | **Front-End Developer** | **`Thanathat.kj@gmail.com`** (คุณธนทัต) | `/frontend/`, `firebase.json` |
| **4** | **QA / Tester** | *(QA Engineer)* | `/tests/`, Test Matrix, Postman Testing |

---

## 🚀 คู่มือเริ่มต้นใช้งานสำหรับนักพัฒนา (Quick Start)

### 1. Clone Repository & สลับไปที่ Branch `develop`
```bash
git clone https://github.com/Arthy001/MatchStock.git
cd MatchStock
git checkout develop
```

### 2. รัน Back-End (Node.js + Prisma)
```bash
cd backend
npm install

# คัดลอกและตั้งค่า .env (ใส่ Connection String ของ Supabase)
cp .env.example .env

# รัน Migration สร้างตารางบน Supabase + ข้อมูลเริ่มต้น (Seed Data)
npx prisma migrate dev
npx prisma db seed

# รัน Server
npm run dev
# ➔ API Server จะทำงานที่ http://localhost:8080
# ➔ Health Check: http://localhost:8080/health
# ➔ เปิด GUI จัดการ Database: npx prisma studio (http://localhost:5555)
```

### 3. รัน Front-End (React + Vite)
```bash
cd frontend
npm install
npm run dev
# ➔ เว็บแอปพลิเคชันจะเปิดที่ http://localhost:5173
```

---

## 📁 โครงสร้างโปรเจกต์ (Monorepo Directory Structure)

```text
MatchStock/
├── 🚀 .github/
│   ├── workflows/
│   │   ├── frontend-firebase.yml  # Auto-deploy React to Firebase Hosting
│   │   └── backend-cloudrun.yml   # Build Docker & Deploy API to Cloud Run
│   └── CODEOWNERS                 # กำหนดสิทธิ์และคนรีวิวโค้ดของแต่ละโฟลเดอร์
│
├── ⚙️ backend/                     # Node.js + TypeScript RESTful API Server
│   ├── prisma/
│   │   ├── schema.prisma          # 💎 Prisma Schema (18 ตาราง + Feature Flags)
│   │   └── seed.ts                # Test Data Seeder (Plans, Users, Master Data)
│   ├── src/                       # Controllers, Services, Middlewares
│   ├── Dockerfile                 # Multi-stage Docker สำหรับ Cloud Run
│   └── package.json
│
├── 🎨 frontend/                    # React (Vite + TypeScript) Web Application
│   ├── firebase.json              # Firebase Hosting Configuration (SPA Routing)
│   ├── .firebaserc                # Firebase Project Aliases
│   ├── src/                       # Components, Pages, State, Scanner UI
│   └── package.json
│
├── 📐 docs/                        # เอกสารสเปคทางเทคนิค (SA Deliverables)
│   ├── openapi.yaml               # OpenAPI 3.0 API Specification Contract
│   └── API_AND_DATA_FLOWS.md      # Data Flow Diagrams & Sequence Diagrams
│
├── 📋 Features.md                 # รายละเอียดฟังก์ชันและโมดูลระบบทั้งหมด (เดิมคือ Read Me)
├── 📄 PROJECT_PLAN.md             # แผนงานระบบและการแบ่ง 4 Sprints
├── 📄 GIT_COLLABORATION_GUIDE.md  # คู่มือ Git, Prisma Workflow และแนวทาง Deploy
├── 📄 PM_PLAYBOOK.md              # คู่มือปฏิบัติงานสำหรับ PM & SA
├── 📄 TEAM_WORKFLOW_STEPS.md      # คู่มือทีละขั้นตอนสำหรับลูกทีมแต่ละคน
└── 🗄️ SQL DDL Script.sql          # PostgreSQL DDL Script ต้นฉบับ
```

---

## 📚 สารบัญเอกสารสำคัญในระบบ (Documentation Index)

* **ความต้องการและฟีเจอร์ของระบบ:** อ่านได้ที่ [Features.md](Features.md)
* **แผนงานระบบ & Sprint Roadmap (8 สัปดาห์):** อ่านได้ที่ [PROJECT_PLAN.md](PROJECT_PLAN.md)
* **คู่มือการรวมงานและการใช้ Git ร่วมกัน:** อ่านได้ที่ [GIT_COLLABORATION_GUIDE.md](GIT_COLLABORATION_GUIDE.md)
* **คู่มือปฏิบัติงานสำหรับ PM & SA:** อ่านได้ที่ [PM_PLAYBOOK.md](PM_PLAYBOOK.md)
* **คู่มือขั้นตอนทำงานสำหรับสมาชิกในทีม (FE, BE, QA, PM):** อ่านได้ที่ [TEAM_WORKFLOW_STEPS.md](TEAM_WORKFLOW_STEPS.md)
* **API Specification (OpenAPI 3.0 Contract):** ดูได้ที่ [docs/openapi.yaml](docs/openapi.yaml)
* **แผนภาพลำดับการทำงาน (Sequence & Data Flows):** ดูได้ที่ [docs/API_AND_DATA_FLOWS.md](docs/API_AND_DATA_FLOWS.md)

---

## 🔒 กฎเหล็กในการพัฒนา (Development Guidelines)
1. **ห้าม Push ตรงเข้า `main` และ `develop`:** ทุกคนต้องแตก Branch ย่อย (เช่น `feature/be-xxx`, `feature/fe-xxx`) และเปิด Pull Request เสมอ
2. **ห้ามแก้ Database บน Supabase GUI ตรงๆ:** ทุกการแก้ไขตารางต้องทำผ่าน `npx prisma migrate dev` ในโฟลเดอร์ `backend/`
3. **Multi-Tenancy Guard:** ทุกการ Query ข้อมูลใน Back-End ต้องมี Filter `tenant_id` จาก Session/JWT เพื่อความปลอดภัยสูงสุด
