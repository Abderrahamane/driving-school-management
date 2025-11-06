import express from "express";
import {
    getInstructors,
    getInstructor,
    addInstructor,
    updateInstructor,
    deleteInstructor,
    getInstructorSchedule
} from "../controllers/instructor.controller.js";
import { protect } from "../middleware/validation.middleware.js";
import { validateInstructor } from "../middleware/validation.middleware.js";

const router = express.Router();

router.get("/", protect, getInstructors);
router.get("/:id", protect, getInstructor);
router.get("/:id/schedule", protect, getInstructorSchedule);
router.post("/", protect, validateInstructor, addInstructor);
router.put("/:id", protect, validateInstructor, updateInstructor);
router.delete("/:id", protect, deleteInstructor);

export default router;