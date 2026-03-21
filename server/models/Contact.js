import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        default: ""
    },
    company: {
        type: String,
        default: ""
    },
    subject: {
        type: String,
        default: "General Inquiry"
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["new", "read", "replied", "closed"],
        default: "new"
    },
    adminNotes: {
        type: String,
        default: ""
    },
    repliedAt: {
        type: Date,
        default: null
    },
    repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
}, { timestamps: true });

const Contact = mongoose.model("Contact", ContactSchema);
export default Contact;
