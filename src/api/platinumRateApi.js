import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

export const getPlatinumRates = () => API.get('/platinum-rates');
export const updatePlatinumRate = (data) => API.put('/platinum-rates', data);