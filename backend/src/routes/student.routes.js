import express from "express";
import {
    getStudents,
    getStudent,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentStats
} from "../controllers/student.controller.js";
import { protect } from "../middleware/validation.middleware.js";
import { validateStudent } from "../middleware/validation.middleware.js";

const router = express.Router();

router.get("/stats", protect, getStudentStats);
router.get("/", protect, getStudents);
router.get("/:id", protect, getStudent);
router.post("/", protect, validateStudent, addStudent);
router.put("/:id", protect, validateStudent, updateStudent);
router.delete("/:id", protect, deleteStudent);

export default router;