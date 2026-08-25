import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { z } from 'zod';

const receiveSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  supplierId: z.string().optional(),
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      binLocationId: z.string().optional(),
      quantity: z.coerce.number().positive('Quantity must be greater than 0'),
      unitPrice: z.coerce.number().optional().default(0),
      lotNumber: z.string().optional(),
      manufacturedDate: z.string().optional(),
      expirationDate: z.string().optional(),
    })
  ).min(1, 'At least one item is required'),
});

const issueSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  recipient: z.string().optional(),
  reason: z.string().optional().default('Sales Order Dispatch'),
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      binLocationId: z.string().optional(),
      lotId: z.string().optional(),
      quantity: z.coerce.number().positive('Quantity must be greater than 0'),
      unitPrice: z.coerce.number().optional().default(0),
    })
  ).min(1, 'At least one item is required'),
});

const transferSchema = z.object({
  fromWarehouseId: z.string().min(1, 'Source Warehouse ID is required'),
  toWarehouseId: z.string().min(1, 'Destination Warehouse ID is required'),
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      fromBinLocationId: z.string().optional(),
      toBinLocationId: z.string().optional(),
      lotId: z.string().optional(),
      quantity: z.coerce.number().positive('Quantity must be greater than 0'),
    })
  ).min(1, 'At least one item is required'),
});

const adjustSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  direction: z.enum(['INCREASE', 'DECREASE']),
  reason: z.string().min(1, 'Adjustment reason is required'),
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      binLocationId: z.string().optional(),
      lotId: z.string().optional(),
      quantity: z.coerce.number().positive('Quantity must be greater than 0'),
      unitPrice: z.coerce.number().optional().default(0),
    })
  ).min(1, 'At least one item is required'),
});

export const transactionController = {
  // GET /api/v1/inventory/transactions
  getTransactions: async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const { type, search, page = 1, limit = 50 } = req.query;

      const pageNum = Math.max(1, Number(page));
      const take = Math.min(100, Math.max(1, Number(limit)));
      const skip = (pageNum - 1) * take;

      const whereClause: any = { tenantId };
      if (type && String(type).toUpperCase() !== 'ALL') {
        whereClause.transactionType = String(type).toUpperCase();
      }
      if (search) {
        const queryStr = String(search).trim();
        whereClause.OR = [
          { documentNo: { contains: queryStr, mode: 'insensitive' } },
          { supplier: { name: { contains: queryStr, mode: 'insensitive' } } },
          { items: { some: { product: { name: { contains: queryStr, mode: 'insensitive' } } } } },
        ];
      }

      const [transactions, totalCount] = await Promise.all([
        prisma.stockTransaction.findMany({
          where: whereClause,
          include: {
            supplier: true,
            creator: true,
            items: {
              include: {
                product: { include: { baseUnit: true } },
                lot: true,
                fromWarehouse: true,
                fromBinLocation: true,
                toWarehouse: true,
                toBinLocation: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        prisma.stockTransaction.count({ where: whereClause }),
      ]);

      const formatted = transactions.map((tx) => {
        const totalQty = tx.items.reduce((sum, item) => sum + Number(item.quantity), 0);
        const totalValue = tx.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice || 0), 0);

        return {
          id: tx.id,
          documentNo: tx.documentNo,
          type: tx.transactionType,
          status: tx.status,
          date: tx.createdAt.toISOString().replace('T', ' ').slice(0, 16),
          supplierName: tx.supplier?.name,
          creatorName: tx.creator?.fullName || 'System Admin',
          totalQuantity: totalQty,
          totalValue,
          itemsCount: tx.items.length,
          items: tx.items.map((it) => ({
            id: it.id,
            productId: it.productId,
            productCode: it.product.code,
            productName: it.product.name,
            sku: it.product.sku,
            uom: it.product.baseUnit?.code || 'PCS',
            quantity: Number(it.quantity),
            unitPrice: Number(it.unitPrice || 0),
            totalPrice: Number(it.quantity) * Number(it.unitPrice || 0),
            lotNumber: it.lot?.lotNumber,
            mfgDate: it.lot?.manufacturedDate?.toISOString().slice(0, 10),
            expDate: it.lot?.expirationDate?.toISOString().slice(0, 10),
            fromWarehouseId: it.fromWarehouseId,
            fromWarehouseName: it.fromWarehouse?.name,
            fromBinCode: it.fromBinLocation?.code,
            toWarehouseId: it.toWarehouseId,
            toWarehouseName: it.toWarehouse?.name,
            toBinCode: it.toBinLocation?.code,
          })),
        };
      });

      res.status(200).json({
        success: true,
        data: formatted,
        meta: {
          page: pageNum,
          limit: take,
          total: totalCount,
          totalPages: Math.ceil(totalCount / take),
        },
      });
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions',
        error: error?.message,
      });
    }
  },

  // GET /api/v1/inventory/balances
  getBalances: async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const { productId, warehouseId } = req.query;

      const whereClause: any = { tenantId };
      if (productId) whereClause.productId = String(productId);
      if (warehouseId) whereClause.warehouseId = String(warehouseId);

      const balances = await prisma.inventoryBalance.findMany({
        where: whereClause,
        include: {
          product: { include: { baseUnit: true } },
          warehouse: true,
          binLocation: true,
          lot: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        data: balances.map((b) => ({
          id: b.id,
          productId: b.productId,
          productCode: b.product.code,
          productName: b.product.name,
          sku: b.product.sku,
          warehouseId: b.warehouseId,
          warehouseName: b.warehouse.name,
          binCode: b.binLocation?.code || 'Default',
          lotNumber: b.lot?.lotNumber || 'N/A',
          quantityOnHand: Number(b.quantityOnHand),
          quantityReserved: Number(b.quantityReserved),
          unit: b.product.baseUnit?.code || 'PCS',
          updatedAt: b.updatedAt.toISOString(),
        })),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/v1/inventory/transactions/receive (Goods Receive)
  receiveStock: async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const validated = receiveSchema.parse(req.body);

      const now = new Date();
      const docCount = await prisma.stockTransaction.count({
        where: { tenantId, transactionType: 'RECEIVE' },
      });
      const documentNo = `GR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        docCount + 1
      ).padStart(4, '0')}`;

      const result = await prisma.$transaction(async (tx) => {
        // 1. Create Stock Transaction Record
        const stockTx = await tx.stockTransaction.create({
          data: {
            tenantId,
            transactionType: 'RECEIVE',
            documentNo,
            supplierId: validated.supplierId || null,
            status: 'COMPLETED',
          },
        });

        // 2. Process Items
        for (const item of validated.items) {
          let lotId: string | null = null;
          if (item.lotNumber) {
            const lot = await tx.productLot.upsert({
              where: {
                tenantId_productId_lotNumber: {
                  tenantId,
                  productId: item.productId,
                  lotNumber: item.lotNumber,
                },
              },
              update: {},
              create: {
                tenantId,
                productId: item.productId,
                lotNumber: item.lotNumber,
                manufacturedDate: item.manufacturedDate ? new Date(item.manufacturedDate) : null,
                expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
              },
            });
            lotId = lot.id;
          }

          // Create Transaction Item
          await tx.stockTransactionItem.create({
            data: {
              tenantId,
              transactionId: stockTx.id,
              productId: item.productId,
              toWarehouseId: validated.warehouseId,
              toBinLocationId: item.binLocationId || null,
              lotId,
              quantity: item.quantity,
              unitPrice: item.unitPrice || 0,
            },
          });

          // Increment Inventory Balance
          const existingBalance = await tx.inventoryBalance.findFirst({
            where: {
              tenantId,
              productId: item.productId,
              warehouseId: validated.warehouseId,
              binLocationId: item.binLocationId || null,
              lotId,
            },
          });

          if (existingBalance) {
            await tx.inventoryBalance.update({
              where: { id: existingBalance.id },
              data: {
                quantityOnHand: { increment: item.quantity },
              },
            });
          } else {
            await tx.inventoryBalance.create({
              data: {
                tenantId,
                productId: item.productId,
                warehouseId: validated.warehouseId,
                binLocationId: item.binLocationId || null,
                lotId,
                quantityOnHand: item.quantity,
                quantityReserved: 0,
              },
            });
          }
        }

        return stockTx;
      });

      res.status(201).json({
        success: true,
        message: 'Goods receive recorded and inventory updated successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Error in receiveStock:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // POST /api/v1/inventory/transactions/issue (Goods Issue)
  issueStock: async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const validated = issueSchema.parse(req.body);

      const now = new Date();
      const docCount = await prisma.stockTransaction.count({
        where: { tenantId, transactionType: 'ISSUE' },
      });
      const documentNo = `GI-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        docCount + 1
      ).padStart(4, '0')}`;

      const result = await prisma.$transaction(async (tx) => {
        const stockTx = await tx.stockTransaction.create({
          data: {
            tenantId,
            transactionType: 'ISSUE',
            documentNo,
            status: 'COMPLETED',
          },
        });

        for (const item of validated.items) {
          await tx.stockTransactionItem.create({
            data: {
              tenantId,
              transactionId: stockTx.id,
              productId: item.productId,
              fromWarehouseId: validated.warehouseId,
              fromBinLocationId: item.binLocationId || null,
              lotId: item.lotId || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice || 0,
            },
          });

          // Decrement Inventory Balance
          const existingBalance = await tx.inventoryBalance.findFirst({
            where: {
              tenantId,
              productId: item.productId,
              warehouseId: validated.warehouseId,
              binLocationId: item.binLocationId || null,
              lotId: item.lotId || null,
            },
          });

          if (existingBalance) {
            await tx.inventoryBalance.update({
              where: { id: existingBalance.id },
              data: {
                quantityOnHand: { decrement: item.quantity },
              },
            });
          }
        }

        return stockTx;
      });

      res.status(201).json({
        success: true,
        message: 'Goods issue recorded and stock decremented successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // POST /api/v1/inventory/transactions/transfer (Stock Transfer)
  transferStock: async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const validated = transferSchema.parse(req.body);

      const now = new Date();
      const docCount = await prisma.stockTransaction.count({
        where: { tenantId, transactionType: 'TRANSFER' },
      });
      const documentNo = `TR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        docCount + 1
      ).padStart(4, '0')}`;

      const result = await prisma.$transaction(async (tx) => {
        const stockTx = await tx.stockTransaction.create({
          data: {
            tenantId,
            transactionType: 'TRANSFER',
            documentNo,
            status: 'COMPLETED',
          },
        });

        for (const item of validated.items) {
          await tx.stockTransactionItem.create({
            data: {
              tenantId,
              transactionId: stockTx.id,
              productId: item.productId,
              fromWarehouseId: validated.fromWarehouseId,
              fromBinLocationId: item.fromBinLocationId || null,
              toWarehouseId: validated.toWarehouseId,
              toBinLocationId: item.toBinLocationId || null,
              lotId: item.lotId || null,
              quantity: item.quantity,
            },
          });

          // Decrement from source
          const sourceBalance = await tx.inventoryBalance.findFirst({
            where: {
              tenantId,
              productId: item.productId,
              warehouseId: validated.fromWarehouseId,
              binLocationId: item.fromBinLocationId || null,
              lotId: item.lotId || null,
            },
          });
          if (sourceBalance) {
            await tx.inventoryBalance.update({
              where: { id: sourceBalance.id },
              data: { quantityOnHand: { decrement: item.quantity } },
            });
          }

          // Increment to destination
          const destBalance = await tx.inventoryBalance.findFirst({
            where: {
              tenantId,
              productId: item.productId,
              warehouseId: validated.toWarehouseId,
              binLocationId: item.toBinLocationId || null,
              lotId: item.lotId || null,
            },
          });
          if (destBalance) {
            await tx.inventoryBalance.update({
              where: { id: destBalance.id },
              data: { quantityOnHand: { increment: item.quantity } },
            });
          } else {
            await tx.inventoryBalance.create({
              data: {
                tenantId,
                productId: item.productId,
                warehouseId: validated.toWarehouseId,
                binLocationId: item.toBinLocationId || null,
                lotId: item.lotId || null,
                quantityOnHand: item.quantity,
              },
            });
          }
        }

        return stockTx;
      });

      res.status(201).json({
        success: true,
        message: 'Stock transfer completed successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // POST /api/v1/inventory/transactions/adjust (Stock Adjustment)
  adjustStock: async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const validated = adjustSchema.parse(req.body);

      const now = new Date();
      const docCount = await prisma.stockTransaction.count({
        where: { tenantId, transactionType: 'ADJUSTMENT' },
      });
      const documentNo = `ADJ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        docCount + 1
      ).padStart(4, '0')}`;

      const result = await prisma.$transaction(async (tx) => {
        const stockTx = await tx.stockTransaction.create({
          data: {
            tenantId,
            transactionType: 'ADJUSTMENT',
            documentNo,
            status: 'COMPLETED',
          },
        });

        for (const item of validated.items) {
          await tx.stockTransactionItem.create({
            data: {
              tenantId,
              transactionId: stockTx.id,
              productId: item.productId,
              fromWarehouseId: validated.direction === 'DECREASE' ? validated.warehouseId : null,
              toWarehouseId: validated.direction === 'INCREASE' ? validated.warehouseId : null,
              fromBinLocationId: validated.direction === 'DECREASE' ? item.binLocationId || null : null,
              toBinLocationId: validated.direction === 'INCREASE' ? item.binLocationId || null : null,
              lotId: item.lotId || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice || 0,
            },
          });

          const existingBalance = await tx.inventoryBalance.findFirst({
            where: {
              tenantId,
              productId: item.productId,
              warehouseId: validated.warehouseId,
              binLocationId: item.binLocationId || null,
              lotId: item.lotId || null,
            },
          });

          if (existingBalance) {
            await tx.inventoryBalance.update({
              where: { id: existingBalance.id },
              data: {
                quantityOnHand:
                  validated.direction === 'INCREASE'
                    ? { increment: item.quantity }
                    : { decrement: item.quantity },
              },
            });
          } else if (validated.direction === 'INCREASE') {
            await tx.inventoryBalance.create({
              data: {
                tenantId,
                productId: item.productId,
                warehouseId: validated.warehouseId,
                binLocationId: item.binLocationId || null,
                lotId: item.lotId || null,
                quantityOnHand: item.quantity,
              },
            });
          }
        }

        return stockTx;
      });

      res.status(201).json({
        success: true,
        message: `Stock adjustment (${validated.direction}) recorded successfully`,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
