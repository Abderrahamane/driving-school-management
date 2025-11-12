import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const sessionSchema = new mongoose.Schema({
    device: {
        type: String,
        default: 'Unknown Device'
    },
    userAgent: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: 'Unknown'
    },
    ipAddress: {
        type: String,
        default: ''
    },
    current: {
        type: Boolean,
        default: false
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default
    },
    role: {
        type: String,
        enum: ['admin', 'super-admin'],
        default: 'admin'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    notificationSettings: {
        emailEnabled: { type: Boolean, default: true },
        emailNewStudent: { type: Boolean, default: true },
        emailLessonReminder: { type: Boolean, default: true },
        emailPaymentReceived: { type: Boolean, default: true },
        emailSystemUpdate: { type: Boolean, default: false },
        emailWeeklyReport: { type: Boolean, default: true },
        smsEnabled: { type: Boolean, default: false },
        smsLessonReminder: { type: Boolean, default: false },
        smsPaymentDue: { type: Boolean, default: false },
        smsEmergency: { type: Boolean, default: true },
        pushEnabled: { type: Boolean, default: true },
        pushNewStudent: { type: Boolean, default: true },
        pushLessonStart: { type: Boolean, default: true },
        pushPaymentReceived: { type: Boolean, default: true },
        pushSystemAlert: { type: Boolean, default: true },
        inAppEnabled: { type: Boolean, default: true },
        inAppNewStudent: { type: Boolean, default: true },
        inAppLessonUpdate: { type: Boolean, default: true },
        inAppPayment: { type: Boolean, default: true },
        inAppChat: { type: Boolean, default: true }
    },
    appearanceSettings: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'light'
        },
        fontSize: {
            type: String,
            enum: ['small', 'medium', 'large'],
            default: 'medium'
        },
        sidebarPosition: {
            type: String,
            enum: ['left', 'right'],
            default: 'left'
        },
        compactMode: {
            type: Boolean,
            default: false
        },
        colorScheme: {
            type: String,
            enum: ['blue', 'purple', 'green', 'red', 'orange'],
            default: 'blue'
        },
        showAnimations: {
            type: Boolean,
            default: true
        },
        highContrast: {
            type: Boolean,
            default: false
        }
    },
    securitySettings: {
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        lastPasswordChange: {
            type: Date
        },
        activeSessions: {
            type: [sessionSchema],
            default: []
        }
    },
    backupSettings: {
        automatic: {
            type: Boolean,
            default: true
        },
        retentionDays: {
            type: Number,
            default: 30
        },
        lastBackupAt: {
            type: Date
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("Admin", adminSchema);
