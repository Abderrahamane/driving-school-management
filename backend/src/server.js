import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import lessonRoutes from "./routes/lesson.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

dotenv.config();
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connect to mongo
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/payments", paymentRoutes);

// default route
app.get("/", (req, res) => {
    res.send("Driving School Management System API is running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
