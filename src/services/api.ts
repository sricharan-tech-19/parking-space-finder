import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const API_URL = 'http://10.13.57.225:5000/api';  // Android emulator
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

// ✅ Add token to requests
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ Parking API
export const parkingAPI = {
    getAll: () => api.get('/parkings'),
    getById: (id: string) => api.get(`/parkings/${id}`),
    getByCity: (city: string) => api.get(`/parkings/city/${city}`),
};

// ✅ Auth API
export const authAPI = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
};

// ✅ User API
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    getFavorites: () => api.get('/users/favorites'),
    addFavorite: (parkingId: string) => api.post(`/users/favorites/add/${parkingId}`),
    removeFavorite: (parkingId: string) => api.post(`/users/favorites/remove/${parkingId}`),
};

export default api;
