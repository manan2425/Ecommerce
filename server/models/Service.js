import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Technical Drawings',
            'Mechatronics System Design',
            'CNC Machine Kaizen',
            'Panel Designing',
            'Concept Preparation',
            'Technical Presentation',
            'Project Management'
        ]
    },
    image: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    // For hourly/daily/project based pricing
    priceType: {
        type: String,
        enum: ['fixed', 'hourly', 'daily', 'project'],
        default: 'fixed'
    },
    // Estimated duration (in hours/days depending on priceType)
    estimatedDuration: {
        type: String,
        default: ''
    },
    // Features/Deliverables included in the service
    features: [{
        type: String
    }],
    // Is service currently available
    isActive: {
        type: Boolean,
        default: true
    },
    // For sorting/display order
    displayOrder: {
        type: Number,
        default: 0
    },
    // Custom fields for additional specifications
    specifications: [{
        label: { type: String },
        value: { type: String }
    }]
}, { timestamps: true });

const Service = mongoose.model('Service', ServiceSchema);
export default Service;
