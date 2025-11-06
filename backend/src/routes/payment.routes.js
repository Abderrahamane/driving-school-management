import express from "express";
import {
    getPayments,
    getPayment,
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentStats,
    getStudentPayments,
    getPendingPayments,
    markAsPaid
} from "../controllers/payment.controller.js";
import { protect } from "../middleware/validation.middleware.js";
import { validatePayment } from "../middleware/validation.middleware.js";

const router = express.Router();

router.get("/stats", protect, getPaymentStats);
router.get("/pending", protect, getPendingPayments);
router.get("/student/:studentId", protect, getStudentPayments);
router.get("/", protect, getPayments);
router.get("/:id", protect, getPayment);
router.post("/", protect, validatePayment, addPayment);
router.put("/:id", protect, updatePayment);
router.put("/:id/mark-paid", protect, markAsPaid);
router.delete("/:id", protect, deletePayment);

export default router;