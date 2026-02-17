import axios, { type InternalAxiosRequestConfig } from 'axios';

export const BASE_URL = 'https://inventoryapi.gstsa1.org';
export const API_URL = `${BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
});

// Add interceptor to include token in headers if it exists
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
