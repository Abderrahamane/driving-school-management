import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
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
    address: {
        type: String,
        trim: true,
        maxlength: [200, 'Address cannot exceed 200 characters']
    },
    licenseType: {
        type: String,
        required: [true, 'License type is required'],
        enum: {
            values: ['A', 'B', 'C', 'D'],
            message: 'License type must be A, B, C, or D'
        }
    },
    dateOfBirth: {
        type: Date,
        validate: {
            validator: function(value) {
                const age = Math.floor((new Date() - value) / (365.25 * 24 * 60 * 60 * 1000));
                return age >= 16 && age <= 100;
            },
            message: 'Student must be between 16 and 100 years old'
        }
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'suspended', 'dropped'],
        default: 'active'
    },
    progress: {
        theoryLessons: { type: Number, default: 0 },
        practicalLessons: { type: Number, default: 0 },
        theoryTestPassed: { type: Boolean, default: false },
        practicalTestPassed: { type: Boolean, default: false }
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Index for search performance
studentSchema.index({ name: 'text', email: 'text', phone: 'text' });
studentSchema.index({ licenseType: 1, status: 1 });

export default mongoose.model("Student", studentSchema);