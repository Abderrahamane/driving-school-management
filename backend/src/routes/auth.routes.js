import express from "express";
import {
    registerAdmin,
    loginAdmin,
    getMe,
    updatePassword,
    logoutAdmin
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/validation.middleware.js";
import { validateLogin, validateRegister } from "../middleware/validation.middleware.js";

const router = express.Router();

router.post("/register", validateRegister, registerAdmin);
router.post("/login", validateLogin, loginAdmin);
router.get("/me", protect, getMe);
router.put("/updatepassword", protect, updatePassword);
router.post("/logout", protect, logoutAdmin);

export default router;