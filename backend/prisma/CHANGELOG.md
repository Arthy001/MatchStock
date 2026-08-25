# Prisma Schema Changelog

Tracks what changed each time `schema.prisma` in this repo is synced from
the live backend codebase.

## 2026-08-25 — Full sync with live schema

`schema.prisma` here had drifted far from what the backend actually runs
on (dev/prod). This update replaces it with the current, real schema.
`seed.ts` and `migrations/` were intentionally left untouched in this
update — schema only.

**Tenant model reshaped**: `companyName`/`taxId` fields removed, replaced
with `name`/`slug` + a `TenantStatus` enum. Anything reading the old
field names needs to be updated separately (out of scope here).

**Models removed** (no longer exist — replaced by the models listed
below): `Company`, `SubscriptionInvoice`, `DiscountType`, `ProductLot`,
`InventoryBalance`, `StockTransaction`, `StockTransactionItem`,
`StockCount`, `StockCountItem`.

**Models added** — new functionality that didn't exist when this repo's
schema was last updated:
- Auth/platform: `User`, `Role`, `RefreshToken`, `PlatformAdmin`,
  `PlatformRefreshToken`
- Billing: `SubscriptionPlan`, `Subscription`, `Invoice`, `InvoiceLine`,
  `Payment`, `Refund`, `PaymentWebhookEvent`
- Inventory/tags (RFID, replaces the old quantity-based stock model):
  `Tag`, `TagCurrentState`, `TagEvent`, `GoodsReceipt`, `GoodsIssue`,
  `StockTransfer`, `StockTransferTag`, `StockAdjustment`, `CycleCount`,
  `CycleCountExpectedTag`, `CycleCountCountedTag`
- Devices/readers: `Device`, `DeviceCredential`, `DeviceMqttCredential`,
  `DeviceGpioState`, `DeviceReaderConfig`, `DeviceAntennaConfig`,
  `DeviceIngestionStat`, `ReaderOpsOperator`, `ReaderModel`
- Rentals: `RentalUnit`, `RentalAssignment`, `RentalShipment`
- Menu/webhooks/audit: `MenuItem`, `TenantMenuItem`,
  `WebhookSubscription`, `WebhookDeliveryLog`, `AuditLog`, `SecurityEvent`

**Models kept, restructured**: `Product`, `Unit`, `Category`, `Supplier`,
`TaxType`, `BarcodeSymbology` — field-level changes only, not new models
(git's diff shows them as remove+add because of extensive reordering).

**Known follow-up, not done here**: `backend/src` (the Express prototype
in this repo) still targets the old shape — it does not compile against
this schema. That's a separate, larger piece of work than a schema sync,
left for the team to plan.
