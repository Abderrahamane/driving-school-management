import express from "express";
import {
    getVehicles,
    getVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicleAvailability,
    getVehicleMaintenanceHistory,
    addMaintenanceRecord,
    getVehicleStats
} from "../controllers/vehicle.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateVehicle } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/stats", protect, getVehicleStats);
router.get("/", protect, getVehicles);
router.get("/:id", protect, getVehicle);
router.get("/:id/availability", protect, getVehicleAvailability);
router.get("/:id/maintenance", protect, getVehicleMaintenanceHistory);
router.post("/:id/maintenance", protect, addMaintenanceRecord);
router.post("/", protect, validateVehicle, addVehicle);
router.put("/:id", protect, validateVehicle, updateVehicle);
router.delete("/:id", protect, deleteVehicle);

export default router;