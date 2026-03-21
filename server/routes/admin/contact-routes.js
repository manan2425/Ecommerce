import express from "express";
import { 
    getAllContacts, 
    getContactById, 
    updateContactStatus, 
    deleteContact,
    bulkDeleteContacts
} from "../../controllers/admin/contact-controller.js";

const router = express.Router();

// Get all contacts with pagination
router.get("/", getAllContacts);

// Get single contact
router.get("/:id", getContactById);

// Update contact status/notes
router.put("/:id", updateContactStatus);

// Delete single contact
router.delete("/:id", deleteContact);

// Bulk delete contacts
router.post("/bulk-delete", bulkDeleteContacts);

export default router;
