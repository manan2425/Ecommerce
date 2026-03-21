import express from "express";
import { submitContactForm } from "../../controllers/shop/contact-controller.js";

const router = express.Router();

// Submit contact form (public - no auth required)
router.post("/submit", submitContactForm);

export default router;
