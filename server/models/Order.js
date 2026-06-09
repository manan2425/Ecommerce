import mongoose from 'mongoose';

const OrderSchema  = new mongoose.Schema({
    userId : String,
    cartItems : [
        {
            productId : String,
            title : String,
            image : String,
            selectedPart: {
                name: String,
                nodeName: String,
                description: String,
                descriptionPdf: String,
                price: Number,
                salePrice: Number,
                xPercent: Number,
                yPercent: Number,
                thumbnail: String,
                partImage: String,
                brand: String,
                category: String,
                customFields: [{
                    label: String,
                    value: String
                }],
                partPath: [Number],
                parentName: String,
                isSubpart: Boolean,
                depth: Number
            },
            // Selected variant info (e.g., Color: Red, Size: M)
            selectedVariant: {
                optionCombination: mongoose.Schema.Types.Mixed,
                price: Number,
                salePrice: Number,
                sku: String
            },
            // Selected options for display (e.g., { "Color": "Red", "Size": "M" })
            selectedOptions: mongoose.Schema.Types.Mixed,
            price : String,
            salePrice : String,
            quantity : Number
        }
    ],
    addressInfo : {
        addressId : String,
        address : String,
        city : String,
        pincode : String,
        phone : String,
        notes : String,
        gstNumber : String,
        wantsGstBill : Boolean,
    },
    orderStatus : { type: String, index: true },
    paymentMethod : String,
    paymentStatus : String,
    subtotal : Number,
    gstAmount : Number,
    totalAmount : Number,
    orderDate : { type: Date, index: true },
    orderUpdateDate : Date,
    paymentId : String,
    payerId : String,
    ewayBillNumber: String,
    ewayBillGeneratedAt: Date,
    ewayBillDetails: mongoose.Schema.Types.Mixed,
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;