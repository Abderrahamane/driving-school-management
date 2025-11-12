// backend/src/controllers/payment.controller.js
import Payment from "../models/payment.model.js";
import Student from "../models/student.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
export const getPayments = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.query.status) {
        query.status = req.query.status;
    }

    if (req.query.studentId) {
        query.studentId = req.query.studentId;
    }

    const payments = await Payment.find(query)
        .populate('studentId', 'name email phone')
        .sort('-date')
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
        .populate('studentId', 'name email phone');

    if (!payment) {
        return next(new AppError('Payment not found', 404));
    }

    res.status(200).json({
        success: true,
        data: payment
    });
});

// @desc    Create payment
// @route   POST /api/payments
// @access  Private
export const addPayment = asyncHandler(async (req, res, next) => {
    const student = await Student.findById(req.body.studentId);

    if (!student) {
        return next(new AppError('Student not found', 404));
    }

    const payment = await Payment.create(req.body);

    await payment.populate('studentId', 'name email phone');

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
    ).populate('studentId', 'name email phone');

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
    const totalPaid = await Payment.countDocuments({ status: 'paid' });
    const totalPending = await Payment.countDocuments({ status: 'pending' });

    // Calculate revenue
    const paidPayments = await Payment.find({ status: 'paid' });
    const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);

    const pendingPayments = await Payment.find({ status: 'pending' });
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    // Group by method
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

    res.status(200).json({
        success: true,
        data: {
            totalPaid,
            totalPending,
            totalRevenue,
            pendingAmount,
            byMethod
        }
    });
});

// @desc    Get student payments
// @route   GET /api/payments/student/:studentId
// @access  Private
export const getStudentPayments = asyncHandler(async (req, res, next) => {
    const student = await Student.findById(req.params.studentId);

    if (!student) {
        return next(new AppError('Student not found', 404));
    }

    const payments = await Payment.find({ studentId: req.params.studentId })
        .sort('-date');

    const totalPaid = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
        success: true,
        data: {
            payments,
            summary: {
                totalPaid,
                totalPending,
                paymentCount: payments.length
            }
        }
    });
});

// @desc    Get pending payments
// @route   GET /api/payments/pending
// @access  Private
export const getPendingPayments = asyncHandler(async (req, res, next) => {
    const payments = await Payment.find({ status: 'pending' })
        .populate('studentId', 'name email phone')
        .sort('date');

    res.status(200).json({
        success: true,
        count: payments.length,
        data: payments
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

    payment.status = 'paid';
    payment.paidDate = new Date();
    await payment.save();

    await payment.populate('studentId', 'name email phone');

    res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment marked as paid'
    });
});