import { ImageUploadUtils } from "../../helpers/cloudinary.js";
import Product from "../../models/Product.js";

// Image Upload
export const handleImageUpload = async (req, res) => {
    try {
        // Ensure that the file exists in the request
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // MOCK UPLOAD IMPLEMENTATION (Bypassing Cloudinary due to missing keys)
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const url = "data:" + req.file.mimetype + ";base64," + b64;
        
        const result = {
            url: url,
            public_id: "mock_id_" + Date.now()
        };

        // Log and return the result
        console.log("Mock Upload Result:", result);
        if (result) {
            return res.status(200).json({
                success: true,
                result,
                message: "Image uploaded successfully (Mock)."
            });
        } else {
            return res.status(400).json({ success: false, message: "Image upload failed." });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "An error occurred during image upload." });
    }
};

// Add a new product
export const addProduct = async(req,res)=>{
    try{
        const {image,title,description,category,brand,price,salePrice,totalStock, parts } = req.body;
        console.log("Request Body :",req.body)
        if(image==="" || title==="" || description==="" || category==="" || brand===""){
            
            return res.status(400).json({
                message : "All Fields Are Require",
                success : false
            })
        }
        // Validate numeric fields
        else if (
            isNaN(Number(price)) || Number(price) <= 0 ||
            isNaN(Number(salePrice)) || Number(salePrice) < 0 ||
            !Number.isInteger(Number(totalStock)) || Number(totalStock) <= 0
        ) {
            return res.status(400).json({
                message: "Invalid numbers: price must be > 0, salePrice must be >= 0 and totalStock must be an integer > 0.",
                success: false,
            });
        }
        else{
            // If parts is a JSON string (coming from a form), parse it
            let parsedParts = [];
            if (parts) {
                try {
                    parsedParts = typeof parts === 'string' ? JSON.parse(parts) : parts;
                } catch (e) {
                    console.log('Failed to parse parts from request', e);
                }
            }

            const newProduct = new Product({
                image, title, description, category, brand, price, salePrice, totalStock,
                parts: parsedParts
            });
            const data = await newProduct.save();
            return res.status(200).json({
                data : newProduct,
                success : true,
                message : "Product Added Successfully",
            })
        }
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message : "Some Error Occured",
            success : false,
        })
    }
}

// Fetch All Products
export const fetchAllProducts = async(req,res)=>{
    try{
        const listOffProducts = await Product.find({});
        return res.status(200).json({
            message : "All Products Details",
            success : true,
            data : listOffProducts
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
        message : "Some Error Occured",
        success : false})
    }
}

// Edit A Product
export const editProduct = async (req, res) => {
    try {
        const { id } = req.params; // Get the product ID from URL parameters
        const { image, title, description, category, brand, price, salePrice, totalStock, parts } = req.body;

        // Check if ID is provided
        if (!id) {
            return res.status(403).json({ 
                message: "Please provide the product ID.", 
                success: false 
            });
        }

        // Validate input fields
        if (!title || !description || !category || !brand || !price || !salePrice || !totalStock) {
            return res.status(400).json({
                message: "All fields are required.",
                success: false
            });
        }

        // Validate numeric fields on edit
        if (
            isNaN(Number(price)) || Number(price) <= 0 ||
            isNaN(Number(salePrice)) || Number(salePrice) < 0 ||
            !Number.isInteger(Number(totalStock)) || Number(totalStock) <= 0
        ) {
            return res.status(400).json({
                message: "Invalid numbers: price must be > 0, salePrice must be >= 0 and totalStock must be an integer > 0.",
                success: false,
            });
        }

        // Find the product by ID
        const findProduct = await Product.findById(id);

        if (!findProduct) {
            return res.status(404).json({
                message: "Product not found.",
                success: false,
            });
        }

        // Update the product fields
        findProduct.title = title || findProduct.title;
        findProduct.image = image || findProduct.image;
        findProduct.description = description || findProduct.description;
        findProduct.category = category || findProduct.category;
        findProduct.brand = brand || findProduct.brand;
        findProduct.price = Number(price) || findProduct.price;
        findProduct.salePrice = Number(salePrice) || findProduct.salePrice;
        findProduct.totalStock = Number(totalStock) || findProduct.totalStock;

        if (parts !== undefined) {
            // accept JSON string or array
            try {
                const parsed = typeof parts === 'string' ? JSON.parse(parts) : parts;
                if (Array.isArray(parsed)) findProduct.parts = parsed;
            } catch (e) {
                console.log('Could not parse parts during edit', e);
            }
        }

        // Save the updated product
        const updatedProduct = await findProduct.save();

        return res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            data: updatedProduct,
        });

    } catch (error) {
        console.log("Error updating product:", error);
        return res.status(500).json({
            message: "An error occurred while updating the product.",
            success: false,
        });
    }
};

// Delete Product
export const deleteProduct = async(req,res)=>{
    try{
        const {id} = req.params;
        if(!id){
            return res.status(403).json({message : "Please Pass the Id",success:false})
        }
        else{

            const product = await Product.findByIdAndDelete(id);
            if(!product) {
                return res.status(404).json({message : "Product not found",success:false})
            }
            else{
                return res.status(200).json({message : "Product successfully deleted",success:true})
            }   
        }
    }catch(error){
        console.log(error);
        return res.status(500).message({
            message : "Some Error Occured",
            success : false,
        })
    }
}