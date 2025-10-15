import mongoose from "mongoose";


const MONGO_URI = "mongodb://127.0.0.1:27017/driving_school"; // later, i will put this in .env

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
