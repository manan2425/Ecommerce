import mongoose from 'mongoose';

// Define the part schema recursively to support nested subparts
const PartSchema = new mongoose.Schema({
    name: { type: String },
    nodeName: { type: String }, // unique identifier
    description: { type: String },
    // Optional 2D hotspot coordinates (relative percent values 0-100)
    xPercent: { type: Number },
    yPercent: { type: Number },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    thumbnail: { type: String, default: "" },
    // Image for the part when clicked to drill down
    partImage: { type: String, default: "" },
    // Nested subparts - can have their own subparts
    subparts: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    }
}, { _id: true });

const ProductSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    totalStock: { type: Number, required: true },
    // Stock threshold configuration for color coding
    // Red threshold: stock <= redThreshold
    // Yellow threshold: stock <= yellowThreshold (but > redThreshold)
    // Green threshold: stock > yellowThreshold
    redThreshold: { type: Number, default: 5 },      // Red if stock <= 5
    yellowThreshold: { type: Number, default: 20 },  // Yellow if stock <= 20
    // Product parts with nested subparts support
    parts: [PartSchema]
},{timestamps : true});

const Product = mongoose.model("Product",ProductSchema);
export default Product;
