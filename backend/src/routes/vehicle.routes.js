// backend/src/routes/vehicle.routes.js
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
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    getVehicleStats,
    updateMileage
} from "../controllers/vehicle.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateVehicle } from "../middleware/auth.middleware.js";

const router = express.Router();

// Stats route (must come first)
router.get("/stats", protect, getVehicleStats);

// Main CRUD routes
router.route("/")
    .get(protect, getVehicles)
    .post(protect, validateVehicle, addVehicle);

// Specific vehicle routes
router.route("/:id")
    .get(protect, getVehicle)
    .put(protect, validateVehicle, updateVehicle)
    .delete(protect, deleteVehicle);

// Availability routes
router.get("/:id/availability", protect, getVehicleAvailability);

// Maintenance routes
router.route("/:id/maintenance")
    .get(protect, getVehicleMaintenanceHistory)
    .post(protect, addMaintenanceRecord);

router.route("/:id/maintenance/:maintenanceId")
    .put(protect, updateMaintenanceRecord)
    .delete(protect, deleteMaintenanceRecord);

// Mileage update
router.patch("/:id/mileage", protect, updateMileage);

export default router;