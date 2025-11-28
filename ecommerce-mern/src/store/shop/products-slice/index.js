import api from "@/lib/api";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"


const initialState = {
    isLoading: false,
    productList : [],
    productDetails : null
}

export const fetchAllFilteredProducts = createAsyncThunk("/products/fetchAllProducts",
    async({filterParams,sortParams})=>{
        try{

            const query = new URLSearchParams({...filterParams,sortBy : sortParams});
            
            console.log("Send String : ",query);

            const response = await api.get(`/api/shop/products/get?${query}`);
            // console.log("Reponse FOr Products : ",response.data);
            return response.data;
        }catch(error){
            console.log(error);
        }
    }
)


export const fetchProductDetails = createAsyncThunk("/products/fetchProductDetails",
    async(id)=>{
        try{
           
            const response = await api.get(`/api/shop/products/get/${id}`);
            // console.log("Reponse FOr Products : ",response.data);
            return response.data;
        }catch(error){
            console.log(error);
        }
    }
)


const ShoppingProductSlice = createSlice({
    name : 'shoppingproducts',
    initialState,
    reducers : {
        resetProductDetails: (state) => {
            state.productDetails = null;
        }
    },
    extraReducers : (builder)=>{

        builder.addCase(fetchAllFilteredProducts.pending,(state,action)=>{
            state.isLoading = true;
        }).addCase(fetchAllFilteredProducts.fulfilled,(state,action)=>{
            // console.log("Get The Products : ",action.payload);
            state.isLoading = false;
            state.productList = action?.payload?.data || [];
        }).addCase(fetchAllFilteredProducts.rejected,(state,action)=>{
            state.isLoading = false;
            state.productList = [];
        })
        .addCase(fetchProductDetails.pending,(state,action)=>{
            state.isLoading = true;
        })
        .addCase(fetchProductDetails.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.productDetails = action?.payload?.data || null;
        }).addCase(fetchProductDetails.rejected,(state,action)=>{
            state.isLoading = true;
            state.productDetails = null;
        })
    }
})

export default ShoppingProductSlice.reducer;
export const { resetProductDetails } = ShoppingProductSlice.actions;