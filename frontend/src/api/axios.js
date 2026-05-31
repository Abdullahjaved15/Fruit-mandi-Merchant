import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_ORIGIN = baseURL.replace(/\/api\/?$/, '');

const api = axios.create({
    baseURL,
});

api.interceptors.request.use(
    (config) => {
        const authData = JSON.parse(localStorage.getItem('auth_data') || 'null');
        if (authData?.token) {
            config.headers.Authorization = `Bearer ${authData.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Token expired or invalid
            localStorage.removeItem('auth_data');
            // If we are not already on login page, redirect
            if (window.location.pathname !== '/login' && window.location.pathname !== '/__portal') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
