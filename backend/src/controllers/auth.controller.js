import mongoose from "mongoose";
import Admin from "../models/admin.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'process.env.JWT_SECRET', {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register new admin
// @route   POST /api/auth/register
// @access  Public (but can be restricted later)
export const registerAdmin = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
        return next(new AppError('Admin already exists with this email', 400));
    }

    // Create admin
    const admin = await Admin.create({
        name,
        email,
        password,
        role: role || 'admin'
    });

    if (admin) {
        res.status(201).json({
            success: true,
            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                token: generateToken(admin._id)
            }
        });
    } else {
        return next(new AppError('Invalid admin data', 400));
    }
});

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Find admin with password field
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
        return next(new AppError('Invalid credentials', 401));
    }

    // Check if admin is active
    if (!admin.isActive) {
        return next(new AppError('Account is deactivated. Contact administrator.', 403));
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
        return next(new AppError('Invalid credentials', 401));
    }

    // Update last login and active session information
    const loginDate = new Date();
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;

    admin.lastLogin = loginDate;
    admin.securitySettings = admin.securitySettings || {};
    admin.securitySettings.activeSessions = (admin.securitySettings.activeSessions || []).map((session) => {
        session.current = false;
        return session;
    });

    const deviceName = userAgent.split(')')[0]?.substring(0, 60) || userAgent.substring(0, 60) || 'Web Session';

    admin.securitySettings.activeSessions.push({
        _id: new mongoose.Types.ObjectId(),
        device: deviceName,
        userAgent,
        location: ipAddress ? 'Remote Session' : 'Local Session',
        ipAddress,
        current: true,
        lastActive: loginDate,
        createdAt: loginDate
    });

    // Keep only the 10 most recent sessions
    if (admin.securitySettings.activeSessions.length > 10) {
        admin.securitySettings.activeSessions = admin.securitySettings.activeSessions.slice(-10);
    }

    await admin.save();

    res.status(200).json({
        success: true,
        data: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            token: generateToken(admin._id)
        }
    });
});

// @desc    Get current logged in admin
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
    const admin = await Admin.findById(req.admin.id);

    res.status(200).json({
        success: true,
        data: admin
    });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
    const admin = await Admin.findById(req.admin.id).select('+password');

    // Check current password
    if (!(await admin.comparePassword(req.body.currentPassword))) {
        return next(new AppError('Current password is incorrect', 401));
    }

    admin.password = req.body.newPassword;
    admin.securitySettings = admin.securitySettings || {};
    admin.securitySettings.lastPasswordChange = new Date();
    await admin.save();

    res.status(200).json({
        success: true,
        data: {
            token: generateToken(admin._id)
        },
        message: 'Password updated successfully'
    });
});

// @desc    Logout admin (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
export const logoutAdmin = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});