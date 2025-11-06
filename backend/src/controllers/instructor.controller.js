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

    if (req.query.search) {
        query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    if (req.query.minExperience) {
        query.experienceYears = { $gte: parseInt(req.query.minExperience) };
    }

    const instructors = await Instructor.find(query)
        .populate('assignedStudents', 'name email')
        .sort(req.query.sortBy || '-createdAt')
        .skip(skip)
        .limit(limit);

    const total = await Instructor.countDocuments(query);

    res.status(200).json({
        success: true,
        count: instructors.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: instructors
    });
});

// @desc    Get single instructor
// @route   GET /api/instructors/:id
// @access  Private
export const getInstructor = asyncHandler(async (req, res, next) => {
    const instructor = await Instructor.findById(req.params.id)
        .populate('assignedStudents', 'name email phone licenseType');

    if (!instructor) {
        return next(new AppError('Instructor not found', 404));
    }

    res.status(200).json({
        success: true,
        data: instructor
    });
});

// @desc    Create new instructor
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

    // Check if instructor has active lessons
    const activeLessons = await Lesson.countDocuments({
        instructorId: req.params.id,
        status: 'scheduled'
    });

    if (activeLessons > 0) {
        return next(new AppError('Cannot delete instructor with active lessons', 400));
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

    const lessons = await Lesson.find({
        instructorId: req.params.id,
        date: { $gte: new Date() }
    })
        .populate('studentId', 'name email')
        .populate('vehicleId', 'plateNumber model')
        .sort('date time');

    res.status(200).json({
        success: true,
        data: lessons
    });
});