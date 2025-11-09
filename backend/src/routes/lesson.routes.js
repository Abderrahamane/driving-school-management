// backend/src/routes/lesson.routes.js

import express from "express";
import {
    getLessons,
    getLesson,
    addLesson,
    updateLesson,
    deleteLesson,
    checkAvailability,
    getLessonStats,
    completeLesson,
    getCalendarLessons,
    bulkScheduleLessons,
    getUpcomingLessons
} from "../controllers/lesson.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateLesson } from "../middleware/auth.middleware.js";

const router = express.Router();

// IMPORTANT: Specific routes MUST come before parameterized routes (:id)
router.get("/stats", protect, getLessonStats);
router.post("/check-availability", protect, checkAvailability);
router.get("/calendar", protect, getCalendarLessons);
router.post("/bulk-schedule", protect, bulkScheduleLessons);
router.get("/upcoming", protect, getUpcomingLessons);
router.put("/:id/complete", protect, completeLesson);

// Main CRUD routes
router.route("/")
    .get(protect, getLessons)
    .post(protect, validateLesson, addLesson);

router.route("/:id")
    .get(protect, getLesson)
    .put(protect, updateLesson)
    .delete(protect, deleteLesson);

export default router;