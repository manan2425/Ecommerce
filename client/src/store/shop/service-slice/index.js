import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

const initialState = {
    isLoading: false,
    serviceList: [],
    serviceDetails: null,
    error: null
};

// Fetch active services for shop
export const fetchActiveServices = createAsyncThunk(
    "shopServices/fetchActive",
    async (category = 'all') => {
        try {
            const query = category && category !== 'all' ? `?category=${category}` : '';
            const response = await api.get(`/shop/services/get${query}`);
            console.log("Services Response:", response.data);
            return response.data;
        } catch (error) {
            console.log("Services Error:", error);
            throw error;
        }
    }
);

// Fetch single service details
export const fetchServiceDetails = createAsyncThunk(
    "shopServices/fetchDetails",
    async (id) => {
        try {
            const response = await api.get(`/shop/services/get/${id}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
);

const shopServiceSlice = createSlice({
    name: "shopServices",
    initialState,
    reducers: {
        clearServiceDetails: (state) => {
            state.serviceDetails = null;
        },
        // Real-time updates
        serviceUpdated: (state, action) => {
            const index = state.serviceList.findIndex(s => s._id === action.payload._id);
            if (index !== -1) {
                state.serviceList[index] = action.payload;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch active services
            .addCase(fetchActiveServices.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchActiveServices.fulfilled, (state, action) => {
                state.isLoading = false;
                state.serviceList = action.payload.data || [];
            })
            .addCase(fetchActiveServices.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Fetch service details
            .addCase(fetchServiceDetails.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchServiceDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.serviceDetails = action.payload.data;
            })
            .addCase(fetchServiceDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            });
    }
});

export const { clearServiceDetails, serviceUpdated } = shopServiceSlice.actions;
export default shopServiceSlice.reducer;
