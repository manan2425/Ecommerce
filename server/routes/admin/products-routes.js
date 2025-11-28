import express from "express";
import { addProduct, deleteProduct, editProduct, fetchAllProducts, handleImageUpload } from "../../controllers/admin/products-controller.js";
import { upload } from "../../helpers/cloudinary.js";

const router = express.Router();


// Upload Image
router.post("/upload-image",upload.single("my_file"),handleImageUpload);

// Add Product
router.post("/add",addProduct);

// Edit Product 
router.put("/edit/:id",editProduct);

// Fetch Prduct
router.get("/getProducts",fetchAllProducts);

// delete product
router.delete("/delete/:id",deleteProduct);

export default router;