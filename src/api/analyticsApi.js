import axios from "axios";
const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
export const fetchDashboardSummary = () =>
    API.get("/analytics/summary");
export const MetalrateTrends = () => API.get('/rates/all-trends');