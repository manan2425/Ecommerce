import express from "express";
import { fetchActiveServices, getServiceById } from "../../controllers/admin/service-controller.js";

const router = express.Router();

// Get Active Services (for shop)
router.get("/get", fetchActiveServices);

// Get Single Service
router.get("/get/:id", getServiceById);

export default router;
