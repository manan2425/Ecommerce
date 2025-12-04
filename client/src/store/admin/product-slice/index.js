import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import api from "@/lib/api"
 

const initialState = {
    isLoading: false,
    products : []
}


// Add New Product
export const addProduct = createAsyncThunk("/products/addnewproduct",async(formData)=>{
    try{
        const response = await api.post(`/admin/products/add`,formData,
        {
            headers : {
                'Content-Type': 'application/json'
            }
        });
        console.log("Response: " + response.data);
        return response?.data;
    }catch(error){
        console.log(error);
        return error.response?.data;
    }
});

// Fetch all Product
export const fetchAllProducts = createAsyncThunk("/products/fetchAllProducts",async()=>{
    try{
        const response = await api.get(`/admin/products/getProducts`);
        console.log("Response : ",response.data);
        return response.data;
    }catch(error){
        console.log(error);
        return error.response?.data;
    }
})

// Edit product
export const editProduct = createAsyncThunk("/products/editProduct",async({id,formData})=>{
    try{
        const response = await api.put(`/admin/products/edit/${id}`,formData,
        {
            headers : {
                'Content-Type': 'application/json'
            }
        });
        return response?.data;
    }catch(error){
        console.log(error);
        return error.response?.data;
    }
})

// Delete Product
export const deleteProduct = createAsyncThunk("/products/deleteProduct",async({id})=>{
    try{
        const response = await api.delete(`/admin/products/delete/${id}` );
        return response?.data;
    }catch(error){
        console.log(error);
        return error.response?.data;
    }
})



const AdminProductSlice = createSlice({
    name : "adminProducts",
    initialState : initialState,
    reducers : {},
    extraReducers : (builder)=>{

        // Fetch Products
        builder.addCase(fetchAllProducts.pending,(state)=>{
            state.isLoading = true;
        }).addCase(fetchAllProducts.fulfilled,(state,action)=>{
            state.isLoading = false;
            const payload = action.payload || {};
            console.log("PayLoad : ",payload);
            state.products =  payload.data;
        }).addCase(fetchAllProducts.rejected,(state,action)=>{
            state.isLoading = false;
            state.products =  [];
        })

        // Add Product
        builder.addCase(addProduct.pending, (state) => {
            state.isLoading = true;
        }).addCase(addProduct.fulfilled, (state, action) => {
            state.isLoading = false;
            const payload = action.payload || {};
            if(payload?.success) {
                const newProduct = action.payload.data;
                state.products.push(newProduct);  
            }
        }).addCase(addProduct.rejected, (state) => {
            state.isLoading = false;
        });

        // Edit Product
        builder.addCase(editProduct.pending, (state) => {
            state.isLoading = true;
        }).addCase(editProduct.fulfilled, (state, action) => {
            state.isLoading = false;
            const updatedProduct = action.payload;
            state.products = state.products.map(product =>
                product.id === updatedProduct.id ? updatedProduct : product
            );
        }).addCase(editProduct.rejected, (state) => {
            state.isLoading = false;
        });


        // Delete Product
        builder.addCase(deleteProduct.pending, (state) => {
            state.isLoading = true;
        }).addCase(deleteProduct.fulfilled, (state, action) => {
            state.isLoading = false;
            const deletedProductId = action.payload.id;
            state.products = state.products.filter(product => product.id !== deletedProductId);
        }).addCase(deleteProduct.rejected, (state) => {
            state.isLoading = false;
        });

    }
})

export default AdminProductSlice.reducer;