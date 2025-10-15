import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const getStudents = () => API.get('/students');
export const getInstructors = () => API.get('/instructors');
export const getVehicles = () => API.get('/vehicles');
export const getSchedules = () => API.get('/schedules');
export const getPayments = () => API.get('/payments');
