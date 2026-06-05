import ServiceInquiry from "../../models/ServiceInquiry.js";
import Service from "../../models/Service.js";
import { getIO } from "../../helpers/socket.js";
import { sendServiceInquiryNotification } from "../../helpers/emailService.js";

// Submit service inquiry form (public - no auth required)
export const submitServiceInquiry = async (req, res) => {
    try {
        const { name, email, phone, company, serviceId, message, budget, timeline } = req.body;

        // Validate required fields
        if (!name || !email || !serviceId || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, service, and message are required"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        // Fetch service details
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // Create new service inquiry
        const newInquiry = new ServiceInquiry({
            name,
            email,
            phone: phone || "",
            company: company || "",
            service: serviceId,
            serviceTitle: service.title,
            serviceCategory: service.category || "",
            message,
            budget: budget || "",
            timeline: timeline || "",
            status: "new"
        });

        await newInquiry.save();

        // Populate service for socket emission
        await newInquiry.populate('service', 'title category price');

        // Emit socket event for real-time update in admin
        const io = getIO();
        if (io) {
            io.emit("new-service-inquiry", newInquiry);
        }

        // Send email notification to admin
        sendServiceInquiryNotification(newInquiry, service).catch(err => console.log('Email notification failed:', err));

        res.status(201).json({
            success: true,
            message: "Thank you for your inquiry! We'll get back to you within 24 hours."
        });
    } catch (error) {
        console.error("Error submitting service inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit inquiry. Please try again."
        });
    }
};

// Get service inquiries submitted by user email
export const getUserServiceInquiries = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const inquiries = await ServiceInquiry.find({ email: email.toLowerCase() })
            .populate("service", "title category price image")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: inquiries
        });
    } catch (error) {
        console.error("Error fetching user service inquiries:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch inquiries. Please try again."
        });
    }
};
