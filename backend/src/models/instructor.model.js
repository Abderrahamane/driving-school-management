// backend/src/models/instructor.model.js
import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{10,15}$/, 'Please provide a valid phone number']
    },
    licenseNumber: {
        type: String,
        trim: true
    },
    experienceYears: {
        type: Number,
        default: 0,
        min: [0, 'Experience years cannot be negative'],
        max: [50, 'Experience years cannot exceed 50']
    },
    specialization: {
        type: String,
        enum: ['manual', 'automatic', 'both'],
        default: 'both'
    },
    dateOfBirth: {
        type: Date,
        validate: {
            validator: function(value) {
                if (!value) return true;
                const age = Math.floor((new Date() - value) / (365.25 * 24 * 60 * 60 * 1000));
                return age >= 21 && age <= 75;
            },
            message: 'Instructor must be between 21 and 75 years old'
        }
    },
    hireDate: {
        type: Date,
        default: Date.now
    },
    address: {
        type: String,
        trim: true,
        maxlength: [200, 'Address cannot exceed 200 characters']
    },
    emergencyContact: {
        type: String,
        trim: true
    },
    emergencyPhone: {
        type: String,
        match: [/^[0-9]{10,15}$/, 'Please provide a valid emergency phone number']
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'on-leave', 'terminated'],
        default: 'active'
    },
    qualifications: {
        type: String,
        trim: true
    },
    assignedStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],
    certifications: [{
        name: String,
        issueDate: Date,
        expiryDate: Date
    }],
    availability: {
        monday: { type: Boolean, default: true },
        tuesday: { type: Boolean, default: true },
        wednesday: { type: Boolean, default: true },
        thursday: { type: Boolean, default: true },
        friday: { type: Boolean, default: true },
        saturday: { type: Boolean, default: false },
        sunday: { type: Boolean, default: false }
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for stats
instructorSchema.virtual('stats', {
    ref: 'Lesson',
    localField: '_id',
    foreignField: 'instructorId',
    count: true
});

// Index for search
instructorSchema.index({ name: 'text', email: 'text' });

export default mongoose.model("Instructor", instructorSchema);