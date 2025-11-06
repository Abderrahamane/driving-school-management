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
    experienceYears: {
        type: Number,
        default: 0,
        min: [0, 'Experience years cannot be negative'],
        max: [50, 'Experience years cannot exceed 50']
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
    status: {
        type: String,
        enum: ['active', 'on-leave', 'inactive'],
        default: 'active'
    },
    availability: {
        monday: { type: Boolean, default: true },
        tuesday: { type: Boolean, default: true },
        wednesday: { type: Boolean, default: true },
        thursday: { type: Boolean, default: true },
        friday: { type: Boolean, default: true },
        saturday: { type: Boolean, default: false },
        sunday: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

// Index for search
instructorSchema.index({ name: 'text', email: 'text' });

export default mongoose.model("Instructor", instructorSchema);
