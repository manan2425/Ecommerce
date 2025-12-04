import mongoose from 'mongoose';

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
export default Category;
