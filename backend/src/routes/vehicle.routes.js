import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from "../controllers/vehicle.controller.js";

const router = express.Router();

router.get("/", protect, getVehicles);
router.post("/", protect, addVehicle);
router.put("/:id", protect, updateVehicle);
router.delete("/:id", protect, deleteVehicle);

export default router;
