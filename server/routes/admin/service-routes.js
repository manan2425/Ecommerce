import express from "express";
import { 
    addService, 
    fetchAllServices, 
    editService, 
    deleteService, 
    getServiceById,
    toggleServiceStatus 
} from "../../controllers/admin/service-controller.js";

const router = express.Router();

// Add Service
router.post("/add", addService);

// Get All Services
router.get("/get", fetchAllServices);

// Get Single Service
router.get("/get/:id", getServiceById);

// Edit Service
router.put("/edit/:id", editService);

// Toggle Service Status
router.put("/toggle/:id", toggleServiceStatus);

// Delete Service
router.delete("/delete/:id", deleteService);

export default router;
