import Student from "../models/student.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// @desc    Get all students with pagination and filtering
// @route   GET /api/students
// @access  Private
export const getStudents = asyncHandler(async (req, res, next) => {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    let query = {};

    if (req.query.licenseType) {
        query.licenseType = req.query.licenseType;
    }

    if (req.query.search) {
        query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
            { phone: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    // Sorting
    const sortBy = req.query.sortBy || '-registrationDate';

    // Execute query
    const students = await Student.find(query)
        .sort(sortBy)
        .skip(skip)
        .limit(limit);

    // Get total count for pagination
    const total = await Student.countDocuments(query);

    res.status(200).json({
        success: true,
        count: students.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: students
    });
});

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private
export const getStudent = asyncHandler(async (req, res, next) => {
    const student = await Student.findById(req.params.id);

    if (!student) {
        return next(new AppError('Student not found', 404));
    }

    res.status(200).json({
        success: true,
        data: student
    });
});

// @desc    Create new student
// @route   POST /api/students
// @access  Private
export const addStudent = asyncHandler(async (req, res, next) => {
    // Check if student with email already exists
    const existingStudent = await Student.findOne({ email: req.body.email });

    if (existingStudent) {
        return next(new AppError('Student with this email already exists', 400));
    }

    const student = await Student.create(req.body);

    res.status(201).json({
        success: true,
        data: student,
        message: 'Student created successfully'
    });
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
export const updateStudent = asyncHandler(async (req, res, next) => {
    let student = await Student.findById(req.params.id);

    if (!student) {
        return next(new AppError('Student not found', 404));
    }

    // Check if email is being changed and if new email already exists
    if (req.body.email && req.body.email !== student.email) {
        const emailExists = await Student.findOne({ email: req.body.email });
        if (emailExists) {
            return next(new AppError('Email already in use', 400));
        }
    }

    student = await Student.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        success: true,
        data: student,
        message: 'Student updated successfully'
    });
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
export const deleteStudent = asyncHandler(async (req, res, next) => {
    const student = await Student.findById(req.params.id);

    if (!student) {
        return next(new AppError('Student not found', 404));
    }

    await student.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
        message: 'Student deleted successfully'
    });
});

// @desc    Get student statistics
// @route   GET /api/students/stats
// @access  Private
export const getStudentStats = asyncHandler(async (req, res, next) => {
    const stats = await Student.aggregate([
        {
            $group: {
                _id: '$licenseType',
                count: { $sum: 1 }
            }
        }
    ]);

    const total = await Student.countDocuments();
    const recentlyRegistered = await Student.countDocuments({
        registrationDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({
        success: true,
        data: {
            total,
            recentlyRegistered,
            byLicenseType: stats
        }
    });
});