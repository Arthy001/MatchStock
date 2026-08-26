# Changelog ของ Prisma Schema + API Docs

บันทึกการเปลี่ยนแปลงทุกครั้งที่ `schema.prisma` หรือ `docs/openapi.yaml` ใน repo นี้ถูก sync จากโค้ด backend ตัวจริง

## 2026-08-26 — Regenerate docs/openapi.yaml จาก live Swagger spec จริง (PR #13)

เอกสารเดิมมีแค่ 10 endpoint จากที่ backend จริงมี 86 endpoint แถม section "Core Stock Operations & Balances (Preview)" อ้างถึง path ที่ไม่มีอยู่จริงเลย (`/inventory/balances`, `/inventory/transactions/receive` — ของจริงคือ `/warehouses/{id}/stock` และ `/goods-receipts`)

**การแก้ไข**: แทนที่ทั้งไฟล์ด้วยข้อมูลจาก `GET https://match-stock.ddns.net/api-docs-json` ตรงๆ (source เดียวกับหน้า `/api-docs` ที่ generate สดจากโค้ดจริงทุกครั้ง) ไม่ได้พิมพ์มือ เพราะฉะนั้น field name/required/example ทุกตัวตรงกับ backend จริง 100% — ครบทั้ง Units, Brands, Manufacturers, Suppliers, Categories, TaxTypes, BarcodeSymbologies, Tags, Devices, GoodsReceipts, GoodsIssues, StockTransfers, StockAdjustments, CycleCounts, Reports, Import/Export, Webhooks, Alerts, Users ที่ไม่เคยมีเอกสารมาก่อน

**ผลข้างเคียงที่พบและแก้แล้ว**: GitHub secret scanning แจ้งเตือน "Stripe Webhook Signing Secret" หลุดใน `docs/openapi.yaml` 2 จุด — ตรวจแล้วเป็น placeholder ตัวอย่างที่ hardcode ไว้ใน `webhooks.controller.ts` มานานแล้ว (ไม่ใช่ secret จริง ไม่เคยดึงจาก env/production) เป็น false-positive จาก pattern `whsec_` ที่ตรงกับของ Stripe โดยบังเอิญ ไม่ต้อง rotate อะไร

## 2026-08-26 — แก้ field name ของ Product ให้ตรงกับ backend (PR #12)

Front-End เจอ 5-6 จุดที่ field name/หน่วยไม่ตรงกันตอนเทียบ response จริงกับ spec — แก้เอกสารให้ตรงกับ backend แทนการแก้ backend (Front-End มี mapper รองรับชื่อจริงของ backend ไว้แล้ว):
`price`→`sellingPriceMinor`, `barcode`→`barcodeValue`, `widthCm/weightKg/lengthCm/heightCm`→`widthValue/weightValue/lengthValue/heightValue` (หน่วยวัดเลือกได้ต่อ tenant ผ่าน `dimensionUnitId`/`weightUnitId` ไม่ตายตัวที่ cm/kg), `isLotControl`→`lotControlled`, `minReorderQty`→`minReorderQuantity`, `baseUnit`→`unit` (backend enrich object ให้อยู่แล้ว ไม่ใช่ส่งแค่ id) พร้อมแก้ `CreateProductInput.required` ที่ระบุผิด (`baseUnitId`/`price` ไม่ควรบังคับ)
