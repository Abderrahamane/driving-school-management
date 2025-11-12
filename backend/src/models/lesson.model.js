import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: [true, 'Student is required']
    },
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Instructor",
        required: [true, 'Instructor is required']
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: [true, 'Vehicle is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        validate: {
            validator: function(value) {
                // Don't allow dates more than 1 year in the past
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                return value >= oneYearAgo;
            },
            message: 'Date cannot be more than 1 year in the past'
        }
    },
    time: {
        type: String,
        required: [true, 'Time is required'],
        match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
    },
    duration: {
        type: Number,
        default: 60, // minutes
        min: [30, 'Lesson must be at least 30 minutes'],
        max: [180, 'Lesson cannot exceed 3 hours']
    },
    status: {
        type: String,
        enum: {
            values: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
            message: 'Invalid status'
        },
        default: 'scheduled'
    },
    lessonType: {
        type: String,
        enum: ['theory', 'practical', 'test-preparation', 'road-test'],
        default: 'practical'
    },
    location: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    cancellationReason: {
        type: String,
        maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
    }
}, {
    timestamps: true
});

// Index for efficient queries
lessonSchema.index({ date: 1, time: 1 });
lessonSchema.index({ studentId: 1, date: 1 });
lessonSchema.index({ instructorId: 1, date: 1 });
lessonSchema.index({ vehicleId: 1, date: 1 });
lessonSchema.index({ status: 1 });

// Compound index for conflict checking
lessonSchema.index({ instructorId: 1, date: 1, time: 1 });
lessonSchema.index({ vehicleId: 1, date: 1, time: 1 });

export default mongoose.model("Lesson", lessonSchema);
