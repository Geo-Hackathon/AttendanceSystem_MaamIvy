// API Configuration
// Update PRODUCTION_API_URL with your Render.com backend URL after deployment

const config = {
  // Development: Uses Vite proxy (configured in vite.config.js)
  development: {
    apiUrl: '', // Empty string uses proxy
  },
  
  // Production: Direct connection to Render.com backend
  production: {
    apiUrl: 'https://faculty-attendance-api.onrender.com', // UPDATE THIS with your actual Render URL
  }
};

const environment = import.meta.env.MODE || 'development';

export const API_URL = config[environment].apiUrl;
export const IS_PRODUCTION = environment === 'production';

export default config;
