import { apiClient } from './api.client';

export const masterDataService = {
  // Categories
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data?.data || response.data || [];
  },

  createCategory: async (data: { name: string; code?: string; description?: string }) => {
    const response = await apiClient.post('/categories', data);
    return response.data?.data || response.data;
  },

  updateCategory: async (id: string, data: { name?: string; code?: string; description?: string; isActive?: boolean }) => {
    const response = await apiClient.patch(`/categories/${id}`, data);
    return response.data?.data || response.data;
  },

  deleteCategory: async (id: string) => {
    try {
      const response = await apiClient.post(`/categories/${id}/deactivate`);
      return response.data?.data || response.data;
    } catch {
      const response = await apiClient.delete(`/categories/${id}`);
      return response.data?.data || response.data;
    }
  },

  // Brands
  getBrands: async () => {
    const response = await apiClient.get('/brands');
    return response.data?.data || response.data || [];
  },

  createBrand: async (data: { name: string; code?: string; description?: string }) => {
    const response = await apiClient.post('/brands', data);
    return response.data?.data || response.data;
  },

  updateBrand: async (id: string, data: { name?: string; code?: string; description?: string; isActive?: boolean }) => {
    const response = await apiClient.patch(`/brands/${id}`, data);
    return response.data?.data || response.data;
  },

  deleteBrand: async (id: string) => {
    try {
      const response = await apiClient.post(`/brands/${id}/deactivate`);
      return response.data?.data || response.data;
    } catch {
      const response = await apiClient.delete(`/brands/${id}`);
      return response.data?.data || response.data;
    }
  },

  // Companies (1 Tenant : N Companies)
  getCompanies: async () => {
    const response = await apiClient.get('/companies');
    return response.data?.data || response.data || [];
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
    const response = await apiClient.post('/companies', data);
    return response.data?.data || response.data;
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
    const response = await apiClient.patch(`/companies/${id}`, data);
    return response.data?.data || response.data;
  },

  deleteCompany: async (id: string) => {
    const response = await apiClient.delete(`/companies/${id}`);
    return response.data?.data || response.data;
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

  updateUnit: async (id: string, data: { code?: string; name?: string; type?: string; description?: string; isActive?: boolean }) => {
    const response = await apiClient.patch(`/units/${id}`, data);
    return response.data?.data || response.data;
  },

  deleteUnit: async (id: string) => {
    try {
      const response = await apiClient.post(`/units/${id}/deactivate`);
      return response.data?.data || response.data;
    } catch {
      const response = await apiClient.delete(`/units/${id}`);
      return response.data?.data || response.data;
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

  updateSupplier: async (id: string, data: { name?: string; code?: string; contactPerson?: string; phone?: string; email?: string; taxId?: string; address?: string; isActive?: boolean }) => {
    const response = await apiClient.patch(`/suppliers/${id}`, data);
    return response.data?.data || response.data;
  },

  deleteSupplier: async (id: string) => {
    try {
      const response = await apiClient.post(`/suppliers/${id}/deactivate`);
      return response.data?.data || response.data;
    } catch {
      const response = await apiClient.delete(`/suppliers/${id}`);
      return response.data?.data || response.data;
    }
  },

  // Barcode Symbologies
  getBarcodeSymbologies: async () => {
    const response = await apiClient.get('/barcode-symbologies');
    return response.data?.data || response.data || [];
  },

  // Tax Types
  getTaxTypes: async () => {
    const response = await apiClient.get('/tax-types');
    return response.data?.data || response.data || [];
  },

  // Manufacturers
  getManufacturers: async () => {
    const response = await apiClient.get('/manufacturers');
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
      return response.data?.data || response.data;
    } catch {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data?.data || response.data;
    }
  },
};
