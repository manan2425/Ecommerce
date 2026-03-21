import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Search products
export const searchProducts = createAsyncThunk(
    "shopSearch/searchProducts",
    async (searchQuery) => {
        const response = await axios.get(
            `${API_URL}/api/shop/products/search?q=${encodeURIComponent(searchQuery)}`
        );
        return response.data;
    }
);

// Get search suggestions
export const getSearchSuggestions = createAsyncThunk(
    "shopSearch/getSuggestions",
    async (query) => {
        const response = await axios.get(
            `${API_URL}/api/shop/products/suggestions?q=${encodeURIComponent(query)}`
        );
        return response.data;
    }
);

const searchSlice = createSlice({
    name: "shopSearch",
    initialState: {
        searchResults: [],
        suggestions: [],
        searchQuery: "",
        isLoading: false,
        exactMatch: true,
        message: "",
    },
    reducers: {
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        clearSearch: (state) => {
            state.searchResults = [];
            state.suggestions = [];
            state.searchQuery = "";
            state.message = "";
            state.exactMatch = true;
        },
        clearSuggestions: (state) => {
            state.suggestions = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchProducts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(searchProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.searchResults = action.payload?.data || [];
                state.exactMatch = action.payload?.exactMatch ?? true;
                state.message = action.payload?.message || "";
                // Store suggestions for "did you mean" feature
                if (action.payload?.suggestions?.length > 0) {
                    state.suggestions = action.payload.suggestions;
                }
            })
            .addCase(searchProducts.rejected, (state) => {
                state.isLoading = false;
                state.searchResults = [];
            })
            .addCase(getSearchSuggestions.fulfilled, (state, action) => {
                state.suggestions = action.payload?.suggestions || [];
            });
    },
});

export const { setSearchQuery, clearSearch, clearSuggestions } = searchSlice.actions;
export default searchSlice.reducer;
