// backend/src/models/vehicle.model.js
import mongoose from "mongoose";

const maintenanceRecordSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['oil-change', 'tire-replacement', 'brake-service', 'inspection', 'repair', 'other'],
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    cost: {
        type: Number,
        required: true,
        min: 0
    },
    performedBy: {
        type: String,
        trim: true
    },
    nextMaintenanceDate: {
        type: Date
    },
    mileageAtService: {
        type: Number,
        min: 0
    },
    parts: [{
        name: String,
        quantity: Number,
        cost: Number
    }],
    notes: {
        type: String,
        maxlength: 500
    }
}, { _id: true });

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
    color: {
        type: String,
        trim: true
    },
    vin: {
        type: String,
        trim: true,
        uppercase: true,
        sparse: true,
        unique: true
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
    nextMaintenanceMileage: {
        type: Number,
        min: 0
    },
    maintenanceHistory: {
        type: [maintenanceRecordSchema],
        default: []
    },
    fuelType: {
        type: String,
        enum: ['petrol', 'diesel', 'electric', 'hybrid'],
        required: true
    },
    transmission: {
        type: String,
        enum: ['manual', 'automatic'],
        required: true
    },
    capacity: {
        type: Number,
        min: 2,
        max: 9,
        default: 5
    },
    insuranceDetails: {
        provider: String,
        policyNumber: String,
        expiryDate: Date,
        coverage: String
    },
    registrationDetails: {
        registrationNumber: String,
        expiryDate: Date,
        state: String
    },
    images: [{
        url: String,
        caption: String,
        isPrimary: Boolean
    }],
    features: [{
        type: String,
        trim: true
    }],
    documents: [{
        name: String,
        type: String,
        url: String,
        uploadDate: { type: Date, default: Date.now }
    }],
    purchaseInfo: {
        purchaseDate: Date,
        purchasePrice: Number,
        dealer: String
    },
    notes: {
        type: String,
        maxlength: 1000
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for total maintenance cost
vehicleSchema.virtual('totalMaintenanceCost').get(function() {
    if (!Array.isArray(this.maintenanceHistory) || this.maintenanceHistory.length === 0) {
        return 0;
    }

    return this.maintenanceHistory.reduce((total, record = {}) => total + (record.cost || 0), 0);
});

// Virtual for age
vehicleSchema.virtual('age').get(function() {
    return new Date().getFullYear() - this.year;
});

// Virtual for maintenance due status
vehicleSchema.virtual('maintenanceDue').get(function() {
    if (this.nextMaintenanceDate && new Date() > this.nextMaintenanceDate) {
        return true;
    }
    if (this.nextMaintenanceMileage && this.mileage >= this.nextMaintenanceMileage) {
        return true;
    }
    return false;
});

// Index for search
vehicleSchema.index({ plateNumber: 'text', model: 'text', manufacturer: 'text' });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ year: 1 });

// Pre-save middleware to update maintenance status
vehicleSchema.pre('save', function(next) {
    if (this.maintenanceHistory && this.maintenanceHistory.length > 0) {
        const latestMaintenance = this.maintenanceHistory[this.maintenanceHistory.length - 1];
        this.lastMaintenance = latestMaintenance.date;
    }
    next();
});

export default mongoose.model("Vehicle", vehicleSchema);