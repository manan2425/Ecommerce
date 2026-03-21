import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUrl = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/ecommerce1";

// Define Service schema inline
const ServiceSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    priceType: { type: String, enum: ['fixed', 'hourly', 'daily', 'project'], default: 'fixed' },
    estimatedDuration: { type: String, default: '' },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    specifications: [{ label: { type: String }, value: { type: String } }]
}, { timestamps: true });

const Service = mongoose.model('Service', ServiceSchema);

async function checkAndFixServices() {
    try {
        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB');

        const services = await Service.find({});
        console.log(`\nTotal services: ${services.length}`);
        
        for (const s of services) {
            console.log(`- ${s.title} | isActive: ${s.isActive}`);
        }

        // Update all services to be active
        const result = await Service.updateMany({}, { isActive: true });
        console.log(`\nUpdated ${result.modifiedCount} services to isActive: true`);

        // Verify
        const activeServices = await Service.find({ isActive: true });
        console.log(`Active services now: ${activeServices.length}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAndFixServices();
