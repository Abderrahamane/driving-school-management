import Payment from "../models/payment.model.js";
import Student from "../models/student.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// @desc    Get all payments with pagination and filtering
// @route   GET /api/payments
// @access  Private
export const getPayments = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Filter by payment method
    if (req.query.method) {
        query.method = req.query.method;
    }

    // Filter by student
    if (req.query.studentId) {
        query.studentId = req.query.studentId;
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

    // Filter by amount range
    if (req.query.minAmount) {
        query.amount = { ...query.amount, $gte: parseFloat(req.query.minAmount) };
    }
    if (req.query.maxAmount) {
        query.amount = { ...query.amount, $lte: parseFloat(req.query.maxAmount) };
    }

    const payments = await Payment.find(query)
        .populate('studentId', 'name email phone')
        .sort(req.query.sortBy || '-date')
        .skip(skip)
        .limit(limit);

    const total = await Payment.countDocuments(query);

    res.status(200).json({
        success: true,
        count: payments.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: payments
    });
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
export const getPayment = asyncHandler(async (req, res, next) => {
    const payment = await Payment.findById(req.params.id)
        .populate('studentId', 'name email phone licenseType');

    if (!payment) {
        return next(new AppError('Payment not found', 404));
    }

    res.status(200).json({
        success: true,
        data: payment
    });
});

// @desc    Record new payment
// @route   POST /api/payments
// @access  Private
export const addPayment = asyncHandler(async (req, res, next) => {
    const { studentId, amount, method } = req.body;

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
        return next(new AppError('Student not found', 404));
    }

    // Create payment
    const payment = await Payment.create({
        studentId,
        amount,
        method,
        status: req.body.status || 'paid',
        description: req.body.description,
        receiptNumber: req.body.receiptNumber || `RCP-${Date.now()}`
    });

    // Populate before returning
    await payment.populate('studentId', 'name email');

    res.status(201).json({
        success: true,
        data: payment,
        message: 'Payment recorded successfully'
    });
});

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private
export const updatePayment = asyncHandler(async (req, res, next) => {
    let payment = await Payment.findById(req.params.id);

    if (!payment) {
        return next(new AppError('Payment not found', 404));
    }

    payment = await Payment.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    ).populate('studentId', 'name email');

    res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment updated successfully'
    });
});

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private
export const deletePayment = asyncHandler(async (req, res, next) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
        return next(new AppError('Payment not found', 404));
    }

    await payment.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
        message: 'Payment deleted successfully'
    });
});

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private
export const getPaymentStats = asyncHandler(async (req, res, next) => {
    // Total payments
    const total = await Payment.countDocuments();
    const totalPaid = await Payment.countDocuments({ status: 'paid' });
    const totalPending = await Payment.countDocuments({ status: 'pending' });

    // Total revenue
    const revenueResult = await Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Pending amount
    const pendingResult = await Payment.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const pendingAmount = pendingResult.length > 0 ? pendingResult[0].total : 0;

    // Revenue by method
    const byMethod = await Payment.aggregate([
        { $match: { status: 'paid' } },
        {
            $group: {
                _id: '$method',
                count: { $sum: 1 },
                amount: { $sum: '$amount' }
            }
        }
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Payment.aggregate([
        {
            $match: {
                status: 'paid',
                date: { $gte: sixMonthsAgo }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                },
                revenue: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            total,
            totalPaid,
            totalPending,
            totalRevenue,
            pendingAmount,
            byMethod,
            monthlyRevenue
        }
    });
});

// @desc    Get student payment history
// @route   GET /api/payments/student/:studentId
// @access  Private
export const getStudentPayments = asyncHandler(async (req, res, next) => {
    const student = await Student.findById(req.params.studentId);

    if (!student) {
        return next(new AppError('Student not found', 404));
    }

    const payments = await Payment.find({ studentId: req.params.studentId })
        .sort('-date');

    // Calculate totals
    const totalPaid = await Payment.aggregate([
        {
            $match: {
                studentId: student._id,
                status: 'paid'
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]);

    const totalPending = await Payment.aggregate([
        {
            $match: {
                studentId: student._id,
                status: 'pending'
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            student: {
                id: student._id,
                name: student.name,
                email: student.email
            },
            payments,
            summary: {
                totalPaid: totalPaid.length > 0 ? totalPaid[0].total : 0,
                totalPending: totalPending.length > 0 ? totalPending[0].total : 0,
                paymentCount: payments.length
            }
        }
    });
});

// @desc    Get pending payments
// @route   GET /api/payments/pending
// @access  Private
export const getPendingPayments = asyncHandler(async (req, res, next) => {
    const pendingPayments = await Payment.find({ status: 'pending' })
        .populate('studentId', 'name email phone')
        .sort('date');

    const totalPending = await Payment.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
        success: true,
        count: pendingPayments.length,
        totalAmount: totalPending.length > 0 ? totalPending[0].total : 0,
        data: pendingPayments
    });
});

// @desc    Mark payment as paid
// @route   PUT /api/payments/:id/mark-paid
// @access  Private
export const markAsPaid = asyncHandler(async (req, res, next) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
        return next(new AppError('Payment not found', 404));
    }

    if (payment.status === 'paid') {
        return next(new AppError('Payment is already marked as paid', 400));
    }

    payment.status = 'paid';
    payment.paidDate = new Date();
    await payment.save();

    res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment marked as paid'
    });
});