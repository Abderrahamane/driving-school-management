// backend/src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import { asyncHandler, AppError } from "./error.middleware.js";

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Not authorized to access this route', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'process.env.JWT_SECRET');
        req.admin = await Admin.findById(decoded.id).select('-password');

        if (!req.admin) {
            return next(new AppError('User not found', 401));
        }

        next();
    } catch (error) {
        return next(new AppError('Not authorized to access this route', 401));
    }
});

// Validation middleware
export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    next();
};

export const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return next(new AppError('Please provide name, email and password', 400));
    }

    if (password.length < 6) {
        return next(new AppError('Password must be at least 6 characters', 400));
    }

    next();
};

export const validateStudent = (req, res, next) => {
    const { name, email, phone, licenseType } = req.body;

    if (!name || !email || !phone || !licenseType) {
        return next(new AppError('Please provide all required fields', 400));
    }

    next();
};

export const validateInstructor = (req, res, next) => {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return next(new AppError('Please provide all required fields', 400));
    }

    next();
};

export const validateVehicle = (req, res, next) => {
    const { plateNumber, model, year, fuelType, transmission } = req.body;

    if (!plateNumber || !model || !year || !fuelType || !transmission) {
        return next(new AppError('Please provide all required fields', 400));
    }

    next();
};

export const validateLesson = (req, res, next) => {
    const { studentId, instructorId, vehicleId, date, time } = req.body;

    if (!studentId || !instructorId || !vehicleId || !date || !time) {
        return next(new AppError('Please provide all required fields', 400));
    }

    next();
};

export const validatePayment = (req, res, next) => {
    const { studentId, amount, method } = req.body;

    if (!studentId || !amount || !method) {
        return next(new AppError('Please provide all required fields', 400));
    }

    if (amount < 0) {
        return next(new AppError('Amount cannot be negative', 400));
    }

    next();
};

// Role authorization
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.admin.role)) {
            return next(new AppError(`User role ${req.admin.role} is not authorized to access this route`, 403));
        }
        next();
    };
};