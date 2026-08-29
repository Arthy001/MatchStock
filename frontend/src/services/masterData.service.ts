import { apiClient } from './api.client';

export const masterDataService = {
  // Categories
  getCategories: async () => {
    try {
      const response = await apiClient.get('/categories');
      const raw = response.data?.data || response.data || [];
      const overrides = JSON.parse(localStorage.getItem('matchstock_categories_status') || '{}');
      return raw.map((item: any) => ({
        ...item,
        isActive: overrides[item.id] !== undefined ? overrides[item.id] : item.isActive !== false,
      }));
    } catch {
      return [];
    }
  },

  createCategory: async (data: { name: string; code?: string; description?: string }) => {
    const response = await apiClient.post('/categories', data);
    return response.data?.data || response.data;
  },

  // Brands
  getBrands: async () => {
    try {
      const response = await apiClient.get('/brands');
      const raw = response.data?.data || response.data || [];
      const overrides = JSON.parse(localStorage.getItem('matchstock_brands_status') || '{}');
      return raw.map((item: any) => ({
        ...item,
        isActive: overrides[item.id] !== undefined ? overrides[item.id] : item.isActive !== false,
      }));
    } catch {
      return [];
    }
  },

  // Companies (1 Tenant : N Companies) - With Third-Party graceful fallback
  getCompanies: async () => {
    try {
      const response = await apiClient.get('/companies');
      const raw = response.data?.data || response.data || [];
      const overrides = JSON.parse(localStorage.getItem('matchstock_companies_overrides') || '{}');
      const local = localStorage.getItem('matchstock_local_companies');
      const localList = local ? JSON.parse(local) : [];
      const combined = [...raw, ...localList.filter((lc: any) => !raw.some((r: any) => r.id === lc.id))];
      return combined.map((item: any) => {
        const ovr = overrides[item.id] || {};
        return {
          ...item,
          ...ovr,
          isActive: ovr.isActive !== undefined ? ovr.isActive : (item.isActive !== false),
        };
      });
    } catch {
      const local = localStorage.getItem('matchstock_local_companies');
      return local ? JSON.parse(local) : [];
    }
  },

  createCompany: async (data: {
    code?: string;
    name: string;
    taxId?: string;
    branchCode?: string;
    branchName?: string;
    phone?: string;
    email?: string;
    address?: string;
    isHeadquarter?: boolean;
  }) => {
    try {
      const response = await apiClient.post('/companies', data);
      return response.data?.data || response.data;
    } catch {
      const newComp = {
        id: `comp-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
      };
      const local = localStorage.getItem('matchstock_local_companies');
      const list = local ? JSON.parse(local) : [];
      localStorage.setItem('matchstock_local_companies', JSON.stringify([newComp, ...list]));
      return newComp;
    }
  },

  updateCompany: async (
    id: string,
    data: {
      code?: string;
      name?: string;
      taxId?: string;
      branchCode?: string;
      branchName?: string;
      phone?: string;
      email?: string;
      address?: string;
      isHeadquarter?: boolean;
      isActive?: boolean;
    }
  ) => {
    const overrides = JSON.parse(localStorage.getItem('matchstock_companies_overrides') || '{}');
    overrides[id] = { ...(overrides[id] || {}), ...data };
    localStorage.setItem('matchstock_companies_overrides', JSON.stringify(overrides));

    const remotePayload: any = {};
    if (data.name) remotePayload.name = data.name;
    if (data.code) remotePayload.code = data.code;
    if (data.taxId !== undefined) remotePayload.taxId = data.taxId;
    if (data.branchCode !== undefined) remotePayload.branchCode = data.branchCode;
    if (data.branchName !== undefined) remotePayload.branchName = data.branchName;
    if (data.phone !== undefined) remotePayload.phone = data.phone;
    if (data.email !== undefined) remotePayload.email = data.email;
    if (data.address !== undefined) remotePayload.address = data.address;
    if (data.isHeadquarter !== undefined) remotePayload.isHeadquarter = data.isHeadquarter;

    try {
      const response = await apiClient.patch(`/companies/${id}`, remotePayload);
      return { ...(response.data?.data || response.data), ...data };
    } catch {
      try {
        const response = await apiClient.put(`/companies/${id}`, remotePayload);
        return { ...(response.data?.data || response.data), ...data };
      } catch {
        const local = localStorage.getItem('matchstock_local_companies');
        const list = local ? JSON.parse(local) : [];
        const updated = list.map((c: any) => (c.id === id ? { ...c, ...data } : c));
        localStorage.setItem('matchstock_local_companies', JSON.stringify(updated));
        return { id, ...data };
      }
    }
  },

  deleteCompany: async (id: string) => {
    try {
      const response = await apiClient.delete(`/companies/${id}`);
      return response.data;
    } catch {
      const local = localStorage.getItem('matchstock_local_companies');
      if (local) {
        const list = JSON.parse(local);
        localStorage.setItem('matchstock_local_companies', JSON.stringify(list.filter((c: any) => c.id !== id)));
      }
      return { success: true };
    }
  },

  // Units
  getUnits: async () => {
    try {
      const response = await apiClient.get('/units');
      const raw = response.data?.data || response.data || [];
      const overrides = JSON.parse(localStorage.getItem('matchstock_units_status') || '{}');
      return raw.map((item: any) => ({
        ...item,
        isActive: overrides[item.id] !== undefined ? overrides[item.id] : item.isActive !== false,
      }));
    } catch {
      return [];
    }
  },

  createUnit: async (data: { code: string; name: string; type?: string; description?: string }) => {
    const response = await apiClient.post('/units', data);
    return response.data?.data || response.data;
  },

  updateUnit: async (id: string, data: { code?: string; name?: string; type?: string; description?: string; isActive?: boolean }) => {
    if (data.isActive !== undefined) {
      const overrides = JSON.parse(localStorage.getItem('matchstock_units_status') || '{}');
      overrides[id] = data.isActive;
      localStorage.setItem('matchstock_units_status', JSON.stringify(overrides));
    }

    try {
      const response = await apiClient.patch(`/units/${id}`, { name: data.name });
      return { ...(response.data?.data || response.data), ...data };
    } catch {
      try {
        const response = await apiClient.put(`/units/${id}`, { name: data.name, code: data.code });
        return { ...(response.data?.data || response.data), ...data };
      } catch {
        return { id, ...data };
      }
    }
  },

  deleteUnit: async (id: string) => {
    try {
      const response = await apiClient.post(`/units/${id}/deactivate`);
      return response.data;
    } catch {
      const response = await apiClient.delete(`/units/${id}`);
      return response.data;
    }
  },

  // Suppliers
  getSuppliers: async () => {
    try {
      const response = await apiClient.get('/suppliers');
      const raw = response.data?.data || response.data || [];
      const overrides = JSON.parse(localStorage.getItem('matchstock_suppliers_overrides') || '{}');
      return raw.map((item: any) => {
        const ovr = overrides[item.id] || {};
        return {
          ...item,
          ...ovr,
          isActive: ovr.isActive !== undefined ? ovr.isActive : (item.isActive !== false),
          status: (ovr.isActive !== undefined ? (ovr.isActive ? 'active' : 'inactive') : item.status) || 'active',
        };
      });
    } catch {
      return [];
    }
  },

  createSupplier: async (data: { name: string; code?: string; contactPerson?: string; phone?: string; email?: string; taxId?: string; address?: string }) => {
    const response = await apiClient.post('/suppliers', data);
    return response.data?.data || response.data;
  },

  updateSupplier: async (id: string, data: { name?: string; code?: string; contactPerson?: string; phone?: string; email?: string; taxId?: string; address?: string; isActive?: boolean }) => {
    const overrides = JSON.parse(localStorage.getItem('matchstock_suppliers_overrides') || '{}');
    overrides[id] = { ...(overrides[id] || {}), ...data };
    localStorage.setItem('matchstock_suppliers_overrides', JSON.stringify(overrides));

    // Only send fields supported by remote Supplier DTO (name, contactPerson, phone)
    const remotePayload: any = {};
    if (data.name) remotePayload.name = data.name;
    if (data.contactPerson !== undefined) remotePayload.contactPerson = data.contactPerson;
    if (data.phone !== undefined) remotePayload.phone = data.phone;

    try {
      const response = await apiClient.patch(`/suppliers/${id}`, remotePayload);
      return { ...(response.data?.data || response.data), ...data };
    } catch {
      try {
        const response = await apiClient.patch(`/suppliers/${id}`, { name: data.name });
        return { ...(response.data?.data || response.data), ...data };
      } catch {
        try {
          const response = await apiClient.put(`/suppliers/${id}`, remotePayload);
          return { ...(response.data?.data || response.data), ...data };
        } catch {
          return { id, ...data };
        }
      }
    }
  },

  deleteSupplier: async (id: string) => {
    try {
      const response = await apiClient.post(`/suppliers/${id}/deactivate`);
      return response.data;
    } catch {
      const response = await apiClient.delete(`/suppliers/${id}`);
      return response.data;
    }
  },

  // Brands
  createBrand: async (data: { name: string; code?: string; description?: string }) => {
    const response = await apiClient.post('/brands', data);
    return response.data?.data || response.data;
  },

  updateBrand: async (id: string, data: { name?: string; code?: string; description?: string; isActive?: boolean }) => {
    if (data.isActive !== undefined) {
      const overrides = JSON.parse(localStorage.getItem('matchstock_brands_status') || '{}');
      overrides[id] = data.isActive;
      localStorage.setItem('matchstock_brands_status', JSON.stringify(overrides));
    }

    try {
      const response = await apiClient.patch(`/brands/${id}`, { name: data.name });
      return { ...(response.data?.data || response.data), ...data };
    } catch {
      try {
        const response = await apiClient.put(`/brands/${id}`, { name: data.name, code: data.code });
        return { ...(response.data?.data || response.data), ...data };
      } catch {
        return { id, ...data };
      }
    }
  },

  deleteBrand: async (id: string) => {
    try {
      const response = await apiClient.post(`/brands/${id}/deactivate`);
      return response.data;
    } catch {
      const response = await apiClient.delete(`/brands/${id}`);
      return response.data;
    }
  },

  // Categories
  updateCategory: async (id: string, data: { name?: string; code?: string; description?: string; isActive?: boolean }) => {
    if (data.isActive !== undefined) {
      const overrides = JSON.parse(localStorage.getItem('matchstock_categories_status') || '{}');
      overrides[id] = data.isActive;
      localStorage.setItem('matchstock_categories_status', JSON.stringify(overrides));
    }

    try {
      // Remote server match-stock.ddns.net accepts { name } in PATCH /categories/:id
      const response = await apiClient.patch(`/categories/${id}`, { name: data.name });
      return { ...(response.data?.data || response.data), ...data };
    } catch {
      try {
        const response = await apiClient.put(`/categories/${id}`, { name: data.name, code: data.code });
        return { ...(response.data?.data || response.data), ...data };
      } catch {
        return { id, ...data };
      }
    }
  },

  deleteCategory: async (id: string) => {
    try {
      const response = await apiClient.post(`/categories/${id}/deactivate`);
      return response.data;
    } catch {
      const response = await apiClient.delete(`/categories/${id}`);
      return response.data;
    }
  },

  // Barcode Symbologies
  getBarcodeSymbologies: async () => {
    try {
      const response = await apiClient.get('/barcode-symbologies');
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  // Tax Types
  getTaxTypes: async () => {
    try {
      const response = await apiClient.get('/tax-types');
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  // Manufacturers
  getManufacturers: async () => {
    try {
      const response = await apiClient.get('/manufacturers');
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  // Users & RBAC
  getUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data?.data || response.data || [];
  },

  createUser: async (data: { email: string; fullName: string; role: string; password?: string }) => {
    const response = await apiClient.post('/users', data);
    return response.data?.data || response.data;
  },

  updateUser: async (id: string, data: { fullName?: string; role?: string; isActive?: boolean }) => {
    try {
      const response = await apiClient.patch(`/users/${id}`, data);
      return response.data?.data || response.data;
    } catch {
      try {
        const response = await apiClient.put(`/users/${id}`, data);
        return response.data?.data || response.data;
      } catch {
        return { id, ...data };
      }
    }
  },

  updateUserRole: async (id: string, data: { role: string; isActive?: boolean }) => {
    try {
      const response = await apiClient.patch(`/users/${id}`, data);
      return response.data?.data || response.data;
    } catch {
      try {
        const response = await apiClient.put(`/users/${id}/role`, data);
        return response.data?.data || response.data;
      } catch {
        return { id, ...data };
      }
    }
  },

  deleteUser: async (id: string) => {
    try {
      const response = await apiClient.post(`/users/${id}/deactivate`);
      return response.data;
    } catch {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    }
  },
};
