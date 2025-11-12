// backend/src/controllers/vehicle.controller.js
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

    // Status filter
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Search by plate number or model
    if (req.query.search) {
        query.$or = [
            { plateNumber: { $regex: req.query.search, $options: 'i' } },
            { model: { $regex: req.query.search, $options: 'i' } },
            { manufacturer: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    // Transmission filter
    if (req.query.transmission) {
        query.transmission = req.query.transmission;
    }

    // Fuel type filter
    if (req.query.fuelType) {
        query.fuelType = req.query.fuelType;
    }

    // Year range filter
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

    // Add usage statistics for each vehicle
    const vehiclesWithStats = await Promise.all(
        vehicles.map(async (vehicle) => {
            const totalLessons = await Lesson.countDocuments({ vehicleId: vehicle._id });
            const completedLessons = await Lesson.countDocuments({
                vehicleId: vehicle._id,
                status: 'completed'
            });
            const scheduledLessons = await Lesson.countDocuments({
                vehicleId: vehicle._id,
                status: 'scheduled',
                date: { $gte: new Date() }
            });

            return {
                ...vehicle.toJSON(),
                stats: {
                    totalLessons,
                    completedLessons,
                    scheduledLessons,
                    maintenanceDue: vehicle.maintenanceDue
                }
            };
        })
    );

    const total = await Vehicle.countDocuments(query);

    res.status(200).json({
        success: true,
        count: vehiclesWithStats.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: vehiclesWithStats
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

    // Get usage statistics
    const totalLessons = await Lesson.countDocuments({ vehicleId: vehicle._id });
    const completedLessons = await Lesson.countDocuments({
        vehicleId: vehicle._id,
        status: 'completed'
    });
    const upcomingLessons = await Lesson.find({
        vehicleId: vehicle._id,
        status: 'scheduled',
        date: { $gte: new Date() }
    })
        .populate('studentId', 'name email')
        .populate('instructorId', 'name')
        .sort('date time')
        .limit(10);

    const vehicleWithDetails = {
        ...vehicle.toJSON(),
        stats: {
            totalLessons,
            completedLessons,
            scheduledLessons: upcomingLessons.length
        },
        upcomingLessons
    };

    res.status(200).json({
        success: true,
        data: vehicleWithDetails
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

    // Check VIN if provided
    if (req.body.vin) {
        const existingVIN = await Vehicle.findOne({ vin: req.body.vin });
        if (existingVIN) {
            return next(new AppError('Vehicle with this VIN already exists', 400));
        }
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

    // Check VIN if being changed
    if (req.body.vin && req.body.vin !== vehicle.vin) {
        const vinExists = await Vehicle.findOne({ vin: req.body.vin });
        if (vinExists) {
            return next(new AppError('VIN already in use', 400));
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

    const { date, startDate, endDate } = req.query;

    let dateQuery = {};
    if (date) {
        dateQuery.date = new Date(date);
    } else if (startDate && endDate) {
        dateQuery.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    } else {
        return next(new AppError('Date parameter is required', 400));
    }

    // Get all lessons for this vehicle in the date range
    const lessons = await Lesson.find({
        vehicleId: req.params.id,
        ...dateQuery,
        status: { $in: ['scheduled', 'in-progress'] }
    })
        .select('date time duration status studentId instructorId')
        .populate('studentId', 'name')
        .populate('instructorId', 'name')
        .sort('date time');

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
            dateRange: { startDate: startDate || date, endDate: endDate || date },
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

    const maintenanceHistory = vehicle.maintenanceHistory.sort((a, b) => b.date - a.date);
    const totalMaintenanceCost = vehicle.totalMaintenanceCost;

    res.status(200).json({
        success: true,
        data: {
            vehicle: {
                plateNumber: vehicle.plateNumber,
                model: vehicle.model,
                currentMileage: vehicle.mileage
            },
            totalMaintenanceCost,
            lastMaintenance: vehicle.lastMaintenance,
            nextMaintenanceDate: vehicle.nextMaintenanceDate,
            nextMaintenanceMileage: vehicle.nextMaintenanceMileage,
            maintenanceDue: vehicle.maintenanceDue,
            maintenanceHistory
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
        performedBy: req.body.performedBy,
        nextMaintenanceDate: req.body.nextMaintenanceDate,
        mileageAtService: req.body.mileageAtService || vehicle.mileage,
        parts: req.body.parts || [],
        notes: req.body.notes
    };

    vehicle.maintenanceHistory.push(maintenanceRecord);
    vehicle.lastMaintenance = maintenanceRecord.date;

    if (req.body.nextMaintenanceDate) {
        vehicle.nextMaintenanceDate = req.body.nextMaintenanceDate;
    }

    if (req.body.nextMaintenanceMileage) {
        vehicle.nextMaintenanceMileage = req.body.nextMaintenanceMileage;
    }

    // Update status if vehicle is being serviced
    if (req.body.updateStatus && req.body.status) {
        vehicle.status = req.body.status;
    }

    await vehicle.save();

    res.status(200).json({
        success: true,
        data: vehicle,
        message: 'Maintenance record added successfully'
    });
});

// @desc    Update maintenance record
// @route   PUT /api/vehicles/:id/maintenance/:maintenanceId
// @access  Private
export const updateMaintenanceRecord = asyncHandler(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    const maintenanceRecord = vehicle.maintenanceHistory.id(req.params.maintenanceId);

    if (!maintenanceRecord) {
        return next(new AppError('Maintenance record not found', 404));
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
        maintenanceRecord[key] = req.body[key];
    });

    await vehicle.save();

    res.status(200).json({
        success: true,
        data: vehicle,
        message: 'Maintenance record updated successfully'
    });
});

// @desc    Delete maintenance record
// @route   DELETE /api/vehicles/:id/maintenance/:maintenanceId
// @access  Private
export const deleteMaintenanceRecord = asyncHandler(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    vehicle.maintenanceHistory.pull(req.params.maintenanceId);
    await vehicle.save();

    res.status(200).json({
        success: true,
        data: {},
        message: 'Maintenance record deleted successfully'
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
    const retired = await Vehicle.countDocuments({ status: 'retired' });

    // Get vehicles needing maintenance
    const allVehicles = await Vehicle.find();
    const needingMaintenance = allVehicles.filter(v => v.maintenanceDue).length;

    // Group by year
    const byYear = await Vehicle.aggregate([
        {
            $group: {
                _id: '$year',
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: -1 } }
    ]);

    // Group by transmission
    const byTransmission = await Vehicle.aggregate([
        {
            $group: {
                _id: '$transmission',
                count: { $sum: 1 }
            }
        }
    ]);

    // Group by fuel type
    const byFuelType = await Vehicle.aggregate([
        {
            $group: {
                _id: '$fuelType',
                count: { $sum: 1 }
            }
        }
    ]);

    // Calculate total maintenance costs
    const maintenanceCosts = await Vehicle.aggregate([
        { $unwind: '$maintenanceHistory' },
        {
            $group: {
                _id: null,
                totalCost: { $sum: '$maintenanceHistory.cost' }
            }
        }
    ]);

    const totalMaintenanceCost = maintenanceCosts.length > 0 ? maintenanceCosts[0].totalCost : 0;

    // Average vehicle age
    const avgAge = allVehicles.length > 0
        ? Math.round(allVehicles.reduce((sum, v) => sum + v.age, 0) / allVehicles.length)
        : 0;

    res.status(200).json({
        success: true,
        data: {
            total,
            available,
            inUse,
            maintenance,
            retired,
            needingMaintenance,
            avgAge,
            totalMaintenanceCost,
            byYear,
            byTransmission,
            byFuelType
        }
    });
});

// @desc    Update vehicle mileage
// @route   PATCH /api/vehicles/:id/mileage
// @access  Private
export const updateMileage = asyncHandler(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    const { mileage } = req.body;

    if (!mileage || mileage < vehicle.mileage) {
        return next(new AppError('Invalid mileage value', 400));
    }

    vehicle.mileage = mileage;
    await vehicle.save();

    res.status(200).json({
        success: true,
        data: vehicle,
        message: 'Mileage updated successfully'
    });
});