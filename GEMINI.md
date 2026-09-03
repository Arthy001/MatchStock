# MatchStock - AI Agent Rules & Instructions (GEMINI.md)

## 🚫 Git Commit & Push Rules (STRICT)
1. **ห้ามทำการ `git commit` หรือ `git add` เองโดยเด็ดขาด** (Never run `git commit` or `git add` automatically).
2. ให้ทำการแก้ไขไฟล์หรือตอบคำถามตามที่ผู้ใช้ร้องขอเท่านั้น 
3. หากจำเป็นต้อง commit จะต้องรอให้ผู้ใช้เป็นคนสั่งคำว่า "commit" หรือร้องขออย่างชัดเจนเท่านั้น
4. ห้ามทำการ `git push` โดยเด็ดขาด เว้นแต่จะได้รับคำสั่งเจาะจงจากผู้ใช้
5. **PowerShell Syntax Rule:** เมื่อรันคำสั่งหลายคำสั่งต่อกันบน Windows PowerShell ให้ใช้เครื่องหมายเซมิโคลอน (`;`) คั่นคำสั่ง ห้ามใช้ `&&` หรือ `&` (เช่น `git add ... ; git commit ...`)

---

## 🛠️ Development & Schema Guidelines
1. ตรวจสอบความถูกต้องของ `backend/prisma/schema.prisma` และ `docs/openapi.yaml` ทุกครั้งที่มีการเปลี่ยนแปลง Contract
2. การปรับปรุงโมเดลฐานข้อมูลต้องคำนึงถึง Data Integrity, Multi-Tenancy (`tenantId`), และการทำ Soft-Delete เสมอ
3. รักษาความเข้ากันได้ของ API (Backward Compatibility) ป้องกันไม่ให้ Front-End ที่ใช้งานอยู่เกิดข้อผิดพลาด
