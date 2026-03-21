import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

const initialState = {
    isLoading: false,
    userList: [],
    userDetails: null,
    userStats: null,
    error: null
};

// Fetch all users
export const fetchAllUsers = createAsyncThunk(
    "adminUsers/fetchAll",
    async ({ role, isActive, search } = {}) => {
        let query = [];
        if (role && role !== 'all') query.push(`role=${role}`);
        if (isActive !== undefined && isActive !== 'all') query.push(`isActive=${isActive}`);
        if (search) query.push(`search=${search}`);
        
        const queryString = query.length > 0 ? `?${query.join('&')}` : '';
        const response = await api.get(`/admin/users/get${queryString}`);
        return response.data;
    }
);

// Fetch user by ID
export const fetchUserById = createAsyncThunk(
    "adminUsers/fetchById",
    async (id) => {
        const response = await api.get(`/admin/users/get/${id}`);
        return response.data;
    }
);

// Update user
export const updateUser = createAsyncThunk(
    "adminUsers/update",
    async ({ id, userData }) => {
        const response = await api.put(`/admin/users/update/${id}`, userData);
        return response.data;
    }
);

// Toggle user status
export const toggleUserStatus = createAsyncThunk(
    "adminUsers/toggleStatus",
    async (id) => {
        const response = await api.patch(`/admin/users/toggle-status/${id}`);
        return response.data;
    }
);

// Delete user
export const deleteUser = createAsyncThunk(
    "adminUsers/delete",
    async (id) => {
        const response = await api.delete(`/admin/users/delete/${id}`);
        return { ...response.data, id };
    }
);

// Fetch user statistics
export const fetchUserStats = createAsyncThunk(
    "adminUsers/fetchStats",
    async () => {
        const response = await api.get(`/admin/users/stats`);
        return response.data;
    }
);

const adminUserSlice = createSlice({
    name: "adminUsers",
    initialState,
    reducers: {
        clearUserDetails: (state) => {
            state.userDetails = null;
        },
        userUpdated: (state, action) => {
            const index = state.userList.findIndex(u => u._id === action.payload._id);
            if (index !== -1) {
                state.userList[index] = action.payload;
            }
        },
        userDeleted: (state, action) => {
            state.userList = state.userList.filter(u => u._id !== action.payload._id);
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all users
            .addCase(fetchAllUsers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userList = action.payload.data || [];
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Fetch user by ID
            .addCase(fetchUserById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userDetails = action.payload.data;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Update user
            .addCase(updateUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.data) {
                    const index = state.userList.findIndex(u => u._id === action.payload.data._id);
                    if (index !== -1) {
                        state.userList[index] = action.payload.data;
                    }
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Toggle user status
            .addCase(toggleUserStatus.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(toggleUserStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.data) {
                    const index = state.userList.findIndex(u => u._id === action.payload.data._id);
                    if (index !== -1) {
                        state.userList[index] = action.payload.data;
                    }
                }
            })
            .addCase(toggleUserStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Delete user
            .addCase(deleteUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userList = state.userList.filter(u => u._id !== action.payload.id);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Fetch user stats
            .addCase(fetchUserStats.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUserStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userStats = action.payload.data;
            })
            .addCase(fetchUserStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            });
    }
});

export const { clearUserDetails, userUpdated, userDeleted } = adminUserSlice.actions;
export default adminUserSlice.reducer;
