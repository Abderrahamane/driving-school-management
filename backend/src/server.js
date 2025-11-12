import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/error.middleware.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Import routes
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import lessonRoutes from "./routes/lesson.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

// API Routes - Version 1
const API_VERSION = '/api/v1';

app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/students`, studentRoutes);
app.use(`${API_VERSION}/instructors`, instructorRoutes);
app.use(`${API_VERSION}/vehicles`, vehicleRoutes);
app.use(`${API_VERSION}/lessons`, lessonRoutes);
app.use(`${API_VERSION}/payments`, paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Default route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Driving School Management System API",
        version: "1.0.0",
        endpoints: {
            auth: `${API_VERSION}/auth`,
            students: `${API_VERSION}/students`,
            instructors: `${API_VERSION}/instructors`,
            vehicles: `${API_VERSION}/vehicles`,
            lessons: `${API_VERSION}/lessons`,
            payments: `${API_VERSION}/payments`
        },
        documentation: "See README.md for API documentation"
    });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚗 Driving School Management System API                ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Server running on port: ${PORT}                          ║
║   API Base URL: http://localhost:${PORT}${API_VERSION}            ║
║                                                           ║
║   📚 Available Endpoints:                                 ║
║   • Auth:        ${API_VERSION}/auth                      ║
║   • Students:    ${API_VERSION}/students                  ║
║   • Instructors: ${API_VERSION}/instructors               ║
║   • Vehicles:    ${API_VERSION}/vehicles                  ║
║   • Lessons:     ${API_VERSION}/lessons                   ║
║   • Payments:    ${API_VERSION}/payments                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

export default app;