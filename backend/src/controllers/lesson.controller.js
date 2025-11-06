import Lesson from "../models/lesson.model.js";
import Student from "../models/student.model.js";
import Instructor from "../models/instructor.model.js";
import Vehicle from "../models/vehicle.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// @desc    Get all lessons with pagination and filtering
// @route   GET /api/lessons
// @access  Private
export const getLessons = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Filter by student
    if (req.query.studentId) {
        query.studentId = req.query.studentId;
    }

    // Filter by instructor
    if (req.query.instructorId) {
        query.instructorId = req.query.instructorId;
    }

    // Filter by vehicle
    if (req.query.vehicleId) {
        query.vehicleId = req.query.vehicleId;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
        query.date = {};
        if (req.query.startDate) {
            query.date.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            query.date.$lte = new Date(req.query.endDate);
        }
    }

    const lessons = await Lesson.find(query)
        .populate('studentId', 'name email phone')
        .populate('instructorId', 'name email')
        .populate('vehicleId', 'plateNumber model')
        .sort(req.query.sortBy || 'date time')
        .skip(skip)
        .limit(limit);

    const total = await Lesson.countDocuments(query);

    res.status(200).json({
        success: true,
        count: lessons.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: lessons
    });
});

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Private
export const getLesson = asyncHandler(async (req, res, next) => {
    const lesson = await Lesson.findById(req.params.id)
        .populate('studentId', 'name email phone licenseType')
        .populate('instructorId', 'name email experienceYears')
        .populate('vehicleId', 'plateNumber model year');

    if (!lesson) {
        return next(new AppError('Lesson not found', 404));
    }

    res.status(200).json({
        success: true,
        data: lesson
    });
});

// Helper function to check conflicts
const checkConflicts = async (instructorId, vehicleId, date, time, excludeLessonId = null) => {
    const query = {
        date: new Date(date),
        time,
        status: { $in: ['scheduled', 'in-progress'] },
        $or: [
            { instructorId },
            { vehicleId }
        ]
    };

    // Exclude current lesson when updating
    if (excludeLessonId) {
        query._id = { $ne: excludeLessonId };
    }

    const conflicts = await Lesson.find(query)
        .populate('instructorId', 'name')
        .populate('vehicleId', 'plateNumber');

    return conflicts;
};

// @desc    Schedule new lesson
// @route   POST /api/lessons
// @access  Private
export const addLesson = asyncHandler(async (req, res, next) => {
    const { studentId, instructorId, vehicleId, date, time } = req.body;

    // Validate that all entities exist
    const student = await Student.findById(studentId);
    if (!student) {
        return next(new AppError('Student not found', 404));
    }

    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
        return next(new AppError('Instructor not found', 404));
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    // Check vehicle availability
    if (vehicle.status !== 'available') {
        return next(new AppError(`Vehicle is ${vehicle.status}`, 400));
    }

    // Check for scheduling conflicts
    const conflicts = await checkConflicts(instructorId, vehicleId, date, time);

    if (conflicts.length > 0) {
        const conflictMessages = conflicts.map(c => {
            if (c.instructorId._id.toString() === instructorId) {
                return `Instructor ${c.instructorId.name} is already scheduled at this time`;
            }
            if (c.vehicleId._id.toString() === vehicleId) {
                return `Vehicle ${c.vehicleId.plateNumber} is already scheduled at this time`;
            }
        });

        return next(new AppError(conflictMessages.join('. '), 400));
    }

    // Create lesson
    const lesson = await Lesson.create(req.body);

    // Populate before returning
    await lesson.populate([
        { path: 'studentId', select: 'name email' },
        { path: 'instructorId', select: 'name email' },
        { path: 'vehicleId', select: 'plateNumber model' }
    ]);

    res.status(201).json({
        success: true,
        data: lesson,
        message: 'Lesson scheduled successfully'
    });
});

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private
export const updateLesson = asyncHandler(async (req, res, next) => {
    let lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
        return next(new AppError('Lesson not found', 404));
    }

    // If updating time/date/instructor/vehicle, check for conflicts
    if (req.body.date || req.body.time || req.body.instructorId || req.body.vehicleId) {
        const checkDate = req.body.date || lesson.date;
        const checkTime = req.body.time || lesson.time;
        const checkInstructor = req.body.instructorId || lesson.instructorId;
        const checkVehicle = req.body.vehicleId || lesson.vehicleId;

        const conflicts = await checkConflicts(
            checkInstructor,
            checkVehicle,
            checkDate,
            checkTime,
            req.params.id
        );

        if (conflicts.length > 0) {
            return next(new AppError('Schedule conflict detected', 400));
        }
    }

    lesson = await Lesson.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    )
        .populate('studentId', 'name email')
        .populate('instructorId', 'name email')
        .populate('vehicleId', 'plateNumber model');

    res.status(200).json({
        success: true,
        data: lesson,
        message: 'Lesson updated successfully'
    });
});

// @desc    Cancel/Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private
export const deleteLesson = asyncHandler(async (req, res, next) => {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
        return next(new AppError('Lesson not found', 404));
    }

    // Instead of deleting, update status to cancelled
    lesson.status = 'cancelled';
    await lesson.save();

    res.status(200).json({
        success: true,
        data: {},
        message: 'Lesson cancelled successfully'
    });
});

// @desc    Check availability for lesson scheduling
// @route   POST /api/lessons/check-availability
// @access  Private
export const checkAvailability = asyncHandler(async (req, res, next) => {
    const { instructorId, vehicleId, date, time } = req.body;

    if (!instructorId || !vehicleId || !date || !time) {
        return next(new AppError('All fields are required', 400));
    }

    const conflicts = await checkConflicts(instructorId, vehicleId, date, time);

    res.status(200).json({
        success: true,
        data: {
            available: conflicts.length === 0,
            conflicts: conflicts.map(c => ({
                time: c.time,
                instructor: c.instructorId?.name,
                vehicle: c.vehicleId?.plateNumber
            }))
        }
    });
});

// @desc    Get lesson statistics
// @route   GET /api/lessons/stats
// @access  Private
export const getLessonStats = asyncHandler(async (req, res, next) => {
    const total = await Lesson.countDocuments();
    const scheduled = await Lesson.countDocuments({ status: 'scheduled' });
    const completed = await Lesson.countDocuments({ status: 'completed' });
    const cancelled = await Lesson.countDocuments({ status: 'cancelled' });

    // Upcoming lessons (next 7 days)
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcoming = await Lesson.countDocuments({
        date: { $gte: today, $lte: nextWeek },
        status: 'scheduled'
    });

    // Lessons by status
    const byStatus = await Lesson.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            total,
            scheduled,
            completed,
            cancelled,
            upcoming,
            byStatus
        }
    });
});

// @desc    Complete a lesson
// @route   PUT /api/lessons/:id/complete
// @access  Private
export const completeLesson = asyncHandler(async (req, res, next) => {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
        return next(new AppError('Lesson not found', 404));
    }

    if (lesson.status !== 'scheduled' && lesson.status !== 'in-progress') {
        return next(new AppError('Only scheduled or in-progress lessons can be completed', 400));
    }

    lesson.status = 'completed';
    lesson.notes = req.body.notes || lesson.notes;
    await lesson.save();

    // Update student progress
    const student = await Student.findById(lesson.studentId);
    if (student) {
        student.progress.practicalLessons += 1;
        await student.save();
    }

    res.status(200).json({
        success: true,
        data: lesson,
        message: 'Lesson marked as completed'
    });
});