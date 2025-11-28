import express from "express";
import { addToCart,fetchCartItems,updateCartItemQty,deleteCartItem } from "../../controllers/shop/cart-controller.js";

const router = express.Router();

router.post('/add',addToCart);
router.get("/get/:userId",fetchCartItems);
router.put("/update-cart",updateCartItemQty);
router.delete("/delete-cart/:userId/:itemId",deleteCartItem);

export default router;