import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Category model schema
const CategorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        unique: true,
        trim: true,
        minlength: 2
    },
    description: { 
        type: String, 
        trim: true 
    },
    icon: { 
        type: String, 
        default: "" 
    },
    image: { 
        type: String, 
        default: "" 
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Create slug from name before saving
CategorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '');
    }
    next();
});

const Category = mongoose.model("Category", CategorySchema);

// Industrial categories to add
const categories = [
    {
        name: "Industrial Sensors",
        description: "RTD, proximity switches, limit switches, Thermo couple, RPM sensor will be provided with technical guidance and installation service.",
        icon: "Gauge",
        isActive: true
    },
    {
        name: "PLC",
        description: "Any brand PLC will be available on demand and provided with proper software and development services.",
        icon: "Cpu",
        isActive: true
    },
    {
        name: "Cables",
        description: "Any brand cable will be available on demand and provided help to select cable according to application.",
        icon: "Cable",
        isActive: true
    },
    {
        name: "Connectors",
        description: "Any type connector will be available on demand and provided help to select connector according to application.",
        icon: "Plug",
        isActive: true
    },
    {
        name: "Power Supplies / SMPS",
        description: "Any brand & make power supply will be available on demand and provided help to select them according to application.",
        icon: "Zap",
        isActive: true
    },
    {
        name: "Panel Assembly Material",
        description: "Any material related to panel will be available on demand and provided help to select them according to application.",
        icon: "LayoutGrid",
        isActive: true
    }
];

const seedCategories = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/ecommerce');
        console.log('Connected to MongoDB');

        // Add each category
        for (const categoryData of categories) {
            try {
                // Check if category already exists
                const existing = await Category.findOne({ name: categoryData.name });
                if (existing) {
                    console.log(`Category "${categoryData.name}" already exists, updating...`);
                    await Category.updateOne({ name: categoryData.name }, categoryData);
                } else {
                    const category = new Category(categoryData);
                    await category.save();
                    console.log(`Created category: ${categoryData.name}`);
                }
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`Category "${categoryData.name}" already exists`);
                } else {
                    console.error(`Error creating category "${categoryData.name}":`, error.message);
                }
            }
        }

        console.log('\n✅ Categories seeded successfully!');
        console.log('Categories added:');
        categories.forEach((cat, i) => {
            console.log(`  ${i + 1}. ${cat.name}`);
        });

    } catch (error) {
        console.error('Error seeding categories:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

seedCategories();
