import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor" },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    date: Date,
    time: String,
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    notes: String
});

export default mongoose.model("Lesson", lessonSchema);
