import { apiClient } from '../../../services/api.client';

export const masterDataService = {
  // Categories
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data?.data || response.data || [];
  },

  createCategory: async (data: { name: string; code?: string; description?: string }) => {
    const payload: any = { name: data.name?.trim() };
    if (data.code?.trim()) payload.code = data.code.trim();
    if (data.description?.trim()) payload.description = data.description.trim();

    const response = await apiClient.post('/categories', payload);
    return response.data?.data || response.data;
  },

  updateCategory: async (id: string, data: { name?: string; code?: string; description?: string; isActive?: boolean }) => {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    // code is not accepted by UpdateCategoryDto — omit it
    if (data.description?.trim()) payload.description = data.description.trim();
    if (data.isActive !== undefined) payload.isActive = data.isActive;

    const response = await apiClient.patch(`/categories/${id}`, payload);
    return response.data?.data || response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data?.data || response.data;
  },

  // Brands
  getBrands: async () => {
    const response = await apiClient.get('/brands');
    return response.data?.data || response.data || [];
  },

  createBrand: async (data: { name: string; code?: string; description?: string }) => {
    const payload: any = { name: data.name?.trim() };
    if (data.code?.trim()) payload.code = data.code.trim();
    if (data.description?.trim()) payload.description = data.description.trim();

    const response = await apiClient.post('/brands', payload);
    return response.data?.data || response.data;
  },

  updateBrand: async (id: string, data: { name?: string; code?: string; description?: string; isActive?: boolean }) => {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    // code is not accepted by UpdateBrandDto — omit it
    if (data.description?.trim()) payload.description = data.description.trim();
    if (data.isActive !== undefined) payload.isActive = data.isActive;

    const response = await apiClient.patch(`/brands/${id}`, payload);
    return response.data?.data || response.data;
  },

  deleteBrand: async (id: string) => {
    const response = await apiClient.delete(`/brands/${id}`);
    return response.data?.data || response.data;
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
    const payload: any = {
      name: data.name?.trim(),
      branchCode: data.branchCode?.trim() || '00000',
      isHeadquarter: Boolean(data.isHeadquarter),
    };
    if (data.code?.trim()) payload.code = data.code.trim();
    if (data.taxId?.trim()) payload.taxId = data.taxId.trim();
    if (data.branchName?.trim()) payload.branchName = data.branchName.trim();
    if (data.phone?.trim()) payload.phone = data.phone.trim();
    if (data.email?.trim()) payload.email = data.email.trim();
    if (data.address?.trim()) payload.address = data.address.trim();

    const response = await apiClient.post('/companies', payload);
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
    }
  ) => {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.code?.trim()) payload.code = data.code.trim();
    if (data.taxId?.trim()) payload.taxId = data.taxId.trim();
    if (data.branchCode !== undefined) payload.branchCode = data.branchCode.trim() || '00000';
    if (data.branchName?.trim()) payload.branchName = data.branchName.trim();
    if (data.phone?.trim()) payload.phone = data.phone.trim();
    if (data.email?.trim()) payload.email = data.email.trim();
    if (data.address?.trim()) payload.address = data.address.trim();
    if (data.isHeadquarter !== undefined) payload.isHeadquarter = data.isHeadquarter;

    const response = await apiClient.put(`/companies/${id}`, payload);
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
    const payload: any = {
      code: data.code.trim(),
      name: data.name.trim(),
    };
    if (data.type?.trim()) payload.type = data.type.trim();
    if (data.description?.trim()) payload.description = data.description.trim();

    const response = await apiClient.post('/units', payload);
    return response.data?.data || response.data;
  },

  updateUnit: async (id: string, data: { code?: string; name?: string; type?: string; description?: string; isActive?: boolean }) => {
    const payload: any = {};
    // code is not accepted by UpdateUnitDto — omit it
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.type?.trim()) payload.type = data.type.trim();
    if (data.description?.trim()) payload.description = data.description.trim();
    if (data.isActive !== undefined) payload.isActive = data.isActive;

    const response = await apiClient.patch(`/units/${id}`, payload);
    return response.data?.data || response.data;
  },

  deleteUnit: async (id: string) => {
    const response = await apiClient.delete(`/units/${id}`);
    return response.data?.data || response.data;
  },

  // Suppliers
  getSuppliers: async () => {
    const response = await apiClient.get('/suppliers');
    return response.data?.data || response.data || [];
  },

  createSupplier: async (data: { name: string; code?: string; contactPerson?: string; phone?: string; email?: string; taxId?: string; address?: string }) => {
    const payload: any = {
      name: data.name?.trim(),
    };
    if (data.code?.trim()) payload.code = data.code.trim();
    if (data.contactPerson?.trim()) payload.contactPerson = data.contactPerson.trim();
    if (data.phone?.trim()) payload.phone = data.phone.trim();
    if (data.email?.trim()) payload.email = data.email.trim();
    if (data.taxId?.trim()) payload.taxId = data.taxId.trim();
    if (data.address?.trim()) payload.address = data.address.trim();

    const response = await apiClient.post('/suppliers', payload);
    return response.data?.data || response.data;
  },

  updateSupplier: async (id: string, data: { name?: string; code?: string; contactPerson?: string; phone?: string; email?: string; taxId?: string; address?: string; isActive?: boolean }) => {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    // code, email, taxId, address are not accepted by UpdateSupplierDto — omit them
    if (data.contactPerson?.trim()) payload.contactPerson = data.contactPerson.trim();
    if (data.phone?.trim()) payload.phone = data.phone.trim();
    if (data.isActive !== undefined) payload.isActive = data.isActive;

    const response = await apiClient.patch(`/suppliers/${id}`, payload);
    return response.data?.data || response.data;
  },

  deleteSupplier: async (id: string) => {
    const response = await apiClient.delete(`/suppliers/${id}`);
    return response.data?.data || response.data;
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
    const payload: any = {
      email: data.email.trim(),
      fullName: data.fullName.trim(),
      role: data.role,
    };
    if (data.password?.trim()) payload.password = data.password.trim();

    const response = await apiClient.post('/users', payload);
    return response.data?.data || response.data;
  },

  updateUserRole: async (id: string, data: { role: string }) => {
    const response = await apiClient.patch(`/users/${id}/role`, data);
    return response.data?.data || response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data?.data || response.data;
  },
};
