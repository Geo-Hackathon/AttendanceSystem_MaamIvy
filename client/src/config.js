// API Configuration
// Uses VITE_API_URL environment variable for production

const config = {
  // Development: Uses Vite proxy (configured in vite.config.js)
  development: {
    apiUrl: '', // Empty string uses proxy
  },
  
  // Production: Uses environment variable
  production: {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  }
};

const environment = import.meta.env.MODE || 'development';

export const API_URL = config[environment].apiUrl;
export const IS_PRODUCTION = environment === 'production';

export default config;
