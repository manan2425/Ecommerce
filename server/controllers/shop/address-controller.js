import Address from "../../models/Address.js";


export const addAddress = async(req, res) => {
    try{
        
        const {userId,address,city,pincode,phone,notes} = req.body;

        if(!userId || !address || !city || !pincode || !phone || !notes){
            return res.status(400).json({
                success : false,
                message : 'Please Provide Necessary Data'
            })
        }

        const newlyCreatedAddress = new Address({
            userId,address,city,pincode,phone,notes
        });

        // Save The Data
        const response = await newlyCreatedAddress.save();

        return res.status(201).json({
            message : 'Address Added Successfully',
            success : true
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Some Error Occured",
            success: false,
        })
    }
}


export const fetchAllAddress = async(req, res) => {
    try{

        const {userId}  = req.params;
        if(!userId){
            return res.status(400).json({
                message : "Please Provide Necessary Data",
                success : false,
            })
        }

        const addressData = await Address.find({userId});
        res.status(200).json({
            success: true,
            data : addressData,
            message : "Address Found Successfully"
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Some Error Occured",
            success: false,
        })
    }
}


export const deleteAddress = async(req, res) => {
    try{
        const {userId,addressId} = req.params;
        if(!userId || !addressId){
            return res.status(400).json({
                success: false,
                message : 'Please Provide Necessary Data'
            })
        }
        const address = await Address.findOneAndDelete({_id : addressId,userId});
        if(!address){
            return res.status(404).json({
                message : 'Address Not Found',
                success: false,
            })
        }
        else{
            return res.status(200).json({
                message : 'Address Deleted Successfully',
                success : true,
            })
        }
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Some Error Occured",
            success: false,
        })
    }
}


export const editAddress = async(req, res) => {
    try{
        const {userId,addressId} = req.params;
        const formData = req.body;

        if(!userId || !addressId){
            return res.status(400).json({
                success: false,
                message : 'Please Provide Necessary Data'
            })
        }
        const address = await Address.findOneAndUpdate({_id : addressId,
        userId : userId},formData,{new:true});

        if(!address){
            return res.status(404).json({
                message : 'Address Not Found',
                success: false,
            })
        }
        else{
            return res.status(200).json({
                message : 'Address Updated Successfully',
                success : true,
            })
        }
    
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Some Error Occured",
            success: false,
        })
    }
}