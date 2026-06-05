import express from "express";
import { submitServiceInquiry, getUserServiceInquiries } from "../../controllers/shop/service-inquiry-controller.js";

const router = express.Router();

// Submit service inquiry
router.post("/submit", submitServiceInquiry);

// Get service inquiries for user by email
router.get("/user/:email", getUserServiceInquiries);

export default router;
