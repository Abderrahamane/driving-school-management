import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getLessons, addLesson, updateLesson, deleteLesson } from "../controllers/lesson.controller.js";

const router = express.Router();

router.get("/", protect, getLessons);
router.post("/", protect, addLesson);
router.put("/:id", protect, updateLesson);
router.delete("/:id", protect, deleteLesson);

export default router;
