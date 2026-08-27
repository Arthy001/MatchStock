import { apiClient } from './api.client';

export const masterDataService = {
  // Categories
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  createCategory: async (data: { name: string; code?: string }) => {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  // Brands
  getBrands: async () => {
    const response = await apiClient.get('/brands');
    return response.data;
  },

  // Companies (1 Tenant : N Companies) - With Third-Party graceful fallback
  getCompanies: async () => {
    try {
      const response = await apiClient.get('/companies');
      return response.data?.data || response.data || [];
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
    }
  ) => {
    try {
      const response = await apiClient.put(`/companies/${id}`, data);
      return response.data?.data || response.data;
    } catch {
      const local = localStorage.getItem('matchstock_local_companies');
      const list = local ? JSON.parse(local) : [];
      const updated = list.map((c: any) => (c.id === id ? { ...c, ...data } : c));
      localStorage.setItem('matchstock_local_companies', JSON.stringify(updated));
      return { id, ...data };
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
    const response = await apiClient.get('/units');
    return response.data?.data || response.data || [];
  },

  createUnit: async (data: { code: string; name: string; type?: string; description?: string }) => {
    const response = await apiClient.post('/units', data);
    return response.data?.data || response.data;
  },

  updateUnit: async (id: string, data: { code?: string; name?: string; type?: string; description?: string }) => {
    const response = await apiClient.patch(`/units/${id}`, data);
    return response.data?.data || response.data;
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
    const response = await apiClient.get('/suppliers');
    return response.data?.data || response.data || [];
  },

  createSupplier: async (data: { name: string; code?: string; contactPerson?: string; phone?: string; email?: string; taxId?: string; address?: string }) => {
    const response = await apiClient.post('/suppliers', data);
    return response.data?.data || response.data;
  },

  updateSupplier: async (id: string, data: { name?: string; code?: string; contactPerson?: string; phone?: string; email?: string; taxId?: string; address?: string }) => {
    const response = await apiClient.patch(`/suppliers/${id}`, data);
    return response.data?.data || response.data;
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

  updateBrand: async (id: string, data: { name?: string; code?: string; description?: string }) => {
    const response = await apiClient.patch(`/brands/${id}`, data);
    return response.data?.data || response.data;
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
  updateCategory: async (id: string, data: { name?: string; code?: string; description?: string }) => {
    const response = await apiClient.patch(`/categories/${id}`, data);
    return response.data?.data || response.data;
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
    const response = await apiClient.get('/barcode-symbologies');
    return response.data?.data || response.data || [];
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
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data?.data || response.data;
  },

  updateUserRole: async (id: string, data: { role: string; isActive?: boolean }) => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data?.data || response.data;
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
