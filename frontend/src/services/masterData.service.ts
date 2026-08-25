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

  // Companies (1 Tenant : N Companies)
  getCompanies: async () => {
    const response = await apiClient.get('/companies');
    return response.data;
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
    return response.data;
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
    const response = await apiClient.put(`/companies/${id}`, data);
    return response.data;
  },

  deleteCompany: async (id: string) => {
    const response = await apiClient.delete(`/companies/${id}`);
    return response.data;
  },

  // Units
  getUnits: async () => {
    const response = await apiClient.get('/units');
    return response.data;
  },

  createUnit: async (data: { code: string; name: string }) => {
    const response = await apiClient.post('/units', data);
    return response.data;
  },

  updateUnit: async (id: string, data: { code?: string; name?: string }) => {
    const response = await apiClient.put(`/units/${id}`, data);
    return response.data;
  },

  deleteUnit: async (id: string) => {
    const response = await apiClient.delete(`/units/${id}`);
    return response.data;
  },

  // Suppliers
  getSuppliers: async () => {
    const response = await apiClient.get('/suppliers');
    return response.data;
  },

  createSupplier: async (data: { name: string; code?: string; contactPerson?: string; phone?: string; email?: string; taxId?: string; address?: string }) => {
    const response = await apiClient.post('/suppliers', data);
    return response.data;
  },

  updateSupplier: async (id: string, data: { name?: string; code?: string; contactPerson?: string; phone?: string; email?: string; taxId?: string; address?: string }) => {
    const response = await apiClient.put(`/suppliers/${id}`, data);
    return response.data;
  },

  deleteSupplier: async (id: string) => {
    const response = await apiClient.delete(`/suppliers/${id}`);
    return response.data;
  },

  // Users & RBAC
  getUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  createUser: async (data: { email: string; fullName: string; role: string; password?: string }) => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  updateUserRole: async (id: string, data: { role: string; isActive?: boolean }) => {
    const response = await apiClient.put(`/users/${id}/role`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};
