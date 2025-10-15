import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getPayments, addPayment, updatePayment, deletePayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.get("/", protect, getPayments);
router.post("/", protect, addPayment);
router.put("/:id", protect, updatePayment);
router.delete("/:id", protect, deletePayment);

export default router;
