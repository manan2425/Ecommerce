import {createSlice,createAsyncThunk} from "@reduxjs/toolkit";
import api from "@/lib/api";
const initialState = {
    isLoading : false,
    addressList : []
}

// Add New Address
export const addNewAddress = createAsyncThunk("/address/addNewAddress",async(formData)=>{
    try {
        const response = await api.post(`/shop/address/add`,formData);
        return response.data;
    }
    catch(error){
        console.log(error);
    }
});

// Fetch All Address
export const fetchAllAddress = createAsyncThunk("/address/fetchAllAddress",async(userId)=>{
    try {
        const response = await api.get(`/shop/address/get/${userId}`);
        return response.data;
    }
    catch(error){
        console.log(error);
    }
});

// Update Address
export const editAddress = createAsyncThunk("/address/editAddress",async({userId,addressId,formData})=>{
    try {
        const response = await api.put(`/shop/address/edit/${userId}/${addressId}`,formData);
        return response.data;
    }
    catch(error){
        console.log(error);
    }
});

// Delete Address
export const deleteAddress = createAsyncThunk("/address/deleteAddress",async({userId,addressId})=>{
    try {
        const response = await api.delete(`/shop/address/delete/${userId}/${addressId}`);
        return response.data;
    }
    catch(error){
        console.log(error);
    }
});



const addressSlice = createSlice({
    name : 'address',
    initialState,
    reducers : {

    },
    extraReducers : (builder)=>{
        builder
        .addCase(addNewAddress.pending,(state,action)=>{
            state.isLoading = true
        }).addCase(addNewAddress.fulfilled,(state,action)=>{
            state.isLoading = false
        }).addCase(addNewAddress.rejected,(state,action)=>{
            state.isLoading = false
 
        })
        .addCase(fetchAllAddress.pending,(state,action)=>{
            state.isLoading = true
        }).addCase(fetchAllAddress.fulfilled,(state,action)=>{
            state.isLoading = false
            state.addressList = action.payload.data
        }).addCase(fetchAllAddress.rejected,(state,action)=>{
            state.isLoading = false
            state.addressList = []
        })


    }
});


export default addressSlice.reducer;