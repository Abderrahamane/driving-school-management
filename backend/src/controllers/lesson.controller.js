import Lesson from "../models/lesson.model.js";
import Student from "../models/student.model.js";
import Instructor from "../models/instructor.model.js";
import Vehicle from "../models/vehicle.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

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

// @desc    Get lessons with advanced filtering
// @route   GET /api/lessons
// @access  Private

// @desc    Get lessons with advanced filtering
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

    // Filter by lesson type
    if (req.query.lessonType) {
        query.lessonType = req.query.lessonType;
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

    // Search functionality - simpler approach without filtering after population
    if (req.query.search) {
        // If there's a search term, we need to search across related collections
        const searchRegex = new RegExp(req.query.search, 'i');

        // Find matching students, instructors, and vehicles
        const [students, instructors, vehicles] = await Promise.all([
            Student.find({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                    { phone: searchRegex }
                ]
            }).select('_id'),
            Instructor.find({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex }
                ]
            }).select('_id'),
            Vehicle.find({
                $or: [
                    { plateNumber: searchRegex },
                    { model: searchRegex }
                ]
            }).select('_id')
        ]);

        const studentIds = students.map(s => s._id);
        const instructorIds = instructors.map(i => i._id);
        const vehicleIds = vehicles.map(v => v._id);

        // Add search criteria to query
        if (studentIds.length > 0 || instructorIds.length > 0 || vehicleIds.length > 0) {
            query.$or = [];
            if (studentIds.length > 0) {
                query.$or.push({ studentId: { $in: studentIds } });
            }
            if (instructorIds.length > 0) {
                query.$or.push({ instructorId: { $in: instructorIds } });
            }
            if (vehicleIds.length > 0) {
                query.$or.push({ vehicleId: { $in: vehicleIds } });
            }
        } else {
            // No matches found, return empty result
            return res.status(200).json({
                success: true,
                count: 0,
                pagination: {
                    page,
                    limit,
                    total: 0,
                    pages: 0
                },
                data: []
            });
        }
    }

    // Execute query with population
    const lessons = await Lesson.find(query)
        .populate('studentId', 'name email phone licenseType')
        .populate('instructorId', 'name email experienceYears phone')
        .populate('vehicleId', 'plateNumber model year transmission fuelType')
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

// @desc    Get enhanced lesson statistics
// @route   GET /api/lessons/stats
// @access  Private
export const getLessonStats = asyncHandler(async (req, res, next) => {
    try {
        const total = await Lesson.countDocuments();
        const scheduled = await Lesson.countDocuments({ status: 'scheduled' });
        const completed = await Lesson.countDocuments({ status: 'completed' });
        const cancelled = await Lesson.countDocuments({ status: 'cancelled' });
        const noShow = await Lesson.countDocuments({ status: 'no-show' });
        const inProgress = await Lesson.countDocuments({ status: 'in-progress' });

        // Upcoming lessons (next 7 days)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        const upcoming = await Lesson.countDocuments({
            date: { $gte: today, $lte: nextWeek },
            status: 'scheduled'
        });

        // Today's lessons
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayLessons = await Lesson.countDocuments({
            date: { $gte: today, $lt: tomorrow },
            status: { $in: ['scheduled', 'in-progress'] }
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

        // Lessons by type
        const byType = await Lesson.aggregate([
            {
                $group: {
                    _id: '$lessonType',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Average duration - safely handle empty results
        const avgDurationResult = await Lesson.aggregate([
            {
                $group: {
                    _id: null,
                    avgDuration: { $avg: '$duration' }
                }
            }
        ]);
        const avgDuration = avgDurationResult.length > 0 && avgDurationResult[0].avgDuration
            ? Math.round(avgDurationResult[0].avgDuration)
            : 0;

        // Completion rate
        const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

        res.status(200).json({
            success: true,
            data: {
                total: total || 0,
                scheduled: scheduled || 0,
                completed: completed || 0,
                cancelled: cancelled || 0,
                noShow: noShow || 0,
                inProgress: inProgress || 0,
                upcoming: upcoming || 0,
                todayLessons: todayLessons || 0,
                byStatus: byStatus || [],
                byType: byType || [],
                avgDuration: avgDuration || 0,
                completionRate: parseFloat(completionRate) || 0
            }
        });
    } catch (error) {
        console.error('Stats calculation error:', error);
        // Return default values instead of throwing error
        res.status(200).json({
            success: true,
            data: {
                total: 0,
                scheduled: 0,
                completed: 0,
                cancelled: 0,
                noShow: 0,
                inProgress: 0,
                upcoming: 0,
                todayLessons: 0,
                byStatus: [],
                byType: [],
                avgDuration: 0,
                completionRate: 0
            }
        });
    }
});

// @desc    Complete a lesson with rating
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

    // Update lesson
    lesson.status = 'completed';
    lesson.notes = req.body.notes || lesson.notes;

    // Add rating if provided
    if (req.body.rating && req.body.rating >= 1 && req.body.rating <= 5) {
        lesson.rating = req.body.rating;
    }

    await lesson.save();

    // Update student progress
    const student = await Student.findById(lesson.studentId);
    if (student) {
        if (lesson.lessonType === 'theory') {
            student.progress.theoryLessons += 1;
        } else if (lesson.lessonType === 'practical' || lesson.lessonType === 'test-preparation') {
            student.progress.practicalLessons += 1;
        }
        await student.save();
    }

    // Populate lesson data for response
    await lesson.populate([
        { path: 'studentId', select: 'name email phone' },
        { path: 'instructorId', select: 'name email' },
        { path: 'vehicleId', select: 'plateNumber model' }
    ]);

    res.status(200).json({
        success: true,
        data: lesson,
        message: 'Lesson marked as completed'
    });
});

// @desc    Check availability with detailed conflict info
// @route   POST /api/lessons/check-availability
// @access  Private
export const checkAvailability = asyncHandler(async (req, res, next) => {
    const { instructorId, vehicleId, date, time } = req.body;

    if (!instructorId || !vehicleId || !date || !time) {
        return next(new AppError('All fields are required', 400));
    }

    const query = {
        date: new Date(date),
        time,
        status: { $in: ['scheduled', 'in-progress'] },
        $or: [
            { instructorId },
            { vehicleId }
        ]
    };

    const conflicts = await Lesson.find(query)
        .populate('instructorId', 'name')
        .populate('vehicleId', 'plateNumber')
        .populate('studentId', 'name');

    const conflictDetails = conflicts.map(c => {
        let detail = { time: c.time };

        if (c.instructorId._id.toString() === instructorId) {
            detail.instructor = c.instructorId.name;
            detail.studentWith = c.studentId?.name;
        }

        if (c.vehicleId._id.toString() === vehicleId) {
            detail.vehicle = c.vehicleId.plateNumber;
            detail.studentWith = c.studentId?.name;
        }

        return detail;
    });

    res.status(200).json({
        success: true,
        data: {
            available: conflicts.length === 0,
            conflicts: conflictDetails
        }
    });
});

// @desc    Get lessons calendar data (all lessons for a month)
// @route   GET /api/lessons/calendar
// @access  Private
export const getCalendarLessons = asyncHandler(async (req, res, next) => {
    const { year, month } = req.query;

    if (!year || !month) {
        return next(new AppError('Year and month are required', 400));
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const lessons = await Lesson.find({
        date: {
            $gte: startDate,
            $lte: endDate
        }
    })
        .populate('studentId', 'name email phone')
        .populate('instructorId', 'name')
        .populate('vehicleId', 'plateNumber model')
        .sort('date time');

    res.status(200).json({
        success: true,
        data: lessons
    });
});

// @desc    Bulk schedule lessons
// @route   POST /api/lessons/bulk-schedule
// @access  Private
export const bulkScheduleLessons = asyncHandler(async (req, res, next) => {
    const { lessons } = req.body;

    if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
        return next(new AppError('Please provide an array of lessons', 400));
    }

    const createdLessons = [];
    const errors = [];

    for (let i = 0; i < lessons.length; i++) {
        try {
            const lessonData = lessons[i];

            // Validate required fields
            if (!lessonData.studentId || !lessonData.instructorId || !lessonData.vehicleId ||
                !lessonData.date || !lessonData.time) {
                errors.push({
                    index: i,
                    error: 'Missing required fields'
                });
                continue;
            }

            // Check for conflicts
            const conflicts = await Lesson.find({
                date: new Date(lessonData.date),
                time: lessonData.time,
                status: { $in: ['scheduled', 'in-progress'] },
                $or: [
                    { instructorId: lessonData.instructorId },
                    { vehicleId: lessonData.vehicleId }
                ]
            });

            if (conflicts.length > 0) {
                errors.push({
                    index: i,
                    error: 'Schedule conflict detected'
                });
                continue;
            }

            // Create lesson
            const lesson = await Lesson.create(lessonData);
            await lesson.populate([
                { path: 'studentId', select: 'name email' },
                { path: 'instructorId', select: 'name email' },
                { path: 'vehicleId', select: 'plateNumber model' }
            ]);

            createdLessons.push(lesson);
        } catch (error) {
            errors.push({
                index: i,
                error: error.message
            });
        }
    }

    res.status(201).json({
        success: true,
        data: {
            created: createdLessons,
            errors,
            summary: {
                total: lessons.length,
                successful: createdLessons.length,
                failed: errors.length
            }
        },
        message: `${createdLessons.length} lessons scheduled successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    });
});

// @desc    Get upcoming lessons for dashboard
// @route   GET /api/lessons/upcoming
// @access  Private
export const getUpcomingLessons = asyncHandler(async (req, res, next) => {

    const limit = parseInt(req.query.limit) || 10;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lessons = await Lesson.find({
        date: { $gte: today },
        status: 'scheduled'
    })
        .populate('studentId', 'name email phone')
        .populate('instructorId', 'name')
        .populate('vehicleId', 'plateNumber model')
        .sort('date time')
        .limit(limit);

    res.status(200).json({
        success: true,
        count: lessons.length,
        data: lessons
    });
});
