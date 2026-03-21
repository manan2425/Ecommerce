import express from "express";
import { submitServiceInquiry } from "../../controllers/shop/service-inquiry-controller.js";

const router = express.Router();

// Submit service inquiry
router.post("/submit", submitServiceInquiry);

export default router;
