import express from "express";
import { addAddress,fetchAllAddress,deleteAddress,editAddress } from "../../controllers/shop/address-controller.js";

const router = express.Router();

router.post("/add",addAddress);
router.get("/get/:userId",fetchAllAddress);
router.put("/edit/:userId/:addressId",editAddress);
router.delete("/delete/:userId/:addressId",deleteAddress);

export default router;