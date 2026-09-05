# tools/

## reset-tenant-data.js

รีเซ็ตข้อมูลของ tenant ทดสอบตัวเอง (products/warehouses/stock/transactions ทั้งหมด) ให้กลับไปว่างเปล่า โดย **ไม่ต้อง SSH เข้า VM หรือเข้าถึง backend repo เลย** — ใช้แค่ email/password ที่ login เข้าเว็บได้ปกติ สคริปต์นี้คุยกับ backend จริง (`https://match-stock.ddns.net`) ผ่าน HTTPS ธรรมดา

**สิ่งที่ไม่ถูกลบ**: login/user, subscription และประวัติการเรียกเก็บเงินยังอยู่ครบ — ล็อกอินด้วย account เดิมได้ทันทีหลังรีเซ็ต

### วิธีใช้

ต้องมี Node.js 18 ขึ้นไป (ใช้ `fetch` ในตัว ไม่ต้อง `npm install` อะไรเลย)

```bash
node tools/reset-tenant-data.js --email you@example.com --password 'yourPassword'
```

จะโชว์รายการ/จำนวนแถวที่จะถูกลบก่อน (dry-run) แล้วถามยืนยันด้วยการพิมพ์ `yes` ถึงจะลบจริง

**ตัวเลือกเพิ่มเติม**:
- `--url http://localhost:3010` — ทดสอบกับ local Docker แทน production (ค่า default คือ production)
- `--yes` — ข้ามคำถามยืนยัน (ใช้เวลารันแบบอัตโนมัติ)

### ถ้าเจอ "This account's tenant is not enabled for self-service reset"

Tenant ของ account นี้ยังไม่ถูกเปิดสิทธิ์ให้รีเซ็ตได้ (ทีม backend เป็นคนกำหนดว่า tenant ไหนใช้ได้บ้าง เพื่อความปลอดภัยของข้อมูลจริง) — แจ้งทีม backend ให้เพิ่ม tenant นี้เข้า allowlist
