import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

export const getSilverRates = () => API.get('/silver-rates');
export const updateSilverRate = (data) => API.post('/silver-rates', data);