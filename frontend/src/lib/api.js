import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
    updatePassword: (passwords) => api.put('/auth/updatepassword', passwords),
    logout: () => api.post('/auth/logout'),
};

export const studentsAPI = {
    getAll: (params) => api.get('/students', { params }),
    getOne: (id) => api.get(`/students/${id}`),
    create: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`),
    getStats: () => api.get('/students/stats'),
};

export const instructorsAPI = {
    getAll: (params) => api.get('/instructors', { params }),
    getOne: (id) => api.get(`/instructors/${id}`),
    create: (data) => api.post('/instructors', data),
    update: (id, data) => api.put(`/instructors/${id}`, data),
    delete: (id) => api.delete(`/instructors/${id}`),
    getSchedule: (id) => api.get(`/instructors/${id}/schedule`),
};

export const vehiclesAPI = {
    getAll: (params) => api.get('/vehicles', { params }),
    getOne: (id) => api.get(`/vehicles/${id}`),
    create: (data) => api.post('/vehicles', data),
    update: (id, data) => api.put(`/vehicles/${id}`, data),
    delete: (id) => api.delete(`/vehicles/${id}`),
    getStats: () => api.get('/vehicles/stats'),
    getAvailability: (id, date) => api.get(`/vehicles/${id}/availability`, { params: { date } }),
    getMaintenance: (id) => api.get(`/vehicles/${id}/maintenance`),
    addMaintenance: (id, data) => api.post(`/vehicles/${id}/maintenance`, data),
};

export const lessonsAPI = {
    getAll: (params) => api.get('/lessons', { params }),
    getOne: (id) => api.get(`/lessons/${id}`),
    create: (data) => api.post('/lessons', data),
    update: (id, data) => api.put(`/lessons/${id}`, data),
    delete: (id) => api.delete(`/lessons/${id}`),
    complete: (id, data) => api.put(`/lessons/${id}/complete`, data),
    checkAvailability: (data) => api.post('/lessons/check-availability', data),
    getStats: () => api.get('/lessons/stats'),
};

export const paymentsAPI = {
    getAll: (params) => api.get('/payments', { params }),
    getOne: (id) => api.get(`/payments/${id}`),
    create: (data) => api.post('/payments', data),
    update: (id, data) => api.put(`/payments/${id}`, data),
    delete: (id) => api.delete(`/payments/${id}`),
    getStats: () => api.get('/payments/stats'),
    getStudentPayments: (studentId) => api.get(`/payments/student/${studentId}`),
    getPending: () => api.get('/payments/pending'),
    markAsPaid: (id) => api.put(`/payments/${id}/mark-paid`),
};

export default api;