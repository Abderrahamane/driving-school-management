import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
    plateNumber: {
        type: String,
        required: [true, 'Plate number is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Model is required'],
        trim: true
    },
    manufacturer: {
        type: String,
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: [1990, 'Year must be 1990 or later'],
        max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
    },
    status: {
        type: String,
        enum: {
            values: ['available', 'in-use', 'maintenance', 'retired'],
            message: 'Status must be available, in-use, maintenance, or retired'
        },
        default: 'available'
    },
    mileage: {
        type: Number,
        default: 0,
        min: [0, 'Mileage cannot be negative']
    },
    lastMaintenance: {
        type: Date
    },
    nextMaintenanceDate: {
        type: Date
    },
    maintenanceHistory: [{
        date: {
            type: Date,
            default: Date.now
        },
        type: {
            type: String,
            enum: ['oil-change', 'tire-replacement', 'brake-service', 'inspection', 'repair', 'other']
        },
        description: String,
        cost: Number,
        nextMaintenanceDate: Date
    }],
    fuelType: {
        type: String,
        enum: ['petrol', 'diesel', 'electric', 'hybrid']
    },
    transmission: {
        type: String,
        enum: ['manual', 'automatic']
    },
    capacity: {
        type: Number,
        min: 2,
        max: 9
    }
}, {
    timestamps: true
});

// Index for search
vehicleSchema.index({ plateNumber: 'text', model: 'text' });

export default mongoose.model("Vehicle", vehicleSchema);
