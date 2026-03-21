import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../lib/api";

const initialState = {
    isLoading: false,
    serviceList: [],
    serviceDetails: null,
    error: null
};

// Fetch all services for admin
export const fetchAllServicesAdmin = createAsyncThunk(
    "adminServices/fetchAll",
    async () => {
        const response = await api.get("/admin/services/get");
        return response.data;
    }
);

// Add new service
export const addService = createAsyncThunk(
    "adminServices/add",
    async (serviceData) => {
        const response = await api.post("/admin/services/add", serviceData);
        return response.data;
    }
);

// Edit service
export const editService = createAsyncThunk(
    "adminServices/edit",
    async ({ id, serviceData }) => {
        const response = await api.put(`/admin/services/edit/${id}`, serviceData);
        return response.data;
    }
);

// Delete service
export const deleteService = createAsyncThunk(
    "adminServices/delete",
    async (id) => {
        const response = await api.delete(`/admin/services/delete/${id}`);
        return { ...response.data, deletedId: id };
    }
);

// Toggle service status
export const toggleServiceStatus = createAsyncThunk(
    "adminServices/toggle",
    async (id) => {
        const response = await api.put(`/admin/services/toggle/${id}`);
        return response.data;
    }
);

const adminServiceSlice = createSlice({
    name: "adminServices",
    initialState,
    reducers: {
        clearServiceDetails: (state) => {
            state.serviceDetails = null;
        },
        // Real-time updates
        serviceCreated: (state, action) => {
            state.serviceList.push(action.payload);
        },
        serviceUpdated: (state, action) => {
            const index = state.serviceList.findIndex(s => s._id === action.payload._id);
            if (index !== -1) {
                state.serviceList[index] = action.payload;
            }
        },
        serviceDeleted: (state, action) => {
            state.serviceList = state.serviceList.filter(s => s._id !== action.payload._id);
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all
            .addCase(fetchAllServicesAdmin.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAllServicesAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.serviceList = action.payload.data || [];
            })
            .addCase(fetchAllServicesAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Add
            .addCase(addService.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addService.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.success) {
                    state.serviceList.push(action.payload.data);
                }
            })
            .addCase(addService.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Edit
            .addCase(editService.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(editService.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.success) {
                    const index = state.serviceList.findIndex(s => s._id === action.payload.data._id);
                    if (index !== -1) {
                        state.serviceList[index] = action.payload.data;
                    }
                }
            })
            .addCase(editService.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Delete
            .addCase(deleteService.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteService.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.success) {
                    state.serviceList = state.serviceList.filter(s => s._id !== action.payload.deletedId);
                }
            })
            .addCase(deleteService.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Toggle
            .addCase(toggleServiceStatus.fulfilled, (state, action) => {
                if (action.payload.success) {
                    const index = state.serviceList.findIndex(s => s._id === action.payload.data._id);
                    if (index !== -1) {
                        state.serviceList[index] = action.payload.data;
                    }
                }
            });
    }
});

export const { clearServiceDetails, serviceCreated, serviceUpdated, serviceDeleted } = adminServiceSlice.actions;
export default adminServiceSlice.reducer;
