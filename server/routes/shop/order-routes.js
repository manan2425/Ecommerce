import express from "express";
import { createOrder, getAllOrderByUser, getAllOrders, getOrderDetails, updateOrderStatus, cancelOrder, generateEwayBill } from "../../controllers/shop/order-controller.js";

const router = express.Router();

router.post("/create",createOrder);
router.put("/updateOrder/:id",updateOrderStatus)
router.get("/list/:userId",getAllOrderByUser);
router.get("/details/:id",getOrderDetails);
router.get("/orders",getAllOrders);

router.post("/generate-eway-bill/:id", generateEwayBill);

router.put("/cancel/:id",cancelOrder);

export default router;