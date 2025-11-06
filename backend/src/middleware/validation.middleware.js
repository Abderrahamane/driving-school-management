import { AppError } from './error.middleware.js';

// Auth Middleware with RBAC
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

export const protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return next(new AppError("Not authorized, no token provided", 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'process.env.JWT_SECRET');

        // Get admin from database
        req.admin = await Admin.findById(decoded.id).select('-password');

        if (!req.admin) {
            return next(new AppError("Not authorized, user not found", 401));
        }

        next();
    } catch (error) {
        return next(new AppError("Not authorized, token invalid or expired", 401));
    }
};

// Role-based authorization
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return next(new AppError("Not authorized", 401));
        }

        if (!roles.includes(req.admin.role)) {
            return next(new AppError(`Role '${req.admin.role}' is not authorized to access this route`, 403));
        }

        next();
    };
};

// Validation helper
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            return next(new AppError(message, 400));
        }

        next();
    };
};

// Basic validation rules without external library
export const validateStudent = (req, res, next) => {
    const { name, email, phone, licenseType } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Valid email is required');
    }

    if (!phone || !/^[0-9]{10,15}$/.test(phone)) {
        errors.push('Valid phone number is required (10-15 digits)');
    }

    if (!licenseType || !['A', 'B', 'C', 'D'].includes(licenseType)) {
        errors.push('License type must be A, B, C, or D');
    }

    if (errors.length > 0) {
        return next(new AppError(errors.join(', '), 400));
    }

    next();
};

export const validateInstructor = (req, res, next) => {
    const { name, email, phone, experienceYears } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Valid email is required');
    }

    if (!phone || !/^[0-9]{10,15}$/.test(phone)) {
        errors.push('Valid phone number is required');
    }

    if (experienceYears !== undefined && (experienceYears < 0 || experienceYears > 50)) {
        errors.push('Experience years must be between 0 and 50');
    }

    if (errors.length > 0) {
        return next(new AppError(errors.join(', '), 400));
    }

    next();
};

export const validateVehicle = (req, res, next) => {
    const { plateNumber, model, year, status } = req.body;
    const errors = [];

    if (!plateNumber || plateNumber.trim().length < 3) {
        errors.push('Plate number is required');
    }

    if (!model || model.trim().length < 2) {
        errors.push('Model is required');
    }

    if (year && (year < 1990 || year > new Date().getFullYear() + 1)) {
        errors.push(`Year must be between 1990 and ${new Date().getFullYear() + 1}`);
    }

    if (status && !['available', 'in-use', 'maintenance'].includes(status)) {
        errors.push('Status must be available, in-use, or maintenance');
    }

    if (errors.length > 0) {
        return next(new AppError(errors.join(', '), 400));
    }

    next();
};

export const validateLesson = (req, res, next) => {
    const { studentId, instructorId, vehicleId, date, time } = req.body;
    const errors = [];

    if (!studentId) errors.push('Student ID is required');
    if (!instructorId) errors.push('Instructor ID is required');
    if (!vehicleId) errors.push('Vehicle ID is required');
    if (!date) errors.push('Date is required');
    if (!time) errors.push('Time is required');

    if (date && new Date(date) < new Date()) {
        errors.push('Date cannot be in the past');
    }

    if (errors.length > 0) {
        return next(new AppError(errors.join(', '), 400));
    }

    next();
};

export const validatePayment = (req, res, next) => {
    const { studentId, amount, method } = req.body;
    const errors = [];

    if (!studentId) errors.push('Student ID is required');

    if (!amount || amount <= 0) {
        errors.push('Amount must be greater than 0');
    }

    if (method && !['cash', 'card', 'transfer'].includes(method)) {
        errors.push('Payment method must be cash, card, or transfer');
    }

    if (errors.length > 0) {
        return next(new AppError(errors.join(', '), 400));
    }

    next();
};

export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Valid email is required');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    if (errors.length > 0) {
        return next(new AppError(errors.join(', '), 400));
    }

    next();
};

export const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Valid email is required');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    if (errors.length > 0) {
        return next(new AppError(errors.join(', '), 400));
    }

    next();
};