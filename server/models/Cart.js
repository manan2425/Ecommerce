import mongoose from 'mongoose';

// Schema for selected part (supports nested subparts with full product-like details)
// Using Mixed type to be flexible with the part data structure
const SelectedPartSchema = new mongoose.Schema({
    name: { type: String },
    nodeName: { type: String },
    description: { type: String },
    descriptionPdf: { type: String },
    price: { type: Number },
    salePrice: { type: Number },
    quantity: { type: Number },
    thumbnail: { type: String },
    partImage: { type: String },
    brand: { type: String },
    category: { type: String },
    // Custom fields for the part
    customFields: { type: mongoose.Schema.Types.Mixed },
    // coordinates on the 2D product image (percent values)
    xPercent: { type: Number },
    yPercent: { type: Number },
    // Path to this part (for nested subparts) - array of indices
    partPath: [{ type: Number }],
    // Parent part info (for display purposes)
    parentName: { type: String },
    // Is this a subpart or root part
    isSubpart: { type: Boolean, default: false },
    // Depth level (0 = main part, 1 = subpart, 2 = subpart of subpart, etc.)
    depth: { type: Number, default: 0 },
    // Stock thresholds (optional)
    redThreshold: { type: Number },
    yellowThreshold: { type: Number }
}, { _id: false, strict: false });

const CartSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true 
    },
    items : [
        {
            productId : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "Product"
            },
            serviceId : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "Service"
            },
            // Flag to identify if this is a service or product
            isService: {
                type: Boolean,
                default: false
            },
            quantity : {
                type : Number,
                required : true,
                min : 1
            },
            // Selected part (can be main part or nested subpart)
            selectedPart: SelectedPartSchema,
            // Selected variant info (e.g., Color: Red, Size: M)
            selectedVariant: {
                optionCombination: {
                    type: Map,
                    of: String
                },
                price: { type: Number },
                salePrice: { type: Number },
                sku: { type: String }
            },
            // Selected options for display (e.g., { "Color": "Red", "Size": "M" })
            selectedOptions: {
                type: Map,
                of: String
            }
        }
    ],  
},{timestamp : true});

const Cart = mongoose.model("Cart",CartSchema);
export default Cart;