import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

const initialState = {
    isLoading : false,
    cartItems : [],
}


// Add Item to cart
export const addToCart = createAsyncThunk("/cart/addToCart",
    async({userId,productId,quantity,selectedPart})=>{
    try{
        const response = await api.post(`/shop/cart/add`,{userId,productId,quantity,selectedPart});
        console.log("Add to Cart : ",response.data);
        return response.data;

    }catch(error){
        console.log(error)
    }
});

// Update cart
export const updateCartQuantity = createAsyncThunk("/cart/updateCart",
    async({userId,itemId,quantity})=>{
    try{
        const response = await api.put(`/shop/cart/update-cart`,{userId,itemId,quantity});
        console.log("Update Cart : ",response.data);
        return response.data;

    }catch(error){
        console.log(error)
    }
});


// Delete From Cart
export const deleteCartItem = createAsyncThunk("/cart/deleteCartItem",
    async({userId,itemId})=>{
    try{
        const response = await api.delete(`/shop/cart/delete-cart/${userId}/${itemId}`);
        console.log("Delete From Cart : ",response.data);
        return response.data;

    }catch(error){
        console.log(error)
    }
});


// Fetch Cart Items 
export const fetchCartItems = createAsyncThunk("/cart/fetchCartItems",
    async(userId)=>{
    try{
        const response = await api.get(`/shop/cart/get/${userId}`);
        console.log("Fetch Cart : ",response.data);
        return response.data;

    }catch(error){
        console.log(error)
    }
});


const shoppingCartSlice = createSlice({
    name : "shoppingCart",
    initialState : initialState,
    reducers : {
        clearCart: (state) => {
            state.cartItems = null;
        },
    },
    extraReducers : (builder)=>{

        builder.addCase(addToCart.pending,(state,action)=>{
            state.isLoading = true;
        })
        .addCase(addToCart.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.cartItems = action?.payload?.data || [];
        })
        .addCase(addToCart.rejected,(state,action)=>{
            state.isLoading = false;
            state.cartItems = [];
        })
        .addCase(fetchCartItems.pending,(state,action)=>{
            state.isLoading = true;
        })
        .addCase(fetchCartItems.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.cartItems = action?.payload?.data || [];
        })
        .addCase(fetchCartItems.rejected,(state,action)=>{
            state.isLoading = false;
            state.cartItems = [];
        })
        .addCase(updateCartQuantity.pending,(state,action)=>{
            state.isLoading = true;
        })
        .addCase(updateCartQuantity.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.cartItems = action?.payload?.data || [];
        })
        .addCase(updateCartQuantity.rejected,(state,action)=>{
            state.isLoading = false;
            state.cartItems = [];
        })
        .addCase(deleteCartItem.pending,(state,action)=>{
            state.isLoading = true;
        })
        .addCase(deleteCartItem.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.cartItems = action?.payload?.data || [];
        })
        .addCase(deleteCartItem.rejected,(state,action)=>{
            state.isLoading = false;
            state.cartItems = [];
        })   
    }
});


export const { clearCart } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;