import axios from "axios";
const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
export const fetchDashboardSummary = () =>
    API.get("/analytics/summary");
export const getGoldRatesTrends = () => API.get('/gold-rates/trends');