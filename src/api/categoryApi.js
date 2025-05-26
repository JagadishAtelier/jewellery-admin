import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

export const getCategories = () => API.get('/categories');
export const CreatCategoriesStyle = (columnClass) => API.post('/categories/style', { columnClass });



export const CreatCategoriesItem = (styleId) => API.post(`/categories/${styleId}`);
export const getCategoriesItems = () => API.get('/categories/items');

export const createCategory = (formData) =>
  API.post('/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateCategory = (id, formData) =>
  API.put(`/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateCategoryItem = async (categoryId, itemId, formData) =>
  API.put(`/categories/${categoryId}/items/${itemId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteCategory = (id) => API.delete(`/categories/${id}`);
export const deleteCategoryItem = (categoryId, itemId) => {
  return API.delete(`/categories/${categoryId}/items/${itemId}`);
};


