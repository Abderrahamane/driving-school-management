import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: [true, 'Student is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    method: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: {
            values: ['cash', 'card', 'transfer', 'check'],
            message: 'Invalid payment method'
        }
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'paid', 'refunded', 'failed'],
            message: 'Invalid payment status'
        },
        default: 'pending'
    },
    date: {
        type: Date,
        default: Date.now
    },
    paidDate: {
        type: Date
    },
    receiptNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    category: {
        type: String,
        enum: ['registration', 'lesson', 'exam-fee', 'material', 'other'],
        default: 'lesson'
    },
    transactionId: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        maxlength: [300, 'Notes cannot exceed 300 characters']
    }
}, {
    timestamps: true
});

// Index for efficient queries
paymentSchema.index({ studentId: 1, date: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ date: -1 });
paymentSchema.index({ receiptNumber: 1 });

// Auto-generate receipt number before saving if not provided
paymentSchema.pre('save', function(next) {
    if (!this.receiptNumber) {
        this.receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

export default mongoose.model("Payment", paymentSchema);