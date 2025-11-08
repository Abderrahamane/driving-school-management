// backend/src/routes/instructor.routes.js
import express from "express";
import {
    getInstructors,
    getInstructor,
    addInstructor,
    updateInstructor,
    deleteInstructor,
    getInstructorSchedule,
    getInstructorStats
} from "../controllers/instructor.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateInstructor } from "../middleware/auth.middleware.js";

const router = express.Router();

// IMPORTANT: Stats route MUST come before :id routes to avoid route conflicts
router.get("/stats", protect, getInstructorStats);
router.get("/:id/schedule", protect, getInstructorSchedule);

// Main CRUD routes
router.route("/")
    .get(protect, getInstructors)
    .post(protect, validateInstructor, addInstructor);

router.route("/:id")
    .get(protect, getInstructor)
    .put(protect, validateInstructor, updateInstructor)
    .delete(protect, deleteInstructor);

export default router;