import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice/index.js";
import adminProductSlice from "./admin/product-slice/index.js";
import adminServiceSlice from "./admin/service-slice/index.js";
import adminUserSlice from "./admin/user-slice/index.js";
import adminContactSlice from "./admin/contact-slice/index.js";
import adminServiceInquirySlice from "./admin/service-inquiry-slice/index.js";
import ShoppingProductSlice from "./shop/products-slice/index.js";
import shoppingCartSlice from "./shop/cart-slice/index.js";
import shopAddressSlice from "./shop/address-slice/index.js";
import shopOrderSlice from "./shop/order-slice/index.js";
import shopReviewSlice from "./shop/review-slice/index.js";
import shopCategorySlice from "./shop/category-slice/index.js";
import shopSearchSlice from "./shop/search-slice/index.js";
import shopServiceSlice from "./shop/service-slice/index.js";

const store = configureStore({
    reducer : {
        auth : authReducer,
        adminProducts : adminProductSlice,
        adminServices : adminServiceSlice,
        adminUsers : adminUserSlice,
        adminContacts : adminContactSlice,
        adminServiceInquiries : adminServiceInquirySlice,
        shopProducts : ShoppingProductSlice,
        shopCart : shoppingCartSlice,
        shopAddress : shopAddressSlice,
        shopOrderSlice : shopOrderSlice,
        shopReviewSlice : shopReviewSlice,
        shopCategories : shopCategorySlice,
        shopSearch : shopSearchSlice,
        shopServices : shopServiceSlice
    }
})

export { store };
export default store;