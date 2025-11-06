import express from "express";
import {
    getLessons,
    getLesson,
    addLesson,
    updateLesson,
    deleteLesson,
    checkAvailability,
    getLessonStats,
    completeLesson
} from "../controllers/lesson.controller.js";
import { protect } from "../middleware/validation.middleware.js";
import { validateLesson } from "../middleware/validation.middleware.js";

const router = express.Router();

router.get("/stats", protect, getLessonStats);
router.post("/check-availability", protect, checkAvailability);
router.get("/", protect, getLessons);
router.get("/:id", protect, getLesson);
router.post("/", protect, validateLesson, addLesson);
router.put("/:id", protect, updateLesson);
router.put("/:id/complete", protect, completeLesson);
router.delete("/:id", protect, deleteLesson);

export default router;