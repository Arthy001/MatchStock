import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { z } from 'zod';

const createProductSchema = z.object({
  code: z.string().min(1, 'Product code is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  baseUnitId: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  price: z.coerce.number().min(0).default(0),
  weightKg: z.coerce.number().optional(),
  widthCm: z.coerce.number().optional(),
  lengthCm: z.coerce.number().optional(),
  heightCm: z.coerce.number().optional(),
  reorderPoint: z.coerce.number().optional(),
  minReorderQty: z.coerce.number().optional(),
  isLotControl: z.boolean().optional(),
  initialStock: z.coerce.number().optional(),
});

export const productController = {
  // GET /api/v1/products
  getProducts: async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const { search, categoryId, brandId, page = 1, limit = 50 } = req.query;

      const pageNum = Math.max(1, Number(page));
      const take = Math.min(100, Math.max(1, Number(limit)));
      const skip = (pageNum - 1) * take;

      const whereClause: any = {
        tenantId,
      };

      if (categoryId) {
        whereClause.categoryId = String(categoryId);
      }
      if (brandId) {
        whereClause.brandId = String(brandId);
      }
      if (search) {
        const queryStr = String(search).trim();
        whereClause.OR = [
          { name: { contains: queryStr, mode: 'insensitive' } },
          { sku: { contains: queryStr, mode: 'insensitive' } },
          { code: { contains: queryStr, mode: 'insensitive' } },
          { barcode: { contains: queryStr, mode: 'insensitive' } },
        ];
      }

      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where: whereClause,
          include: {
            baseUnit: true,
            category: true,
            brand: true,
            inventoryBalances: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        prisma.product.count({ where: whereClause }),
      ]);

      const formatted = products.map((p) => {
        const totalOnHand = p.inventoryBalances.reduce((sum, b) => sum + Number(b.quantityOnHand), 0);
        return {
          id: p.id,
          code: p.code,
          sku: p.sku,
          barcode: p.barcode || '',
          slug: p.slug || '',
          name: p.name,
          description: p.description || '',
          price: Number(p.price),
          weightKg: Number(p.weightKg || 0),
          widthCm: Number(p.widthCm || 0),
          lengthCm: Number(p.lengthCm || 0),
          heightCm: Number(p.heightCm || 0),
          reorderPoint: Number(p.reorderPoint || 0),
          minReorderQty: Number(p.minReorderQty || 0),
          isLotControl: p.isLotControl,
          stockOnHand: totalOnHand,
          unit: p.baseUnit?.code || 'PCS',
          category: p.category?.name || 'General',
          brand: p.brand?.name || 'MatchStock',
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
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
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error?.message || 'Internal Server Error',
      });
    }
  },

  // GET /api/v1/products/:id
  getProductById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';

      const product = await prisma.product.findFirst({
        where: { id, tenantId },
        include: {
          baseUnit: true,
          category: true,
          brand: true,
          inventoryBalances: true,
          images: true,
        },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      console.error('Error fetching product by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: error?.message,
      });
    }
  },

  // POST /api/v1/products
  createProduct: async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const validated = createProductSchema.parse(req.body);

      // Ensure base unit exists for tenant or fallback
      let baseUnitId = validated.baseUnitId;
      if (!baseUnitId) {
        const defaultUnit = await prisma.unit.findFirst({
          where: { tenantId },
        });
        if (defaultUnit) {
          baseUnitId = defaultUnit.id;
        } else {
          const newUnit = await prisma.unit.create({
            data: {
              tenantId,
              code: 'PCS',
              name: 'Pieces',
            },
          });
          baseUnitId = newUnit.id;
        }
      }

      const newProduct = await prisma.product.create({
        data: {
          tenantId,
          code: validated.code,
          sku: validated.sku,
          barcode: validated.barcode,
          name: validated.name,
          description: validated.description,
          baseUnitId,
          categoryId: validated.categoryId || null,
          brandId: validated.brandId || null,
          price: validated.price,
          weightKg: validated.weightKg || 0,
          widthCm: validated.widthCm || 0,
          lengthCm: validated.lengthCm || 0,
          heightCm: validated.heightCm || 0,
          reorderPoint: validated.reorderPoint || 0,
          minReorderQty: validated.minReorderQty || 0,
          isLotControl: validated.isLotControl || false,
        },
        include: {
          baseUnit: true,
          category: true,
          brand: true,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: newProduct,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error?.message,
      });
    }
  },

  // PUT /api/v1/products/:id
  updateProduct: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const validated = createProductSchema.partial().parse(req.body);

      const existing = await prisma.product.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const updated = await prisma.product.update({
        where: { id },
        data: {
          ...(validated.name && { name: validated.name }),
          ...(validated.code && { code: validated.code }),
          ...(validated.sku && { sku: validated.sku }),
          ...(validated.barcode !== undefined && { barcode: validated.barcode }),
          ...(validated.description !== undefined && { description: validated.description }),
          ...(validated.price !== undefined && { price: validated.price }),
          ...(validated.weightKg !== undefined && { weightKg: validated.weightKg }),
          ...(validated.widthCm !== undefined && { widthCm: validated.widthCm }),
          ...(validated.lengthCm !== undefined && { lengthCm: validated.lengthCm }),
          ...(validated.heightCm !== undefined && { heightCm: validated.heightCm }),
          ...(validated.categoryId !== undefined && { categoryId: validated.categoryId }),
          ...(validated.brandId !== undefined && { brandId: validated.brandId }),
          ...(validated.reorderPoint !== undefined && { reorderPoint: validated.reorderPoint }),
          ...(validated.minReorderQty !== undefined && { minReorderQty: validated.minReorderQty }),
          ...(validated.isLotControl !== undefined && { isLotControl: validated.isLotControl }),
        },
        include: {
          baseUnit: true,
          category: true,
          brand: true,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updated,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error?.message,
      });
    }
  },

  // DELETE /api/v1/products/:id
  deleteProduct: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';

      const existing = await prisma.product.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      await prisma.product.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error?.message,
      });
    }
  },
};
