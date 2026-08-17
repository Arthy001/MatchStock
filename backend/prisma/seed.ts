import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding comprehensive test data for MatchStock...');

  // 1. Global Master Data: Barcode Symbologies
  const barcodeSymbologies = [
    { code: 'CODE128', name: 'Code 128', description: 'บาร์โค้ดมาตรฐาน 1 มิติที่ใช้แพร่หลายในคลังสินค้า' },
    { code: 'EAN13', name: 'EAN-13', description: 'บาร์โค้ดมาตรฐานสินค้าอุปโภคบริโภค 13 หลัก' },
    { code: 'QR_CODE', name: 'QR Code', description: 'บาร์โค้ด 2 มิติ เก็บข้อมูลได้ปริมาณมาก' },
  ];

  for (const item of barcodeSymbologies) {
    await prisma.barcodeSymbology.upsert({
      where: { code: item.code },
      update: item,
      create: item,
    });
  }
  console.log('✅ 1. Barcode symbologies seeded.');

  // 2. Global Master Data: Discount Types
  const discountTypes = [
    { code: 'PERCENTAGE', name: 'Percentage Discount', description: 'ส่วนลดคิดเป็นเปอร์เซ็นต์ (%)' },
    { code: 'FIXED_AMOUNT', name: 'Fixed Amount Discount', description: 'ส่วนลดคิดเป็นจำนวนเงินคงที่' },
  ];

  for (const item of discountTypes) {
    await prisma.discountType.upsert({
      where: { code: item.code },
      update: item,
      create: item,
    });
  }
  console.log('✅ 2. Discount types seeded.');

  // 3. Subscription Plans (with Quotas & Feature Flags)
  const plans = [
    {
      code: 'BASIC_MONTHLY',
      name: 'Basic Plan',
      description: 'เหมาะสำหรับธุรกิจขนาดเล็ก เริ่มต้นจัดการคลังสินค้า',
      price: 990.0,
      billingCycle: 'MONTHLY',
      maxWarehouses: 1,
      maxUsers: 2,
      maxProducts: 500,
      hasLotTracking: false,
      hasBarcodeScanner: false,
      hasCycleCount: false,
      hasAnalyticsReports: false,
      hasImportExport: true,
      hasApiAccess: false,
    },
    {
      code: 'PRO_YEARLY',
      name: 'Pro Business Plan',
      description: 'เหมาะสำหรับธุรกิจคลังสินค้าขนาดกลาง จัดการ Lot และตรวจนับสต็อก',
      price: 2490.0,
      billingCycle: 'MONTHLY',
      maxWarehouses: 3,
      maxUsers: 10,
      maxProducts: 5000,
      hasLotTracking: true,
      hasBarcodeScanner: true,
      hasCycleCount: true,
      hasAnalyticsReports: true,
      hasImportExport: true,
      hasApiAccess: false,
    },
    {
      code: 'ENTERPRISE',
      name: 'Enterprise Unlimited',
      description: 'ปลดล็อกทุกฟีเจอร์ ไม่จำกัดขนาดคลังและผู้ใช้งาน พร้อม API Integration',
      price: 5900.0,
      billingCycle: 'MONTHLY',
      maxWarehouses: 10,
      maxUsers: 50,
      maxProducts: 50000,
      hasLotTracking: true,
      hasBarcodeScanner: true,
      hasCycleCount: true,
      hasAnalyticsReports: true,
      hasImportExport: true,
      hasApiAccess: true,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
  }
  console.log('✅ 3. Subscription plans seeded.');

  // 4. Demo Tenant
  let demoTenant = await prisma.tenant.findFirst({
    where: { contactEmail: 'demo@matchstock.com' },
  });

  if (!demoTenant) {
    demoTenant = await prisma.tenant.create({
      data: {
        companyName: 'MatchStock Demo Corp.',
        taxId: '0105559999999',
        contactEmail: 'demo@matchstock.com',
        contactPhone: '02-123-4567',
        status: 'active',
      },
    });
  }

  const proPlan = await prisma.subscriptionPlan.findUnique({ where: { code: 'PRO_YEARLY' } });
  if (proPlan) {
    const existingSub = await prisma.subscription.findFirst({ where: { tenantId: demoTenant.id } });
    if (!existingSub) {
      await prisma.subscription.create({
        data: {
          tenantId: demoTenant.id,
          planId: proPlan.id,
          status: 'active',
          currentPeriodStartsAt: new Date(),
          currentPeriodEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
  console.log('✅ 4. Demo tenant and subscription active.');

  // 5. Users for All 4 Roles (Password: Password123!)
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const sampleUsers = [
    { email: 'admin@matchstock.com', fullName: 'สมศักดิ์ ผู้ดูแลระบบ (Admin)', role: 'admin' },
    { email: 'manager@matchstock.com', fullName: 'มนัส ผู้จัดการคลัง (Manager)', role: 'manager' },
    { email: 'whstaff@matchstock.com', fullName: 'วิชัย พนักงานคลังสินค้า (Staff)', role: 'warehouse_staff' },
    { email: 'purchasing@matchstock.com', fullName: 'พรทิพย์ เจ้าหน้าที่จัดซื้อ (Purchaser)', role: 'purchasing_staff' },
  ];

  for (const u of sampleUsers) {
    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: demoTenant.id, email: u.email } },
      update: { fullName: u.fullName, role: u.role, passwordHash, isActive: true },
      create: { tenantId: demoTenant.id, email: u.email, fullName: u.fullName, role: u.role, passwordHash, isActive: true },
    });
  }
  console.log('✅ 5. Users for all 4 RBAC roles seeded.');

  // 6. Tax Types
  const vat7 = await prisma.taxType.upsert({
    where: { tenantId_code: { tenantId: demoTenant.id, code: 'VAT_7' } },
    update: { name: 'ภาษีมูลค่าเพิ่ม 7%', rate: 7.00 },
    create: { tenantId: demoTenant.id, code: 'VAT_7', name: 'ภาษีมูลค่าเพิ่ม 7%', rate: 7.00 },
  });

  // 7. Suppliers
  const supplier = await prisma.supplier.upsert({
    where: { tenantId_code: { tenantId: demoTenant.id, code: 'SUP-001' } },
    update: { name: 'Synnex (Thailand) Public Co., Ltd.' },
    create: {
      tenantId: demoTenant.id,
      code: 'SUP-001',
      name: 'Synnex (Thailand) Public Co., Ltd.',
      contactPerson: 'คุณกิตติศักดิ์ ฝ่ายขาย',
      phone: '02-553-8888',
    },
  });

  // 8. Warehouses & Bins
  const warehouse = await prisma.warehouse.upsert({
    where: { tenantId_code: { tenantId: demoTenant.id, code: 'WH-01' } },
    update: { name: 'คลังสินค้าหลักกรุงเทพ (Bangkok Main Hub)' },
    create: { tenantId: demoTenant.id, code: 'WH-01', name: 'คลังสินค้าหลักกรุงเทพ (Bangkok Main Hub)' },
  });

  const binCodes = ['A-01-01', 'A-01-02', 'B-01-01', 'B-01-02'];
  const bins: Record<string, string> = {};
  for (const bCode of binCodes) {
    const bin = await prisma.binLocation.upsert({
      where: { warehouseId_code: { warehouseId: warehouse.id, code: bCode } },
      update: {},
      create: { tenantId: demoTenant.id, warehouseId: warehouse.id, code: bCode },
    });
    bins[bCode] = bin.id;
  }
  console.log('✅ 6. Warehouses & Bin locations seeded.');

  // 9. Units, Categories & Brands
  const pcsUnit = await prisma.unit.upsert({
    where: { tenantId_code: { tenantId: demoTenant.id, code: 'PCS' } },
    update: { name: 'ชิ้น (Pieces)' },
    create: { tenantId: demoTenant.id, code: 'PCS', name: 'ชิ้น (Pieces)' },
  });

  const boxUnit = await prisma.unit.upsert({
    where: { tenantId_code: { tenantId: demoTenant.id, code: 'BOX' } },
    update: { name: 'กล่อง (Box)' },
    create: { tenantId: demoTenant.id, code: 'BOX', name: 'กล่อง (Box)' },
  });

  const categoryElec = await prisma.category.upsert({
    where: { tenantId_code: { tenantId: demoTenant.id, code: 'ELEC' } },
    update: { name: 'IT & Electronics' },
    create: { tenantId: demoTenant.id, code: 'ELEC', name: 'IT & Electronics' },
  });

  const categoryOffice = await prisma.category.upsert({
    where: { tenantId_code: { tenantId: demoTenant.id, code: 'OFFICE' } },
    update: { name: 'Office Supplies' },
    create: { tenantId: demoTenant.id, code: 'OFFICE', name: 'Office Supplies' },
  });

  const brandLogi = await prisma.brand.upsert({
    where: { tenantId_code: { tenantId: demoTenant.id, code: 'LOGI' } },
    update: { name: 'Logitech' },
    create: { tenantId: demoTenant.id, code: 'LOGI', name: 'Logitech' },
  });

  const brandKeychron = await prisma.brand.upsert({
    where: { tenantId_code: { tenantId: demoTenant.id, code: 'KEYCHRON' } },
    update: { name: 'Keychron' },
    create: { tenantId: demoTenant.id, code: 'KEYCHRON', name: 'Keychron' },
  });

  // 10. Sample Products
  const barcodeSym128 = await prisma.barcodeSymbology.findUnique({ where: { code: 'CODE128' } });

  // Product 1: Logitech Mouse (Lot Controlled, Normal Stock)
  const product1 = await prisma.product.upsert({
    where: { tenantId_code: { tenantId: demoTenant.id, code: 'PRD-001' } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      baseUnitId: pcsUnit.id,
      categoryId: categoryElec.id,
      brandId: brandLogi.id,
      taxTypeId: vat7.id,
      barcodeSymbologyId: barcodeSym128?.id,
      code: 'PRD-001',
      sku: 'LOGI-MX3S-GRY',
      barcode: '8851234567890',
      slug: 'logitech-mx-master-3s-grey',
      name: 'Logitech MX Master 3S Wireless Mouse (Graphite)',
      description: 'Performance Wireless Mouse with Quiet Clicks and 8K DPI Tracking',
      price: 3890.0,
      weightKg: 0.141,
      widthCm: 8.43,
      lengthCm: 12.49,
      heightCm: 5.1,
      reorderPoint: 10,
      minReorderQty: 20,
      isLotControl: true,
    },
  });

  // Product 2: Keychron Keyboard (Lot Controlled, Low Stock -> Triggers Reorder Alert!)
  const product2 = await prisma.product.upsert({
    where: { tenantId_code: { tenantId: demoTenant.id, code: 'PRD-002' } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      baseUnitId: pcsUnit.id,
      categoryId: categoryElec.id,
      brandId: brandKeychron.id,
      taxTypeId: vat7.id,
      barcodeSymbologyId: barcodeSym128?.id,
      code: 'PRD-002',
      sku: 'KEYCHRON-K2V2-RGB',
      barcode: '8859990001112',
      slug: 'keychron-k2-version-2-rgb-brown',
      name: 'Keychron K2 V2 Wireless Mechanical Keyboard (RGB Brown Switch)',
      description: 'Compact 75% Layout Wireless Mechanical Keyboard for Mac & Windows',
      price: 3590.0,
      weightKg: 0.790,
      widthCm: 12.9,
      lengthCm: 31.7,
      heightCm: 3.85,
      reorderPoint: 15, // Reorder point = 15 (Stock will be 5 -> LOW STOCK ALERT)
      minReorderQty: 30,
      isLotControl: true,
    },
  });

  // 11. Sample Product Lots & Real-time Balances
  // Lot A for Product 1 (Expiring 2027)
  const lot1A = await prisma.productLot.upsert({
    where: { tenantId_productId_lotNumber: { tenantId: demoTenant.id, productId: product1.id, lotNumber: 'LOT-2026-08A' } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      productId: product1.id,
      lotNumber: 'LOT-2026-08A',
      manufacturedDate: new Date('2026-08-01'),
      expirationDate: new Date('2028-08-01'),
    },
  });

  // Balance for Product 1: 50 pcs at A-01-01
  await prisma.inventoryBalance.upsert({
    where: {
      unique_inventory_balance: {
        tenantId: demoTenant.id,
        productId: product1.id,
        warehouseId: warehouse.id,
        binLocationId: bins['A-01-01'],
        lotId: lot1A.id,
      },
    },
    update: { quantityOnHand: 50.0 },
    create: {
      tenantId: demoTenant.id,
      productId: product1.id,
      warehouseId: warehouse.id,
      binLocationId: bins['A-01-01'],
      lotId: lot1A.id,
      quantityOnHand: 50.0,
      quantityReserved: 0.0,
    },
  });

  // Lot B for Product 2 (Low Stock: 5 pcs at A-01-02 -> Triggers Alert!)
  const lot2A = await prisma.productLot.upsert({
    where: { tenantId_productId_lotNumber: { tenantId: demoTenant.id, productId: product2.id, lotNumber: 'LOT-2026-07B' } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      productId: product2.id,
      lotNumber: 'LOT-2026-07B',
      manufacturedDate: new Date('2026-07-15'),
      expirationDate: new Date('2028-07-15'),
    },
  });

  await prisma.inventoryBalance.upsert({
    where: {
      unique_inventory_balance: {
        tenantId: demoTenant.id,
        productId: product2.id,
        warehouseId: warehouse.id,
        binLocationId: bins['A-01-02'],
        lotId: lot2A.id,
      },
    },
    update: { quantityOnHand: 5.0 },
    create: {
      tenantId: demoTenant.id,
      productId: product2.id,
      warehouseId: warehouse.id,
      binLocationId: bins['A-01-02'],
      lotId: lot2A.id,
      quantityOnHand: 5.0, // <= Reorder point (15) -> Trigger Low Stock
      quantityReserved: 0.0,
    },
  });

  console.log('🎉 All comprehensive seed data successfully generated!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
