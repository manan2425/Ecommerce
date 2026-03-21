import mongoose from "mongoose";

const ServiceInquirySchema = new mongoose.Schema({
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
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },
    serviceTitle: {
        type: String,
        required: true
    },
    serviceCategory: {
        type: String,
        default: ""
    },
    message: {
        type: String,
        required: true
    },
    budget: {
        type: String,
        default: ""
    },
    timeline: {
        type: String,
        default: ""
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

const ServiceInquiry = mongoose.model("ServiceInquiry", ServiceInquirySchema);
export default ServiceInquiry;
