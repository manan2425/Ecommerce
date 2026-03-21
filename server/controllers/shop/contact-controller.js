import Contact from "../../models/Contact.js";
import { getIO } from "../../helpers/socket.js";

// Submit contact form (public - no auth required)
export const submitContactForm = async (req, res) => {
    try {
        const { name, email, phone, company, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and message are required"
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

        // Create new contact
        const newContact = new Contact({
            name,
            email,
            phone: phone || "",
            company: company || "",
            subject: subject || "General Inquiry",
            message,
            status: "new"
        });

        await newContact.save();

        // Emit socket event for real-time update in admin
        const io = getIO();
        if (io) {
            io.emit("new-contact", newContact);
        }

        res.status(201).json({
            success: true,
            message: "Thank you for contacting us! We'll get back to you within 24 hours."
        });
    } catch (error) {
        console.error("Error submitting contact form:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit contact form. Please try again."
        });
    }
};
