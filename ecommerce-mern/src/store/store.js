import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice/index.js";
import adminProductSlice from "./admin/product-slice/index.js";
import ShoppingProductSlice from "./shop/products-slice/index.js";
import shoppingCartSlice from "./shop/cart-slice/index.js";
import shopAddressSlice from "./shop/address-slice/index.js";
import shopOrderSlice from "./shop/order-slice/index.js";
import shopReviewSlice from "./shop/review-slice/index.js";

const store = configureStore({
    reducer : {
        auth : authReducer,
        adminProducts : adminProductSlice,
        shopProducts : ShoppingProductSlice,
        shopCart : shoppingCartSlice,
        shopAddress : shopAddressSlice,
        shopOrderSlice : shopOrderSlice,
        shopReviewSlice : shopReviewSlice
    }
})

export default store;