import { Request, Response, Router } from 'express';
import { prisma } from '../config/prisma';
import { requireTenant } from '../middlewares/tenant.middleware';
import * as bcrypt from 'bcrypt';

const router = Router();
router.use(requireTenant);

// ==========================================
// 1. CATEGORIES & BRANDS
// ==========================================
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const categories = await prisma.category.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/categories', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { name, code, description } = req.body;
    const catCode = code || name.toLowerCase().replace(/\s+/g, '-');
    const category = await prisma.category.create({
      data: { tenantId, name, code: catCode, description: description || null },
    });
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { code, name, description, isActive } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { code, name, description, isActive } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    await prisma.category.deleteMany({ where: { id, tenantId } });
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/categories/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const category = await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/brands', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const brands = await prisma.brand.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: brands });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/brands', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { name, code, description } = req.body;
    const brdCode = code || name.toLowerCase().replace(/\s+/g, '-');
    const brand = await prisma.brand.create({
      data: { tenantId, name, code: brdCode, description: description || null },
    });
    res.status(201).json({ success: true, data: brand });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/brands/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { code, name, description, isActive } = req.body;

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json({ success: true, data: brand });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/brands/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { code, name, description, isActive } = req.body;

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json({ success: true, data: brand });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/brands/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    await prisma.brand.deleteMany({ where: { id, tenantId } });
    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/brands/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const brand = await prisma.brand.update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ success: true, data: brand });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 1.5 COMPANIES (1 TENANT : N COMPANIES)
// ==========================================
router.get('/companies', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const companies = await (prisma as any).company.findMany({
      where: { tenantId },
      include: { warehouses: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: companies });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/companies', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { code, name, taxId, branchCode, branchName, phone, email, address, isHeadquarter } = req.body;
    const compCode = code || `COMP-${Math.floor(100 + Math.random() * 900)}`;

    const company = await (prisma as any).company.create({
      data: {
        tenantId,
        code: compCode,
        name,
        taxId: taxId || null,
        branchCode: branchCode || '00000',
        branchName: branchName || (branchCode === '00000' ? 'สำนักงานใหญ่ (Headquarters)' : 'สาขา'),
        phone: phone || null,
        email: email || null,
        address: address || null,
        isHeadquarter: isHeadquarter || branchCode === '00000',
      },
    });

    res.status(201).json({ success: true, data: company });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/companies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, taxId, branchCode, branchName, phone, email, address, isHeadquarter } = req.body;

    const company = await (prisma as any).company.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(taxId !== undefined && { taxId }),
        ...(branchCode && { branchCode }),
        ...(branchName !== undefined && { branchName }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(isHeadquarter !== undefined && { isHeadquarter }),
      },
    });

    res.json({ success: true, data: company });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/companies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, taxId, branchCode, branchName, phone, email, address, isHeadquarter } = req.body;

    const company = await (prisma as any).company.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(taxId !== undefined && { taxId }),
        ...(branchCode && { branchCode }),
        ...(branchName !== undefined && { branchName }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(isHeadquarter !== undefined && { isHeadquarter }),
      },
    });

    res.json({ success: true, data: company });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/companies/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await (prisma as any).company.update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ success: true, data: company });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/companies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    await (prisma as any).company.deleteMany({ where: { id, tenantId } });
    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. UNITS OF MEASURE (UOM)
// ==========================================
router.get('/units', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const units = await prisma.unit.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: units });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/units', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { code, name } = req.body;
    const unit = await prisma.unit.create({
      data: {
        tenantId,
        code: code || name.toUpperCase(),
        name: name || code,
      },
    });
    res.status(201).json({ success: true, data: unit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/units/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { code, name } = req.body;

    const unit = await prisma.unit.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
      },
    });
    res.json({ success: true, data: unit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/units/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { code, name } = req.body;

    const unit = await prisma.unit.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
      },
    });
    res.json({ success: true, data: unit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/units/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const unit = await (prisma.unit as any).update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ success: true, data: unit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/units/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    await prisma.unit.deleteMany({ where: { id, tenantId } });
    res.json({ success: true, message: 'Unit deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. WAREHOUSES & BIN LOCATIONS
// ==========================================
router.get('/warehouses', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const warehouses = await prisma.warehouse.findMany({
      where: { tenantId },
      include: { bins: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: warehouses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/warehouses', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { name, code, binCode } = req.body;
    const whCode = code || `WH-${Math.floor(10 + Math.random() * 90)}`;

    const warehouse = await prisma.warehouse.create({
      data: {
        tenantId,
        name,
        code: whCode,
        bins: {
          create: {
            tenantId,
            code: binCode || `${whCode}-A01`,
          },
        },
      },
      include: { bins: true },
    });

    res.status(201).json({ success: true, data: warehouse });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/warehouses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
      },
    });
    res.json({ success: true, data: warehouse });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/warehouses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
      },
    });
    res.json({ success: true, data: warehouse });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/warehouses/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const warehouse = await (prisma.warehouse as any).update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ success: true, data: warehouse });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/warehouses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    await prisma.warehouse.deleteMany({ where: { id, tenantId } });
    res.json({ success: true, message: 'Warehouse deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/warehouses/:warehouseId/bins', async (req: Request, res: Response) => {
  try {
    const { warehouseId } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { code } = req.body;

    const bin = await prisma.binLocation.create({
      data: {
        tenantId,
        warehouseId,
        code: code || `BIN-${Math.floor(100 + Math.random() * 900)}`,
      },
    });

    res.status(201).json({ success: true, data: bin });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/bins/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code } = req.body;

    const bin = await prisma.binLocation.update({
      where: { id },
      data: {
        ...(code && { code }),
      },
    });
    res.json({ success: true, data: bin });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/bins/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code } = req.body;

    const bin = await prisma.binLocation.update({
      where: { id },
      data: {
        ...(code && { code }),
      },
    });
    res.json({ success: true, data: bin });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/bins/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bin = await (prisma.binLocation as any).update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ success: true, data: bin });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/bins/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    await prisma.binLocation.deleteMany({ where: { id, tenantId } });
    res.json({ success: true, message: 'Bin location deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. SUPPLIERS
// ==========================================
router.get('/suppliers', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const suppliers = await prisma.supplier.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: suppliers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/suppliers', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { name, code, contactPerson, phone } = req.body;
    const supCode = code || `SUP-${Math.floor(100 + Math.random() * 900)}`;

    const supplier = await prisma.supplier.create({
      data: {
        tenantId,
        name,
        code: supCode,
        contactPerson: contactPerson || 'Sales Admin',
        phone: phone || '+66 2 000 0000',
      },
    });

    res.status(201).json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/suppliers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, contactPerson, phone } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(contactPerson !== undefined && { contactPerson }),
        ...(phone !== undefined && { phone }),
      },
    });

    res.json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/suppliers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, contactPerson, phone } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(contactPerson !== undefined && { contactPerson }),
        ...(phone !== undefined && { phone }),
      },
    });

    res.json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/suppliers/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const supplier = await (prisma.supplier as any).update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/suppliers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    await prisma.supplier.deleteMany({ where: { id, tenantId } });
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. USERS & RBAC ACCESS CONTROL
// ==========================================
router.get('/users', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/users', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { email, fullName, role, password } = req.body;

    const passwordHash = await bcrypt.hash(password || 'MatchStock123!', 10);
    const user = await prisma.user.create({
      data: {
        tenantId,
        email: email.trim().toLowerCase(),
        fullName: fullName || email.split('@')[0],
        role: role || 'warehouse_staff',
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/users/:id/role', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { role, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { fullName, role, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName && { fullName }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const { fullName, role, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName && { fullName }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/users/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
    await prisma.user.deleteMany({ where: { id, tenantId } });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
