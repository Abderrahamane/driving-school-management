import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    experienceYears: Number,
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
});

export default mongoose.model("Instructor", instructorSchema);
