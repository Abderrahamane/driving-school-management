// backend/src/controllers/instructor.controller.js
import Instructor from "../models/instructor.model.js";
import Lesson from "../models/lesson.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// @desc    Get all instructors with pagination and filtering
// @route   GET /api/instructors
// @access  Private
export const getInstructors = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Search
    if (req.query.search) {
        query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
            { phone: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    const instructors = await Instructor.find(query)
        .sort(req.query.sortBy || '-createdAt')
        .skip(skip)
        .limit(limit);

    // Add stats for each instructor
    const instructorsWithStats = await Promise.all(
        instructors.map(async (instructor) => {
            const totalLessons = await Lesson.countDocuments({ instructorId: instructor._id });
            const completedLessons = await Lesson.countDocuments({
                instructorId: instructor._id,
                status: 'completed'
            });

            return {
                ...instructor.toJSON(),
                stats: {
                    totalLessons,
                    completedLessons,
                    avgRating: 4.5, // Mock data - implement real rating system
                    totalReviews: Math.floor(totalLessons * 0.7) // Mock data
                }
            };
        })
    );

    const total = await Instructor.countDocuments(query);

    res.status(200).json({
        success: true,
        count: instructorsWithStats.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: instructorsWithStats
    });
});

// @desc    Get single instructor
// @route   GET /api/instructors/:id
// @access  Private
export const getInstructor = asyncHandler(async (req, res, next) => {
    const instructor = await Instructor.findById(req.params.id);

    if (!instructor) {
        return next(new AppError('Instructor not found', 404));
    }

    // Get stats
    const totalLessons = await Lesson.countDocuments({ instructorId: instructor._id });
    const completedLessons = await Lesson.countDocuments({
        instructorId: instructor._id,
        status: 'completed'
    });

    const instructorWithStats = {
        ...instructor.toJSON(),
        stats: {
            totalLessons,
            completedLessons,
            avgRating: 4.5,
            totalReviews: Math.floor(totalLessons * 0.7)
        }
    };

    res.status(200).json({
        success: true,
        data: instructorWithStats
    });
});

// @desc    Create instructor
// @route   POST /api/instructors
// @access  Private
export const addInstructor = asyncHandler(async (req, res, next) => {
    const existingInstructor = await Instructor.findOne({ email: req.body.email });

    if (existingInstructor) {
        return next(new AppError('Instructor with this email already exists', 400));
    }

    const instructor = await Instructor.create(req.body);

    res.status(201).json({
        success: true,
        data: instructor,
        message: 'Instructor created successfully'
    });
});

// @desc    Update instructor
// @route   PUT /api/instructors/:id
// @access  Private
export const updateInstructor = asyncHandler(async (req, res, next) => {
    let instructor = await Instructor.findById(req.params.id);

    if (!instructor) {
        return next(new AppError('Instructor not found', 404));
    }

    // Check if email is being changed
    if (req.body.email && req.body.email !== instructor.email) {
        const emailExists = await Instructor.findOne({ email: req.body.email });
        if (emailExists) {
            return next(new AppError('Email already in use', 400));
        }
    }

    instructor = await Instructor.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        data: instructor,
        message: 'Instructor updated successfully'
    });
});

// @desc    Delete instructor
// @route   DELETE /api/instructors/:id
// @access  Private
export const deleteInstructor = asyncHandler(async (req, res, next) => {
    const instructor = await Instructor.findById(req.params.id);

    if (!instructor) {
        return next(new AppError('Instructor not found', 404));
    }

    // Check for active lessons
    const activeLessons = await Lesson.countDocuments({
        instructorId: req.params.id,
        status: 'scheduled'
    });

    if (activeLessons > 0) {
        return next(new AppError('Cannot delete instructor with scheduled lessons', 400));
    }

    await instructor.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
        message: 'Instructor deleted successfully'
    });
});

// @desc    Get instructor schedule
// @route   GET /api/instructors/:id/schedule
// @access  Private
export const getInstructorSchedule = asyncHandler(async (req, res, next) => {
    const instructor = await Instructor.findById(req.params.id);

    if (!instructor) {
        return next(new AppError('Instructor not found', 404));
    }

    const { startDate, endDate } = req.query;
    let dateQuery = {};

    if (startDate && endDate) {
        dateQuery.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const lessons = await Lesson.find({
        instructorId: req.params.id,
        ...dateQuery,
        status: { $in: ['scheduled', 'in-progress'] }
    })
        .populate('studentId', 'name email')
        .populate('vehicleId', 'plateNumber model')
        .sort('date time');

    res.status(200).json({
        success: true,
        data: lessons
    });
});

// @desc    Get instructor statistics
// @route   GET /api/instructors/stats
// @access  Private
export const getInstructorStats = asyncHandler(async (req, res, next) => {
    const total = await Instructor.countDocuments();
    const active = await Instructor.countDocuments({ status: 'active' });
    const inactive = await Instructor.countDocuments({ status: 'inactive' });
    const onLeave = await Instructor.countDocuments({ status: 'on-leave' });

    // Calculate average experience
    const instructors = await Instructor.find();
    const avgExperience = instructors.length > 0
        ? Math.round(instructors.reduce((sum, i) => sum + (i.experienceYears || 0), 0) / instructors.length)
        : 0;

    // Get total lessons taught
    const totalLessons = await Lesson.countDocuments({
        status: 'completed'
    });

    res.status(200).json({
        success: true,
        data: {
            total,
            active,
            inactive,
            onLeave,
            avgExperience,
            totalLessons
        }
    });
});