import axios from 'axios';

// Bulletproof URL logic: 
// 1. If building for production (Vercel), FORCE the Render URL.
// 2. If local dev, use VITE_API_URL or fall back to empty (for proxy).
const isProduction = import.meta.env.PROD;
const productionUrl = 'https://apihub-qmpv.onrender.com';

axios.defaults.baseURL = isProduction ? productionUrl : (import.meta.env.VITE_API_URL || '');

console.log(`[API Config] Mode: ${isProduction ? 'Production' : 'Development'}, BaseURL: ${axios.defaults.baseURL}`);

export default axios;
