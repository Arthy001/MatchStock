import { Language } from '../types';

export const translations = {
  th: {
    // Brand & General
    appName: 'MatchStock',
    appSubtitle: 'ระบบบริหารจัดการสต็อกอัจฉริยะ',
    welcome: 'ยินดีต้อนรับสู่ระบบ MatchStock',
    loginTitle: 'เข้าสู่ระบบบริหารจัดการคลังสินค้า',
    username: 'ชื่อผู้ใช้งาน',
    password: 'รหัสผ่าน',
    loginBtn: 'เข้าสู่ระบบ',
    loginHint: 'ทดสอบเข้าสู่ระบบ: User: admin | Pass: 123',
    invalidCreds: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง! (กรุณาใช้ admin / 123)',
    selectTenant: 'เลือกสาขา/คลังสินค้า',
    logout: 'ออกจากระบบ',
    searchPlaceholder: 'ค้นหาสินค้า, SKU, บาร์โค้ด...',
    searchShortcutHint: 'กด ⌘F หรือ Ctrl+F เพื่อค้นหา',
    
    // Theme & Lang
    lightMode: 'โหมดสว่าง',
    darkMode: 'โหมดมืด',
    langThai: 'ไทย (TH)',
    langEnglish: 'English (EN)',

    // Sidebar Menu
    menuMain: 'เมนูหลัก',
    dashboard: 'แดชบอร์ดสรุปภาพรวม',
    masterData: 'การจัดการข้อมูลหลัก',
    inventory: 'จัดการคลังและสต็อก',
    stockAdjustment: 'ปรับยอดสต็อกสินค้า',
    inventoryCount: 'ตรวจนับสต็อก',
    warehouses: 'คลังสินค้า & ตำแหน่ง Bin',
    stockTransfer: 'โอนย้ายสินค้าข้ามคลัง',
    sales: 'ระบบขาย',
    purchases: 'ระบบจัดซื้อ',
    reports: 'รายงาน & การวิเคราะห์',
    settings: 'ตั้งค่าระบบ & Multi-Tenant',

    // Master Data Sub-tabs
    tabUserAccess: '1. สิทธิ์ผู้ใช้ & Tenant (RBAC)',
    tabProducts: '2. แคตตาล็อกสินค้า & SKU',
    tabUnits: '3. หน่วยนับ & ขนาดมิติ',
    tabBarcodes: '4. ระบบบาร์โค้ดสากล',
    tabWarehouses: '5. คลังสินค้า & ตำแหน่ง Bin',
    tabSuppliers: '6. ผู้จัดจำหน่าย & ภาษี',

    // Section Titles
    rbacTitle: 'ผู้ใช้งานและสิทธิ์ระบบ',
    rbacSubtitle: 'จัดการผู้ใช้และกำหนดสิทธิ์การเข้าถึงตามบทบาท 4 ระดับ',
    productTitle: 'แคตตาล็อกสินค้า & SKU',
    productSubtitle: 'จัดการข้อมูลสินค้าอย่างละเอียด',
    unitsTitle: 'หน่วยนับ & มิติกายภาพ',
    unitsSubtitle: 'กำหนดหน่วยนับหลัก, น้ำหนัก และขนาดมิติ',
    barcodeTitle: 'ระบบบาร์โค้ดสากล',
    barcodeSubtitle: 'รองรับรหัสบาร์โค้ดสากลมาตรฐาน CODE128, EAN13 และ QR_CODE',
    warehouseTitle: 'คลังสินค้า & ตำแหน่งจัดเก็บย่อย',
    warehouseSubtitle: 'บริหารจัดการคลังสินค้าหลายแห่งพร้อมระบุตำแหน่งจัดเก็บย่อย',
    supplierTitle: 'ฐานข้อมูลผู้จัดจำหน่าย & ภาษี',
    supplierSubtitle: 'จัดการข้อมูลซัพพลายเออร์, ประเภทภาษี และรูปแบบส่วนลด',

    // Table Headers & Labels
    addNewBtn: '+ เพิ่มรายการใหม่',
    actions: 'จัดการ',
    status: 'สถานะ',
    role: 'บทบาท',
    code: 'รหัส',
    sku: 'SKU',
    productName: 'ชื่อสินค้า',
    category: 'หมวดหมู่',
    brand: 'ยี่ห้อ',
    manufacturer: 'ผู้ผลิต',
    price: 'ราคา',
    stockOnHand: 'คงเหลือในสต็อก',
    reorderLevel: 'จุดสั่งซื้อเติม',
    gauge: 'ระดับสต็อก',
    weight: 'น้ำหนัก',
    dimensions: 'ขนาดมิติ',
    volumeCbm: 'ปริมาตร',
    barcodeType: 'ประเภทบาร์โค้ด',
    barcodeValue: 'รหัสบาร์โค้ด',
    previewBarcode: 'ดูบาร์โค้ด',
    printLabel: 'พิมพ์ป้าย',
    warehouseName: 'ชื่อคลังสินค้า',
    binCode: 'รหัสตำแหน่ง Bin',
    capacityKg: 'ความจุสูงสุด',
    currentItems: 'จำนวนจัดเก็บปัจจุบัน',
    supplierName: 'ชื่อผู้จัดจำหน่าย',
    contact: 'ผู้ติดต่อ / โทรศัพท์',
    taxId: 'เลขประจำตัวผู้เสียภาษี',
    taxType: 'ประเภทภาษี',
    discount: 'ส่วนลด',

    // Roles
    roleAdmin: 'ผู้ดูแลระบบ',
    roleManager: 'ผู้จัดการ',
    roleWarehouse: 'เจ้าหน้าที่คลัง',
    rolePurchasing: 'เจ้าหน้าที่จัดซื้อ',

    // Status Badges
    active: 'ใช้งานอยู่',
    inactive: 'ปิดใช้งาน',
    inStock: 'สต็อกปกติ',
    lowStock: 'สต็อกใกล้หมด',
    outOfStock: 'สินค้าหมด',
    available: 'ว่างพร้อมเก็บ',
    full: 'พื้นที่เต็ม',
    maintenance: 'ปิดซ่อมบำรุง',

    // Modal
    modalAddTitle: 'เพิ่มรายการ Master Data ใหม่',
    modalEditTitle: 'แก้ไขข้อมูล Master Data',
    save: 'บันทึกข้อมูล',
    cancel: 'ยกเลิก',
    close: 'ปิด',

    // Footer
    copyright: 'MatchStock WMS System © 2026. พัฒนาด้วย React (Firebase Hosting) & Node.js Prisma (Cloud Run)'
  },
  en: {
    // Brand & General
    appName: 'MatchStock',
    appSubtitle: 'Smart Inventory Management (Multi-Tenant WMS)',
    welcome: 'Welcome to MatchStock System',
    loginTitle: 'Sign In to Warehouse System',
    username: 'Username',
    password: 'Password',
    loginBtn: 'Sign In',
    loginHint: 'Demo Login: User: admin | Pass: 123',
    invalidCreds: 'Invalid credentials! (Please use admin / 123)',
    selectTenant: 'Select Branch/Warehouse (Tenant)',
    logout: 'Log Out',
    searchPlaceholder: 'Search items, SKU, barcodes...',
    searchShortcutHint: 'Press ⌘F or Ctrl+F to search',

    // Theme & Lang
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    langThai: 'ไทย (TH)',
    langEnglish: 'English (EN)',

    // Sidebar Menu
    menuMain: 'MAIN MENU',
    dashboard: 'Dashboard Overview',
    masterData: 'Master Data Management',
    inventory: 'Inventory & Stock',
    stockAdjustment: 'Inventory Adjustment',
    inventoryCount: 'Cycle Count Audit',
    warehouses: 'Warehouses & Bins',
    stockTransfer: 'Stock Transfer',
    sales: 'Sales Order',
    purchases: 'Purchase Order',
    reports: 'Reports & Analytics',
    settings: 'System Settings & Multi-Tenant',

    // Master Data Sub-tabs
    tabUserAccess: '1. Tenant & User Access (RBAC)',
    tabProducts: '2. Product Catalog & SKU',
    tabUnits: '3. Units & Dimensions',
    tabBarcodes: '4. Barcode Support',
    tabWarehouses: '5. Multi-Warehouse & Bins',
    tabSuppliers: '6. Suppliers & Tax Masters',

    // Section Titles
    rbacTitle: 'Tenant & User Access Control (RBAC)',
    rbacSubtitle: 'Manage users and assign role-based access permissions across 4 roles',
    productTitle: 'Product Catalog & SKU Management',
    productSubtitle: 'Detailed product management (Code, SKU, Slug, Category, Brand, Manufacturer)',
    unitsTitle: 'Units of Measure & Physical Dimensions',
    unitsSubtitle: 'Configure primary UOM, Weight (kg), and Dimensions (W x L x H cm)',
    barcodeTitle: 'Standard Barcode & QR Code Support',
    barcodeSubtitle: 'Supports international barcode standards: CODE128, EAN13, and QR_CODE',
    warehouseTitle: 'Multi-Warehouse & Sub-Bin Locations',
    warehouseSubtitle: 'Manage multiple warehouse facilities and sub-storage bin levels',
    supplierTitle: 'Suppliers & Tax Masters Database',
    supplierSubtitle: 'Supplier catalog, Tax rules (VAT 7%), and discount structures',

    // Table Headers & Labels
    addNewBtn: '+ Add New Item',
    actions: 'Action',
    status: 'Status',
    role: 'Role',
    code: 'Code',
    sku: 'SKU',
    productName: 'Product Name',
    category: 'Category',
    brand: 'Brand',
    manufacturer: 'Manufacturer',
    price: 'Price ($)',
    stockOnHand: 'Stock On Hand',
    reorderLevel: 'Reorder Level',
    gauge: 'Level Gauge',
    weight: 'Weight (kg)',
    dimensions: 'Dimensions (WxLxH cm)',
    volumeCbm: 'Volume (CBM)',
    barcodeType: 'Barcode Type',
    barcodeValue: 'Barcode Value',
    previewBarcode: 'Preview Barcode',
    printLabel: 'Print Label',
    warehouseName: 'Warehouse Name',
    binCode: 'Bin Code',
    capacityKg: 'Capacity (kg)',
    currentItems: 'Stored Count',
    supplierName: 'Supplier Name',
    contact: 'Contact / Phone',
    taxId: 'Tax ID',
    taxType: 'Tax Type',
    discount: 'Discount',

    // Roles
    roleAdmin: 'Administrator',
    roleManager: 'Manager',
    roleWarehouse: 'Warehouse Staff',
    rolePurchasing: 'Purchasing Staff',

    // Status Badges
    active: 'Active',
    inactive: 'Inactive',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    available: 'Available',
    full: 'Full',
    maintenance: 'Maintenance',

    // Modal
    modalAddTitle: 'Add New Master Data Record',
    modalEditTitle: 'Edit Master Data Record',
    save: 'Save Changes',
    cancel: 'Cancel',
    close: 'Close',

    // Footer
    copyright: 'MatchStock WMS System © 2026. Powered by React (Firebase Hosting) & Node.js Prisma (Cloud Run)'
  }
};

export const getTranslation = (lang: Language) => translations[lang] || translations.th;
