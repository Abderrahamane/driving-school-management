import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    address: String,
    licenseType: String,
    registrationDate: { type: Date, default: Date.now }
});

export default mongoose.model("Student", studentSchema);
