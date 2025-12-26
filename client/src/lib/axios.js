import axios from 'axios';

// Set config defaults when creating the instance
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

// If we are in dev (no env set), it falls back to empty string
// which allows the Vite proxy to handle '/api' requests.
// In prod, VITE_API_URL should be set to the backend URL (e.g. https://api-hub-server.onrender.com)

export default axios;
