import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

const initialState = {
    isLoading: false,
    categories: [],
    error: null
};

// Fetch all active categories for shop
export const fetchShopCategories = createAsyncThunk(
    "shopCategories/fetchAll",
    async () => {
        const response = await api.get('/shop/categories/get');
        return response.data;
    }
);

const shopCategorySlice = createSlice({
    name: "shopCategories",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchShopCategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchShopCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.categories = action.payload?.data || [];
            })
            .addCase(fetchShopCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
                state.categories = [];
            });
    }
});

export default shopCategorySlice.reducer;
