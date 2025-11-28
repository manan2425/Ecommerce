import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    totalStock: { type: Number, required: true },
    // Product parts for 3D interactive selection. Each part can be linked to a nodeName in the model file
    parts: [
        {
            name: { type: String },
            nodeName: { type: String }, // unique identifier in the 3D file's scene graph
            description: { type: String },
            // Optional 2D hotspot coordinates (relative percent values 0-100)
            xPercent: { type: Number },
            yPercent: { type: Number },
            price: { type: Number, default: 0 },
            quantity: { type: Number, default: 0 },
            thumbnail: { type: String, default: "" }
        }
    ]
},{timestamps : true});

const Product = mongoose.model("Product",ProductSchema);
export default Product;
