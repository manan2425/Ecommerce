import mongoose from 'mongoose';

// Define the part schema recursively to support nested subparts
// Parts can have full product-like details
const PartSchema = new mongoose.Schema({
    name: { type: String },
    nodeName: { type: String }, // unique identifier
    description: { type: String },
    // PDF description file for the part (optional)
    descriptionPdf: { type: String, default: "" },
    // Optional 2D hotspot coordinates (relative percent values 0-100)
    xPercent: { type: Number },
    yPercent: { type: Number },
    // Price is required, salePrice is optional
    price: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 }, // Optional sale price
    quantity: { type: Number, default: 0 },
    thumbnail: { type: String, default: "" },
    // Image for the part when clicked to drill down
    partImage: { type: String, default: "" },
    // Brand/category for the part (optional)
    brand: { type: String, default: "" },
    category: { type: String, default: "" },
    // Custom fields/attributes for the part (like product customFields)
    customFields: [{
        label: { type: String },
        value: { type: String }
    }],
    // Stock thresholds for this part
    redThreshold: { type: Number, default: 5 },
    yellowThreshold: { type: Number, default: 20 },
    // Nested subparts - can have their own subparts with same fields
    subparts: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    }
}, { _id: true });

// Product Option Schema (e.g., Color, Size, Material)
const ProductOptionSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Color", "Size", "Material"
    values: [{ type: String }] // e.g., ["Red", "Blue", "Green"] or ["S", "M", "L", "XL"]
}, { _id: true });

// Product Variant Schema - combination of options with specific price/stock
const ProductVariantSchema = new mongoose.Schema({
    // Combination of option values, e.g., { "Color": "Red", "Size": "M" }
    optionCombination: {
        type: Map,
        of: String
    },
    // Variant-specific fields
    price: { type: Number },
    salePrice: { type: Number },
    stock: { type: Number, default: 0 },
    sku: { type: String }, // Stock Keeping Unit - unique identifier for variant
    image: { type: String } // Variant-specific image (e.g., different color image)
}, { _id: true });

const ProductSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    // PDF description file uploaded by admin (optional)
    descriptionPdf: { type: String, default: "" },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    totalStock: { type: Number, required: true },
    // Product visibility control
    isActive: { type: Boolean, default: true },
    // Stock threshold configuration for color coding
    // Red threshold: stock <= redThreshold
    // Yellow threshold: stock <= yellowThreshold (but > redThreshold)
    // Green threshold: stock > yellowThreshold
    redThreshold: { type: Number, default: 5 },      // Red if stock <= 5
    yellowThreshold: { type: Number, default: 20 },  // Yellow if stock <= 20
    // Custom fields/attributes added by admin (dynamic key-value pairs)
    customFields: [{
        label: { type: String, required: true },
        value: { type: String, required: true }
    }],
    // Product Options (e.g., Color, Size) - defines what options are available
    options: [ProductOptionSchema],
    // Product Variants - specific combinations with their own price/stock
    variants: [ProductVariantSchema],
    // Product parts with nested subparts support
    parts: [PartSchema]
},{timestamps : true});

const Product = mongoose.model("Product",ProductSchema);
export default Product;
