import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for MatchStock...');

  // 1. Global Master Data: Barcode Symbologies
  const barcodeSymbologies = [
    { code: 'CODE128', name: 'Code 128', description: 'บาร์โค้ดมาตรฐาน 1 มิติที่ใช้แพร่หลายในคลังสินค้า' },
    { code: 'EAN13', name: 'EAN-13', description: 'บาร์โค้ดมาตรฐานสินค้าอุปโภคบริโภค 13 หลัก' },
    { code: 'QR_CODE', name: 'QR Code', description: 'บาร์โค้ด 2 มิติ เก็บข้อมูลได้ปริมาณมาก' },
  ];

  for (const item of barcodeSymbologies) {
    await prisma.barcodeSymbology.upsert({
      where: { code: item.code },
      update: {},
      create: item,
    });
  }
  console.log('✅ Barcode symbologies seeded.');

  // 2. Global Master Data: Discount Types
  const discountTypes = [
    { code: 'PERCENTAGE', name: 'Percentage Discount', description: 'ส่วนลดคิดเป็นเปอร์เซ็นต์ (%)' },
    { code: 'FIXED_AMOUNT', name: 'Fixed Amount Discount', description: 'ส่วนลดคิดเป็นจำนวนเงินคงที่' },
  ];

  for (const item of discountTypes) {
    await prisma.discountType.upsert({
      where: { code: item.code },
      update: {},
      create: item,
    });
  }
  console.log('✅ Discount types seeded.');

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
  console.log('✅ Subscription plans seeded with feature flags.');

  // 4. Sample Demo Tenant
  const demoTenant = await prisma.tenant.create({
    data: {
      companyName: 'MatchStock Demo Corp.',
      taxId: '0105559999999',
      contactEmail: 'demo@matchstock.com',
      contactPhone: '02-123-4567',
      status: 'active',
    },
  });

  const proPlan = await prisma.subscriptionPlan.findUnique({ where: { code: 'PRO_YEARLY' } });

  if (proPlan) {
    await prisma.subscription.create({
      data: {
        tenantId: demoTenant.id,
        planId: proPlan.id,
        status: 'active',
        currentPeriodStartsAt: new Date(),
        currentPeriodEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 year
      },
    });
  }

  // 5. Sample Admin User (password: Password123!)
  const passwordHash = await bcrypt.hash('Password123!', 10);
  await prisma.user.create({
    data: {
      tenantId: demoTenant.id,
      email: 'admin@matchstock.com',
      passwordHash,
      fullName: 'System Administrator',
      role: 'admin',
      isActive: true,
    },
  });

  // 6. Sample Warehouse & Bins
  const warehouse = await prisma.warehouse.create({
    data: {
      tenantId: demoTenant.id,
      code: 'WH-01',
      name: 'คลังสินค้าหลักกรุงเทพ (Bangkok Main Hub)',
    },
  });

  await prisma.binLocation.createMany({
    data: [
      { tenantId: demoTenant.id, warehouseId: warehouse.id, code: 'A-01-01' },
      { tenantId: demoTenant.id, warehouseId: warehouse.id, code: 'A-01-02' },
      { tenantId: demoTenant.id, warehouseId: warehouse.id, code: 'B-01-01' },
    ],
  });

  // 7. Sample Units
  const pcsUnit = await prisma.unit.create({
    data: { tenantId: demoTenant.id, code: 'PCS', name: 'ชิ้น (Pieces)' },
  });
  await prisma.unit.create({
    data: { tenantId: demoTenant.id, code: 'BOX', name: 'กล่อง (Box)' },
  });

  // 8. Sample Category & Brand
  const category = await prisma.category.create({
    data: { tenantId: demoTenant.id, code: 'ELEC', name: 'Electronics' },
  });
  const brand = await prisma.brand.create({
    data: { tenantId: demoTenant.id, code: 'LOGI', name: 'Logitech' },
  });

  // 9. Sample Product
  const barcodeSym = await prisma.barcodeSymbology.findUnique({ where: { code: 'CODE128' } });

  await prisma.product.create({
    data: {
      tenantId: demoTenant.id,
      baseUnitId: pcsUnit.id,
      categoryId: category.id,
      brandId: brand.id,
      barcodeSymbologyId: barcodeSym?.id,
      code: 'PRD-001',
      sku: 'LOGI-MX3S-GRY',
      barcode: '8851234567890',
      slug: 'logitech-mx-master-3s-grey',
      name: 'Logitech MX Master 3S Wireless Mouse',
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

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
