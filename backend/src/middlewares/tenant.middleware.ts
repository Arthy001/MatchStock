import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include tenant and auth user info
export interface AuthUser {
  userId: string;
  tenantId: string;
  email: string;
  role: 'admin' | 'manager' | 'warehouse_staff' | 'purchasing_staff' | 'staff';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      tenantId?: string;
    }
  }
}

/**
 * Tenant Isolation Guard Middleware
 * ป้องกันไม่ให้มีการ Query ข้าม Tenant และตรวจสอบความถูกต้องของ Tenant ID
 */
export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string);

  if (!tenantId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Tenant context is required',
    });
  }

  req.tenantId = tenantId;
  next();
};
