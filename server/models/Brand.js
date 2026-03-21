import mongoose from 'mongoose';

const BrandSchema = new mongoose.Schema({
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
    logo: { 
        type: String, 
        default: "" 
    },
    website: {
        type: String,
        trim: true,
        default: ""
    },
    country: {
        type: String,
        trim: true,
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
BrandSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '');
    }
    next();
});

const Brand = mongoose.model("Brand", BrandSchema);
export default Brand;
