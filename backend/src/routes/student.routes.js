import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getStudents, addStudent, updateStudent, deleteStudent } from "../controllers/student.controller.js";

const router = express.Router();

router.get("/", protect, getStudents);
router.post("/", protect, addStudent);
router.put("/:id", protect, updateStudent);
router.delete("/:id", protect, deleteStudent);

export default router;
