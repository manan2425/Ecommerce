import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Fetch all service inquiries
export const fetchAllServiceInquiries = createAsyncThunk(
    "adminServiceInquiries/fetchAll",
    async ({ page = 1, limit = 10, status = "all", search = "", sortBy = "createdAt", sortOrder = "desc" }, { rejectWithValue }) => {
        try {
            const response = await api.get(
                "/admin/service-inquiries",
                {
                    params: { page, limit, status, search, sortBy, sortOrder }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch service inquiries");
        }
    }
);

// Fetch single service inquiry
export const fetchServiceInquiryById = createAsyncThunk(
    "adminServiceInquiries/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(
                `/admin/service-inquiries/${id}`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch service inquiry");
        }
    }
);

// Update service inquiry status
export const updateServiceInquiryStatus = createAsyncThunk(
    "adminServiceInquiries/updateStatus",
    async ({ id, status, adminNotes }, { rejectWithValue }) => {
        try {
            const response = await api.put(
                `/admin/service-inquiries/${id}`,
                { status, adminNotes }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update service inquiry");
        }
    }
);

// Delete service inquiry
export const deleteServiceInquiry = createAsyncThunk(
    "adminServiceInquiries/delete",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(
                `/admin/service-inquiries/${id}`
            );
            return { ...response.data, id };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete service inquiry");
        }
    }
);

// Bulk delete service inquiries
export const bulkDeleteServiceInquiries = createAsyncThunk(
    "adminServiceInquiries/bulkDelete",
    async (ids, { rejectWithValue }) => {
        try {
            const response = await api.post(
                "/admin/service-inquiries/bulk-delete",
                { ids }
            );
            return { ...response.data, ids };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete service inquiries");
        }
    }
);

const serviceInquirySlice = createSlice({
    name: "adminServiceInquiries",
    initialState: {
        inquiries: [],
        currentInquiry: null,
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalInquiries: 0,
            hasMore: false
        },
        stats: {
            total: 0,
            new: 0,
            read: 0,
            replied: 0,
            closed: 0
        },
        isLoading: false,
        error: null
    },
    reducers: {
        clearCurrentInquiry: (state) => {
            state.currentInquiry = null;
        },
        // Real-time updates from socket
        addNewInquiry: (state, action) => {
            const exists = state.inquiries.some(i => i._id === action.payload._id);
            if (!exists) {
                state.inquiries.unshift(action.payload);
                state.stats.total += 1;
                state.stats.new += 1;
            }
        },
        updateInquiryInList: (state, action) => {
            const index = state.inquiries.findIndex(i => i._id === action.payload._id);
            if (index !== -1) {
                const oldStatus = state.inquiries[index].status;
                const newStatus = action.payload.status;
                
                // Update stats
                if (oldStatus !== newStatus) {
                    state.stats[oldStatus] = Math.max(0, state.stats[oldStatus] - 1);
                    state.stats[newStatus] += 1;
                }
                
                state.inquiries[index] = action.payload;
            }
            if (state.currentInquiry?._id === action.payload._id) {
                state.currentInquiry = action.payload;
            }
        },
        removeInquiryFromList: (state, action) => {
            const inquiry = state.inquiries.find(i => i._id === action.payload);
            if (inquiry) {
                state.stats[inquiry.status] = Math.max(0, state.stats[inquiry.status] - 1);
                state.stats.total = Math.max(0, state.stats.total - 1);
            }
            state.inquiries = state.inquiries.filter(i => i._id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all
            .addCase(fetchAllServiceInquiries.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllServiceInquiries.fulfilled, (state, action) => {
                state.isLoading = false;
                state.inquiries = action.payload.data || [];
                state.pagination = action.payload.pagination || state.pagination;
                state.stats = action.payload.stats || state.stats;
            })
            .addCase(fetchAllServiceInquiries.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch by ID
            .addCase(fetchServiceInquiryById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchServiceInquiryById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentInquiry = action.payload.data;
            })
            .addCase(fetchServiceInquiryById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update status
            .addCase(updateServiceInquiryStatus.fulfilled, (state, action) => {
                const updatedInquiry = action.payload.data;
                const index = state.inquiries.findIndex(i => i._id === updatedInquiry._id);
                if (index !== -1) {
                    const oldStatus = state.inquiries[index].status;
                    const newStatus = updatedInquiry.status;
                    
                    if (oldStatus !== newStatus) {
                        state.stats[oldStatus] = Math.max(0, state.stats[oldStatus] - 1);
                        state.stats[newStatus] += 1;
                    }
                    
                    state.inquiries[index] = updatedInquiry;
                }
                if (state.currentInquiry?._id === updatedInquiry._id) {
                    state.currentInquiry = updatedInquiry;
                }
            })
            // Delete
            .addCase(deleteServiceInquiry.fulfilled, (state, action) => {
                const id = action.payload.id;
                const inquiry = state.inquiries.find(i => i._id === id);
                if (inquiry) {
                    state.stats[inquiry.status] = Math.max(0, state.stats[inquiry.status] - 1);
                    state.stats.total = Math.max(0, state.stats.total - 1);
                }
                state.inquiries = state.inquiries.filter(i => i._id !== id);
            })
            // Bulk delete
            .addCase(bulkDeleteServiceInquiries.fulfilled, (state, action) => {
                const ids = action.payload.ids;
                ids.forEach(id => {
                    const inquiry = state.inquiries.find(i => i._id === id);
                    if (inquiry) {
                        state.stats[inquiry.status] = Math.max(0, state.stats[inquiry.status] - 1);
                        state.stats.total = Math.max(0, state.stats.total - 1);
                    }
                });
                state.inquiries = state.inquiries.filter(i => !ids.includes(i._id));
            });
    }
});

export const { 
    clearCurrentInquiry, 
    addNewInquiry, 
    updateInquiryInList, 
    removeInquiryFromList 
} = serviceInquirySlice.actions;

export default serviceInquirySlice.reducer;
