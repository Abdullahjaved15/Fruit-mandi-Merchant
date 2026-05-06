import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Request Interceptor: Attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const authData = JSON.parse(localStorage.getItem('auth_data'));
        if (authData && authData.token) {
            config.headers.Authorization = `Bearer ${authData.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
