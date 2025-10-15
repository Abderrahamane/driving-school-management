import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
    plateNumber: String,
    model: String,
    year: Number,
    status: { type: String, enum: ["available", "in-use", "maintenance"], default: "available" }
});

export default mongoose.model("Vehicle", vehicleSchema);
