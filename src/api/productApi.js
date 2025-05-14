import axios from "axios";

const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

export const getProducts = () => API.get("/products");
export const getProductsbyid = (id) => API.get(`/products/${id}`);
export const updateProductById = (id, formData) =>
  API.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const AddNewProduct = (formData) =>
  API.post("/products", formData);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
