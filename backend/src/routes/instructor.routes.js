import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getInstructors, addInstructor, updateInstructor, deleteInstructor } from "../controllers/instructor.controller.js";

const router = express.Router();

router.get("/", protect, getInstructors);
router.post("/", protect, addInstructor);
router.put("/:id", protect, updateInstructor);
router.delete("/:id", protect, deleteInstructor);

export default router;
