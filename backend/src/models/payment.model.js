import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    amount: Number,
    method: { type: String, enum: ["cash", "card"] },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["paid", "pending"], default: "pending" }
});

export default mongoose.model("Payment", paymentSchema);
