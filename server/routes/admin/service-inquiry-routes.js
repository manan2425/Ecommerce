import express from "express";
import { 
    getAllServiceInquiries, 
    getServiceInquiryById, 
    updateServiceInquiryStatus, 
    deleteServiceInquiry,
    bulkDeleteServiceInquiries
} from "../../controllers/admin/service-inquiry-controller.js";

const router = express.Router();

// Get all service inquiries with pagination
router.get("/", getAllServiceInquiries);

// Get single service inquiry
router.get("/:id", getServiceInquiryById);

// Update service inquiry status/notes
router.put("/:id", updateServiceInquiryStatus);

// Delete single service inquiry
router.delete("/:id", deleteServiceInquiry);

// Bulk delete service inquiries
router.post("/bulk-delete", bulkDeleteServiceInquiries);

export default router;
