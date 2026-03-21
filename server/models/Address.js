import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
    userId : String,
    address : String,
    city : String,
    pincode : String,
    phone : String,
    notes : String,
    // GST number for GST billing (optional)
    gstNumber : { type: String, default: "" },
    // Whether user wants GST bill
    wantsGstBill : { type: Boolean, default: false },
},{timestamps : true});

const Address =  mongoose.model("Address",AddressSchema);
export default Address;