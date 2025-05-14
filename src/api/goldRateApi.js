import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

export const getGoldRates = () => API.get('/gold-rates');
export const updateGoldRate = (data) => API.post('/gold-rates', data);