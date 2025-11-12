import mongoose from "mongoose";

const backupSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    },
    type: {
        type: String,
        enum: ['manual', 'automatic'],
        default: 'manual'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'restored'],
        default: 'completed'
    },
    sizeMB: {
        type: Number,
        default: 0
    },
    retentionDays: {
        type: Number,
        default: 30
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    restoredAt: {
        type: Date
    }
}, {
    timestamps: true
});

backupSchema.index({ admin: 1, createdAt: -1 });

export default mongoose.model("Backup", backupSchema);
