import Vehicle from "../models/vehicle.model.js";
import Lesson from "../models/lesson.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// @desc    Get all vehicles with pagination and filtering
// @route   GET /api/vehicles
// @access  Private
export const getVehicles = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Search by plate number or model
    if (req.query.search) {
        query.$or = [
            { plateNumber: { $regex: req.query.search, $options: 'i' } },
            { model: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    // Filter by year range
    if (req.query.minYear) {
        query.year = { ...query.year, $gte: parseInt(req.query.minYear) };
    }
    if (req.query.maxYear) {
        query.year = { ...query.year, $lte: parseInt(req.query.maxYear) };
    }

    const vehicles = await Vehicle.find(query)
        .sort(req.query.sortBy || '-createdAt')
        .skip(skip)
        .limit(limit);

    const total = await Vehicle.countDocuments(query);

    res.status(200).json({
        success: true,
        count: vehicles.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: vehicles
    });
});

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
export const getVehicle = asyncHandler(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    res.status(200).json({
        success: true,
        data: vehicle
    });
});

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private
export const addVehicle = asyncHandler(async (req, res, next) => {
    // Check if vehicle with plate number already exists
    const existingVehicle = await Vehicle.findOne({ plateNumber: req.body.plateNumber });

    if (existingVehicle) {
        return next(new AppError('Vehicle with this plate number already exists', 400));
    }

    const vehicle = await Vehicle.create(req.body);

    res.status(201).json({
        success: true,
        data: vehicle,
        message: 'Vehicle created successfully'
    });
});

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
export const updateVehicle = asyncHandler(async (req, res, next) => {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    // Check if plate number is being changed and if new plate already exists
    if (req.body.plateNumber && req.body.plateNumber !== vehicle.plateNumber) {
        const plateExists = await Vehicle.findOne({ plateNumber: req.body.plateNumber });
        if (plateExists) {
            return next(new AppError('Plate number already in use', 400));
        }
    }

    vehicle = await Vehicle.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        data: vehicle,
        message: 'Vehicle updated successfully'
    });
});

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
export const deleteVehicle = asyncHandler(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    // Check if vehicle has active lessons
    const activeLessons = await Lesson.countDocuments({
        vehicleId: req.params.id,
        status: 'scheduled'
    });

    if (activeLessons > 0) {
        return next(new AppError('Cannot delete vehicle with scheduled lessons', 400));
    }

    await vehicle.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
        message: 'Vehicle deleted successfully'
    });
});

// @desc    Get vehicle availability
// @route   GET /api/vehicles/:id/availability
// @access  Private
export const getVehicleAvailability = asyncHandler(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    const { date } = req.query;

    if (!date) {
        return next(new AppError('Date parameter is required', 400));
    }

    // Get all lessons for this vehicle on the specified date
    const lessons = await Lesson.find({
        vehicleId: req.params.id,
        date: new Date(date),
        status: { $in: ['scheduled', 'in-progress'] }
    }).select('time status');

    const isAvailable = vehicle.status === 'available' && lessons.length === 0;

    res.status(200).json({
        success: true,
        data: {
            vehicle: {
                id: vehicle._id,
                plateNumber: vehicle.plateNumber,
                model: vehicle.model,
                status: vehicle.status
            },
            date,
            isAvailable,
            scheduledLessons: lessons
        }
    });
});

// @desc    Get vehicle maintenance history
// @route   GET /api/vehicles/:id/maintenance
// @access  Private
export const getVehicleMaintenanceHistory = asyncHandler(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    res.status(200).json({
        success: true,
        data: {
            vehicle: {
                plateNumber: vehicle.plateNumber,
                model: vehicle.model
            },
            maintenanceHistory: vehicle.maintenanceHistory || []
        }
    });
});

// @desc    Add maintenance record
// @route   POST /api/vehicles/:id/maintenance
// @access  Private
export const addMaintenanceRecord = asyncHandler(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    const maintenanceRecord = {
        date: req.body.date || new Date(),
        type: req.body.type,
        description: req.body.description,
        cost: req.body.cost,
        nextMaintenanceDate: req.body.nextMaintenanceDate
    };

    vehicle.maintenanceHistory = vehicle.maintenanceHistory || [];
    vehicle.maintenanceHistory.push(maintenanceRecord);
    vehicle.lastMaintenance = maintenanceRecord.date;

    await vehicle.save();

    res.status(200).json({
        success: true,
        data: vehicle,
        message: 'Maintenance record added successfully'
    });
});

// @desc    Get vehicle statistics
// @route   GET /api/vehicles/stats
// @access  Private
export const getVehicleStats = asyncHandler(async (req, res, next) => {
    const total = await Vehicle.countDocuments();
    const available = await Vehicle.countDocuments({ status: 'available' });
    const inUse = await Vehicle.countDocuments({ status: 'in-use' });
    const maintenance = await Vehicle.countDocuments({ status: 'maintenance' });

    const byYear = await Vehicle.aggregate([
        {
            $group: {
                _id: '$year',
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            total,
            available,
            inUse,
            maintenance,
            byYear
        }
    });
});