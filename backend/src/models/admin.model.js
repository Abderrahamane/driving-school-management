import mongoose from "mongoose";


// to be updated as the table:
const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

export default mongoose.model("Admin", adminSchema);
