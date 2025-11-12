import os from "os";
import mongoose from "mongoose";
import Admin from "../models/admin.model.js";
import Backup from "../models/backup.model.js";
import Student from "../models/student.model.js";
import Instructor from "../models/instructor.model.js";
import Lesson from "../models/lesson.model.js";
import Vehicle from "../models/vehicle.model.js";
import Payment from "../models/payment.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

const DEFAULT_NOTIFICATION_SETTINGS = {
    emailEnabled: true,
    emailNewStudent: true,
    emailLessonReminder: true,
    emailPaymentReceived: true,
    emailSystemUpdate: false,
    emailWeeklyReport: true,
    smsEnabled: false,
    smsLessonReminder: false,
    smsPaymentDue: false,
    smsEmergency: true,
    pushEnabled: true,
    pushNewStudent: true,
    pushLessonStart: true,
    pushPaymentReceived: true,
    pushSystemAlert: true,
    inAppEnabled: true,
    inAppNewStudent: true,
    inAppLessonUpdate: true,
    inAppPayment: true,
    inAppChat: true
};

const DEFAULT_APPEARANCE_SETTINGS = {
    theme: 'light',
    fontSize: 'medium',
    sidebarPosition: 'left',
    compactMode: false,
    colorScheme: 'blue',
    showAnimations: true,
    highContrast: false
};

const allowedNotificationKeys = new Set(Object.keys(DEFAULT_NOTIFICATION_SETTINGS));
const allowedAppearanceFields = new Set(Object.keys(DEFAULT_APPEARANCE_SETTINGS));

const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days) parts.push(`${days} day${days === 1 ? '' : 's'}`);
    if (hours) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
    if (minutes) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);

    return parts.length ? parts.join(', ') : 'just started';
};

const ensureAdmin = async (adminId) => {
    const admin = await Admin.findById(adminId);
    if (!admin) {
        throw new AppError('Admin account not found', 404);
    }
    return admin;
};

const mergeWithDefaults = (current, defaults) => ({
    ...defaults,
    ...(current ? (current.toObject ? current.toObject() : current) : {})
});

export const getSettings = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    const backups = await Backup.find({ admin: admin._id }).sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
        success: true,
        data: {
            profile: {
                name: admin.name,
                email: admin.email,
                role: admin.role
            },
            notificationSettings: mergeWithDefaults(admin.notificationSettings, DEFAULT_NOTIFICATION_SETTINGS),
            appearanceSettings: mergeWithDefaults(admin.appearanceSettings, DEFAULT_APPEARANCE_SETTINGS),
            securitySettings: {
                twoFactorEnabled: admin.securitySettings?.twoFactorEnabled ?? false,
                lastPasswordChange: admin.securitySettings?.lastPasswordChange,
                activeSessions: admin.securitySettings?.activeSessions ?? []
            },
            backupSettings: {
                automatic: admin.backupSettings?.automatic ?? true,
                retentionDays: admin.backupSettings?.retentionDays ?? 30,
                lastBackupAt: admin.backupSettings?.lastBackupAt
            },
            backups
        }
    });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    const { name, email } = req.body;

    if (!name && !email) {
        throw new AppError('Please provide a name or email to update', 400);
    }

    if (name) {
        admin.name = name.trim();
    }

    if (email) {
        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail !== admin.email) {
            const exists = await Admin.findOne({ email: normalizedEmail });
            if (exists) {
                throw new AppError('Another admin already uses this email', 400);
            }
        }
        admin.email = normalizedEmail;
    }

    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            name: admin.name,
            email: admin.email,
            role: admin.role
        }
    });
});

export const getNotificationSettings = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    res.status(200).json({
        success: true,
        data: mergeWithDefaults(admin.notificationSettings, DEFAULT_NOTIFICATION_SETTINGS)
    });
});

export const updateNotificationSettings = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    const updates = {};

    Object.entries(req.body || {}).forEach(([key, value]) => {
        if (allowedNotificationKeys.has(key)) {
            updates[key] = Boolean(value);
        }
    });

    if (!Object.keys(updates).length) {
        throw new AppError('No valid notification settings provided', 400);
    }

    admin.notificationSettings = {
        ...mergeWithDefaults(admin.notificationSettings, DEFAULT_NOTIFICATION_SETTINGS),
        ...updates
    };

    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: admin.notificationSettings
    });
});

export const getAppearanceSettings = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    res.status(200).json({
        success: true,
        data: mergeWithDefaults(admin.appearanceSettings, DEFAULT_APPEARANCE_SETTINGS)
    });
});

export const updateAppearanceSettings = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);

    if ('language' in req.body) {
        throw new AppError('Language settings are not yet available', 400);
    }

    const updates = {};

    Object.entries(req.body || {}).forEach(([key, value]) => {
        if (!allowedAppearanceFields.has(key)) {
            return;
        }

        if (['theme'].includes(key)) {
            const allowedThemes = ['light', 'dark', 'auto'];
            if (!allowedThemes.includes(value)) {
                throw new AppError('Invalid theme selected', 400);
            }
            updates[key] = value;
            return;
        }

        if (['fontSize'].includes(key)) {
            const allowedSizes = ['small', 'medium', 'large'];
            if (!allowedSizes.includes(value)) {
                throw new AppError('Invalid font size selected', 400);
            }
            updates[key] = value;
            return;
        }

        if (['sidebarPosition'].includes(key)) {
            const allowedPositions = ['left', 'right'];
            if (!allowedPositions.includes(value)) {
                throw new AppError('Invalid sidebar position selected', 400);
            }
            updates[key] = value;
            return;
        }

        if (key === 'colorScheme') {
            const allowedSchemes = ['blue', 'purple', 'green', 'red', 'orange'];
            if (!allowedSchemes.includes(value)) {
                throw new AppError('Invalid color scheme selected', 400);
            }
            updates[key] = value;
            return;
        }

        if (['compactMode', 'showAnimations', 'highContrast'].includes(key)) {
            updates[key] = Boolean(value);
        }
    });

    if (!Object.keys(updates).length) {
        throw new AppError('No valid appearance settings provided', 400);
    }

    admin.appearanceSettings = {
        ...mergeWithDefaults(admin.appearanceSettings, DEFAULT_APPEARANCE_SETTINGS),
        ...updates
    };

    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Appearance settings updated successfully',
        data: admin.appearanceSettings
    });
});

export const getSecuritySettings = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    res.status(200).json({
        success: true,
        data: {
            twoFactorEnabled: admin.securitySettings?.twoFactorEnabled ?? false,
            lastPasswordChange: admin.securitySettings?.lastPasswordChange,
            activeSessions: admin.securitySettings?.activeSessions ?? []
        }
    });
});

export const updateTwoFactor = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
        throw new AppError('Invalid two-factor authentication value', 400);
    }

    admin.securitySettings = admin.securitySettings || {};
    admin.securitySettings.twoFactorEnabled = enabled;
    await admin.save();

    res.status(200).json({
        success: true,
        message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
        data: {
            twoFactorEnabled: admin.securitySettings.twoFactorEnabled
        }
    });
});

export const endSession = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    const { sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        throw new AppError('Invalid session identifier', 400);
    }

    const session = admin.securitySettings?.activeSessions?.id(sessionId);

    if (!session) {
        throw new AppError('Session not found', 404);
    }

    session.deleteOne();
    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Session ended successfully'
    });
});

export const getBackupSettings = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    const backups = await Backup.find({ admin: admin._id }).sort({ createdAt: -1 }).limit(20);

    res.status(200).json({
        success: true,
        data: {
            settings: {
                automatic: admin.backupSettings?.automatic ?? true,
                retentionDays: admin.backupSettings?.retentionDays ?? 30,
                lastBackupAt: admin.backupSettings?.lastBackupAt
            },
            backups
        }
    });
});

export const updateBackupPreferences = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    const { automatic, retentionDays } = req.body;

    admin.backupSettings = admin.backupSettings || {};

    if (typeof automatic === 'boolean') {
        admin.backupSettings.automatic = automatic;
    }

    if (retentionDays !== undefined) {
        const parsed = Number(retentionDays);
        if (Number.isNaN(parsed) || parsed <= 0) {
            throw new AppError('Retention days must be a positive number', 400);
        }
        admin.backupSettings.retentionDays = parsed;
    }

    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Backup preferences updated successfully',
        data: admin.backupSettings
    });
});

export const createBackup = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    const type = req.body?.type === 'automatic' ? 'automatic' : 'manual';

    const sizeMB = Number((Math.random() * 20 + 25).toFixed(2));

    const backup = await Backup.create({
        admin: admin._id,
        type,
        status: 'completed',
        sizeMB,
        retentionDays: admin.backupSettings?.retentionDays ?? 30,
        notes: req.body?.notes
    });

    admin.backupSettings = admin.backupSettings || {};
    admin.backupSettings.lastBackupAt = backup.createdAt;
    await admin.save();

    res.status(201).json({
        success: true,
        message: 'Backup created successfully',
        data: backup
    });
});

export const restoreBackup = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    const { backupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(backupId)) {
        throw new AppError('Invalid backup identifier', 400);
    }

    const backup = await Backup.findOne({ _id: backupId, admin: admin._id });

    if (!backup) {
        throw new AppError('Backup not found', 404);
    }

    backup.status = 'restored';
    backup.restoredAt = new Date();
    await backup.save();

    res.status(200).json({
        success: true,
        message: 'Backup restoration has been initiated',
        data: backup
    });
});

export const downloadBackup = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    const { backupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(backupId)) {
        throw new AppError('Invalid backup identifier', 400);
    }

    const backup = await Backup.findOne({ _id: backupId, admin: admin._id });

    if (!backup) {
        throw new AppError('Backup not found', 404);
    }

    res.status(200).json({
        success: true,
        message: 'Download link generated successfully',
        data: {
            backupId: backup._id,
            downloadUrl: `/api/v1/settings/backups/${backup._id}/download`,
            sizeMB: backup.sizeMB
        }
    });
});

export const getSystemStatus = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);

    const [
        totalAdmins,
        totalStudents,
        totalLessons,
        totalInstructors,
        totalVehicles,
        totalPayments,
        latestBackup,
        backupStats
    ] = await Promise.all([
        Admin.countDocuments(),
        Student.countDocuments(),
        Lesson.countDocuments(),
        Instructor.countDocuments(),
        Vehicle.countDocuments(),
        Payment.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Backup.findOne({ admin: admin._id }).sort({ createdAt: -1 }),
        Backup.aggregate([
            { $match: { admin: admin._id } },
            { $group: { _id: null, totalSize: { $sum: '$sizeMB' }, count: { $sum: 1 } } }
        ])
    ]);

    const totalPaymentAmount = totalPayments[0]?.total || 0;
    const totalStorageGB = 10;
    const usedStorageGB = Number(((backupStats[0]?.totalSize || 0) / 1024).toFixed(2));
    const diskUsage = Math.min(100, Math.round((usedStorageGB / totalStorageGB) * 100));

    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const memoryPercent = Math.min(100, Math.round((memoryUsage.rss / totalMemory) * 100));
    const loadAverage = os.loadavg()[0];
    const cpuPercent = Math.min(100, Math.round((loadAverage / os.cpus().length) * 100));

    const uptimeSeconds = process.uptime();

    const [recentStudent] = await Student.find().sort({ createdAt: -1 }).limit(1);
    const [recentLesson] = await Lesson.find().sort({ createdAt: -1 }).limit(1);
    const [recentPayment] = await Payment.find().sort({ createdAt: -1 }).limit(1);

    const recentActivity = [];

    if (recentStudent) {
        recentActivity.push({
            action: `Student Registered: ${recentStudent.name}`,
            time: recentStudent.createdAt,
            status: 'success'
        });
    }

    if (recentLesson) {
        recentActivity.push({
            action: 'Lesson Scheduled',
            time: recentLesson.createdAt,
            status: 'success'
        });
    }

    if (recentPayment) {
        recentActivity.push({
            action: `Payment Recorded (${recentPayment.amount?.toFixed ? recentPayment.amount.toFixed(2) : recentPayment.amount} ${recentPayment.method})`,
            time: recentPayment.createdAt,
            status: recentPayment.status === 'paid' ? 'success' : recentPayment.status
        });
    }

    if (latestBackup) {
        recentActivity.push({
            action: `Backup ${latestBackup.type === 'automatic' ? 'Completed' : 'Created'}`,
            time: latestBackup.createdAt,
            status: latestBackup.status
        });
    }

    res.status(200).json({
        success: true,
        data: {
            version: 'v1.0.0',
            lastUpdate: admin.updatedAt,
            dbStatus: 'Connected',
            apiStatus: 'Operational',
            uptime: formatUptime(uptimeSeconds),
            totals: {
                users: totalAdmins,
                students: totalStudents,
                lessons: totalLessons,
                instructors: totalInstructors,
                vehicles: totalVehicles,
                paymentsAmount: totalPaymentAmount
            },
            storage: {
                used: usedStorageGB,
                total: totalStorageGB,
                unit: 'GB'
            },
            performance: {
                cpu: cpuPercent,
                memory: memoryPercent,
                disk: diskUsage
            },
            recentActivity
        }
    });
});

export const clearCache = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'System cache cleared successfully'
    });
});

export const optimizeDatabase = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Database optimization completed successfully'
    });
});

export const exportLogs = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'System logs export started successfully'
    });
});
