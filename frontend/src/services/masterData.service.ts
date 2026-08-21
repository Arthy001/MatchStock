import { apiClient } from './api.client';

export const masterDataService = {
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  getBrands: async () => {
    const response = await apiClient.get('/brands');
    return response.data;
  },

  getUnits: async () => {
    const response = await apiClient.get('/units');
    return response.data;
  },

  getSuppliers: async () => {
    const response = await apiClient.get('/suppliers');
    return response.data;
  },

  getUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },
};
