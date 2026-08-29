import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { z } from 'zod';

const productSchema = z.object({
  code: z.string().min(1, 'Product code is required'),
  sku: z.string().min(1, 'SKU is required'),
  slug: z.string().optional(),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  manufacturerId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  unitId: z.string().optional().nullable(),
  baseUnitId: z.string().optional().nullable(),
  unitOfMeasure: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  barcodeValue: z.string().optional().nullable(),
  barcodeSymbologyId: z.string().optional().nullable(),
  taxTypeId: z.string().optional().nullable(),
  price: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  sellingPriceMinor: z.coerce.number().optional(),
  costPriceMinor: z.coerce.number().optional(),
  currency: z.string().default('THB'),
  weightKg: z.coerce.number().optional(),
  weightValue: z.coerce.number().optional(),
  widthCm: z.coerce.number().optional(),
  widthValue: z.coerce.number().optional(),
  lengthCm: z.coerce.number().optional(),
  lengthValue: z.coerce.number().optional(),
  heightCm: z.coerce.number().optional(),
  heightValue: z.coerce.number().optional(),
  reorderPoint: z.coerce.number().optional(),
  reorderLevel: z.coerce.number().optional(),
  minReorderQuantity: z.coerce.number().optional(),
  minReorderQty: z.coerce.number().optional(),
  isLotControl: z.boolean().optional(),
  lotControlled: z.boolean().optional(),
  isReturnable: z.boolean().optional(),
  isActive: z.boolean().optional(),
  warrantyPeriodDays: z.coerce.number().optional(),
  imageUrl: z.string().optional().nullable(),
});

export const productController = {
  // GET /api/v1/products
  getProducts: async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const { search, categoryId, brandId, page = 1, limit = 100 } = req.query;

      const pageNum = Math.max(1, Number(page));
      const take = Math.min(200, Math.max(1, Number(limit)));
      const skip = (pageNum - 1) * take;

      const whereClause: any = {
        tenantId,
        deletedAt: null,
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
          { barcodeValue: { contains: queryStr, mode: 'insensitive' } },
        ];
      }

      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where: whereClause,
          include: {
            images: true,
            tags: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        prisma.product.count({ where: whereClause }),
      ]);

      const formatted = products.map((p) => {
        const sellingPrice = p.sellingPriceMinor ? Number(p.sellingPriceMinor) / 100 : 0;
        const costPrice = p.costPriceMinor ? Number(p.costPriceMinor) / 100 : 0;
        return {
          id: p.id,
          code: p.code,
          sku: p.sku,
          barcode: p.barcodeValue || '',
          barcodeValue: p.barcodeValue || '',
          slug: p.slug || '',
          name: p.name,
          description: p.description || '',
          price: sellingPrice,
          costPrice: costPrice,
          sellingPriceMinor: Number(p.sellingPriceMinor || 0),
          costPriceMinor: Number(p.costPriceMinor || 0),
          currency: p.currency || 'THB',
          weightKg: Number(p.weightValue || 0),
          weightValue: Number(p.weightValue || 0),
          widthCm: Number(p.widthValue || 0),
          widthValue: Number(p.widthValue || 0),
          lengthCm: Number(p.lengthValue || 0),
          lengthValue: Number(p.lengthValue || 0),
          heightCm: Number(p.heightValue || 0),
          heightValue: Number(p.heightValue || 0),
          reorderPoint: Number(p.reorderPoint || 0),
          reorderLevel: Number(p.reorderPoint || 0),
          minReorderQty: Number(p.minReorderQuantity || 0),
          minReorderQuantity: Number(p.minReorderQuantity || 0),
          isLotControl: p.lotControlled,
          lotControlled: p.lotControlled,
          isReturnable: p.isReturnable,
          isActive: p.isActive,
          warrantyPeriodDays: p.warrantyPeriodDays || 0,
          stockOnHand: p.tags?.length || 0,
          uom: p.unitOfMeasure || 'PCS',
          unitId: p.unitId,
          categoryId: p.categoryId,
          brandId: p.brandId,
          supplierId: p.supplierId,
          barcodeSymbologyId: p.barcodeSymbologyId,
          taxTypeId: p.taxTypeId,
          imageUrl: p.images?.[0]?.url || '',
          images: p.images || [],
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
          images: true,
          tags: true,
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
      const validated = productSchema.parse(req.body);

      const sellingPriceMinor = validated.sellingPriceMinor ?? (validated.price !== undefined ? Math.round(validated.price * 100) : 0);
      const costPriceMinor = validated.costPriceMinor ?? (validated.costPrice !== undefined ? Math.round(validated.costPrice * 100) : 0);
      const barcodeValue = validated.barcodeValue || validated.barcode || null;
      const slug = validated.slug || `${validated.sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

      const newProduct = await prisma.product.create({
        data: {
          tenantId,
          code: validated.code,
          sku: validated.sku,
          slug,
          name: validated.name,
          description: validated.description || null,
          unitId: validated.unitId || validated.baseUnitId || null,
          unitOfMeasure: validated.unitOfMeasure || 'PCS',
          categoryId: validated.categoryId || null,
          brandId: validated.brandId || null,
          manufacturerId: validated.manufacturerId || null,
          supplierId: validated.supplierId || null,
          barcodeValue,
          barcodeSymbologyId: validated.barcodeSymbologyId || null,
          taxTypeId: validated.taxTypeId || null,
          sellingPriceMinor: BigInt(sellingPriceMinor),
          costPriceMinor: BigInt(costPriceMinor),
          currency: validated.currency || 'THB',
          weightValue: validated.weightValue ?? validated.weightKg ?? 0,
          widthValue: validated.widthValue ?? validated.widthCm ?? 0,
          lengthValue: validated.lengthValue ?? validated.lengthCm ?? 0,
          heightValue: validated.heightValue ?? validated.heightCm ?? 0,
          reorderPoint: validated.reorderPoint ?? validated.reorderLevel ?? 10,
          minReorderQuantity: validated.minReorderQuantity ?? validated.minReorderQty ?? 5,
          lotControlled: validated.lotControlled ?? validated.isLotControl ?? false,
          isReturnable: validated.isReturnable ?? false,
          isActive: validated.isActive ?? true,
          warrantyPeriodDays: validated.warrantyPeriodDays ?? 0,
        },
        include: {
          images: true,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: {
          ...newProduct,
          sellingPriceMinor: Number(newProduct.sellingPriceMinor || 0),
          costPriceMinor: Number(newProduct.costPriceMinor || 0),
        },
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

  // PUT & PATCH /api/v1/products/:id
  updateProduct: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const validated = productSchema.partial().parse(req.body);

      const existing = await prisma.product.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const updateData: any = {};
      if (validated.name !== undefined) updateData.name = validated.name;
      if (validated.code !== undefined) updateData.code = validated.code;
      if (validated.sku !== undefined) updateData.sku = validated.sku;
      if (validated.slug !== undefined) updateData.slug = validated.slug;
      if (validated.description !== undefined) updateData.description = validated.description;
      if (validated.categoryId !== undefined) updateData.categoryId = validated.categoryId;
      if (validated.brandId !== undefined) updateData.brandId = validated.brandId;
      if (validated.manufacturerId !== undefined) updateData.manufacturerId = validated.manufacturerId;
      if (validated.supplierId !== undefined) updateData.supplierId = validated.supplierId;
      if (validated.unitId !== undefined) updateData.unitId = validated.unitId;
      if (validated.unitOfMeasure !== undefined) updateData.unitOfMeasure = validated.unitOfMeasure;
      if (validated.barcodeValue !== undefined || validated.barcode !== undefined) {
        updateData.barcodeValue = validated.barcodeValue ?? validated.barcode;
      }
      if (validated.barcodeSymbologyId !== undefined) updateData.barcodeSymbologyId = validated.barcodeSymbologyId;
      if (validated.taxTypeId !== undefined) updateData.taxTypeId = validated.taxTypeId;
      if (validated.sellingPriceMinor !== undefined) {
        updateData.sellingPriceMinor = BigInt(validated.sellingPriceMinor);
      } else if (validated.price !== undefined) {
        updateData.sellingPriceMinor = BigInt(Math.round(validated.price * 100));
      }
      if (validated.costPriceMinor !== undefined) {
        updateData.costPriceMinor = BigInt(validated.costPriceMinor);
      } else if (validated.costPrice !== undefined) {
        updateData.costPriceMinor = BigInt(Math.round(validated.costPrice * 100));
      }
      if (validated.weightValue !== undefined || validated.weightKg !== undefined) {
        updateData.weightValue = validated.weightValue ?? validated.weightKg;
      }
      if (validated.widthValue !== undefined || validated.widthCm !== undefined) {
        updateData.widthValue = validated.widthValue ?? validated.widthCm;
      }
      if (validated.lengthValue !== undefined || validated.lengthCm !== undefined) {
        updateData.lengthValue = validated.lengthValue ?? validated.lengthCm;
      }
      if (validated.heightValue !== undefined || validated.heightCm !== undefined) {
        updateData.heightValue = validated.heightValue ?? validated.heightCm;
      }
      if (validated.reorderPoint !== undefined || validated.reorderLevel !== undefined) {
        updateData.reorderPoint = validated.reorderPoint ?? validated.reorderLevel;
      }
      if (validated.minReorderQuantity !== undefined || validated.minReorderQty !== undefined) {
        updateData.minReorderQuantity = validated.minReorderQuantity ?? validated.minReorderQty;
      }
      if (validated.lotControlled !== undefined || validated.isLotControl !== undefined) {
        updateData.lotControlled = validated.lotControlled ?? validated.isLotControl;
      }
      if (validated.isReturnable !== undefined) updateData.isReturnable = validated.isReturnable;
      if (validated.isActive !== undefined) updateData.isActive = validated.isActive;
      if (validated.warrantyPeriodDays !== undefined) updateData.warrantyPeriodDays = validated.warrantyPeriodDays;

      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          images: true,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: {
          ...updated,
          sellingPriceMinor: Number(updated.sellingPriceMinor || 0),
          costPriceMinor: Number(updated.costPriceMinor || 0),
        },
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

      await prisma.product.update({
        where: { id },
        data: { deletedAt: new Date(), isActive: false },
      });

      res.status(200).json({
        success: true,
        message: 'Product deactivated/deleted successfully',
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
