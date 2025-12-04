import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { Axis3D } from "lucide-react";
 
const initialState = {
    approvalURL : "",
    isLoading : false,
    orderId : null,
    orderList : [],
    orderDetails : null,
    allOrders : []
}

export const createNewOrder = createAsyncThunk("/order/createNewOrder",async(orderData)=>{
    try{
        const response = await api.post(`/shop/order/create`,orderData);
        return response.data;

    }catch(error){
        console.log(error)
    }
})

export const getAllOrderByUserId = createAsyncThunk("/order/getAllOrders",async(userId)=>{
    try{
        const response = await api.get(`/shop/order/list/${userId}`);
        return response.data

    }catch(error){
        console.log(error)
    }
})

export const getOrderDetails = createAsyncThunk("/order/getOrderDetails",async(id)=>{
    try{
        const response = await api.get(`/shop/order/details/${id}`);
        return response.data

    }catch(error){
        console.log(error);
    }
})

export const getAllOrders = createAsyncThunk("/order/orderData",async()=>{
    try{
        
        const response = await api.get(`/shop/order/orders`);
        return response.data

    }catch(error){
        console.log(error);
    
    }

})

export const updateOrderStatus = createAsyncThunk("/order/updateOrder",async({id,orderStatus})=>{
    try{
 
        const response = await api.put(`/shop/order/updateOrder/${id}`,{
            orderStatus
        });

    }catch(error){
        console.log(error)
    }
    
})

export const cancelOrder = createAsyncThunk("/order/cancelOrder",async(id)=>{
    try{
        const response = await api.put(`/shop/order/cancel/${id}`);
        return response.data;
    }catch(error){
        console.log(error);
    }
})


const shoppingOrderSlice = createSlice({
    name : 'shoppingOrderSlice',
    initialState,
    reducers : {
        resetOrderDetails : (state)=>{
            state.orderDetails = null; 
        }
    
    },
    extraReducers : (builder)=>{
        builder
        .addCase(createNewOrder.pending,(state)=>{
            state.isLoading = true;
        })
        .addCase(createNewOrder.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.orderId = action.payload.orderId;
        })
        .addCase(createNewOrder.rejected,(state)=>{
            state.isLoading = false;
            state.orderId = null
        })
        .addCase(getAllOrderByUserId.pending,(state)=>{
            state.isLoading = true;
        })
        .addCase(getAllOrderByUserId.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.orderList = action?.payload?.data || [];
        })
        .addCase(getAllOrderByUserId.rejected,(state)=>{
            state.isLoading = false;
            state.orderList = [];
        })
        .addCase(getOrderDetails.pending,(state)=>{
            state.isLoading = true;
        })
        .addCase(getOrderDetails.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.orderDetails = action?.payload?.data || null;
        })
        .addCase(getOrderDetails.rejected,(state)=>{
            state.isLoading = false;
            state.orderDetails = null;
        })
        .addCase(getAllOrders.pending,(state)=>{
            state.isLoading = true;
        })
        .addCase(getAllOrders.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.allOrders = action?.payload?.data || [];
        })
        .addCase(getAllOrders.rejected,(state)=>{
            state.isLoading = false;
            state.allOrders =  [];
        })
    }
})

export const {resetOrderDetails} = shoppingOrderSlice.actions
export default shoppingOrderSlice.reducer