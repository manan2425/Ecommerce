import express from "express";
import {getFilteredProducts,getProductDetails, searchProducts, getSearchSuggestions} from "../../controllers/shop/product-controller.js";


const router = express.Router();

router.get("/get",getFilteredProducts);
router.get("/get/:id",getProductDetails);
router.get("/search", searchProducts);
router.get("/suggestions", getSearchSuggestions);

export default router;