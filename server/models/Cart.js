import mongoose from 'mongoose';

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
                ref : "Product",
                required : true
            },
            quantity : {
                type : Number,
                required : true,
                min : 1
            }
            ,
            selectedPart: {
                name: { type: String },
                nodeName: { type: String },
                description: { type: String },
                price: { type: Number },
                thumbnail: { type: String }
            ,
            // coordinates on the 2D product image (percent values)
            xPercent: { type: Number },
            yPercent: { type: Number }
            }
        }
    ],  
},{timestamp : true});

const Cart = mongoose.model("Cart",CartSchema);
export default Cart;