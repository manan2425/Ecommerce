import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Fetch all contacts
export const fetchAllContacts = createAsyncThunk(
    "adminContacts/fetchAll",
    async ({ page = 1, limit = 10, status = "all", search = "", sortBy = "createdAt", sortOrder = "desc" }, { rejectWithValue }) => {
        try {
            const response = await api.get(
                "/admin/contacts",
                {
                    params: { page, limit, status, search, sortBy, sortOrder }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch contacts");
        }
    }
);

// Fetch single contact
export const fetchContactById = createAsyncThunk(
    "adminContacts/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(
                `/admin/contacts/${id}`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch contact");
        }
    }
);

// Update contact status
export const updateContactStatus = createAsyncThunk(
    "adminContacts/updateStatus",
    async ({ id, status, adminNotes }, { rejectWithValue }) => {
        try {
            const response = await api.put(
                `/admin/contacts/${id}`,
                { status, adminNotes }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update contact");
        }
    }
);

// Delete contact
export const deleteContact = createAsyncThunk(
    "adminContacts/delete",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(
                `/admin/contacts/${id}`
            );
            return { ...response.data, id };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete contact");
        }
    }
);

// Bulk delete contacts
export const bulkDeleteContacts = createAsyncThunk(
    "adminContacts/bulkDelete",
    async (ids, { rejectWithValue }) => {
        try {
            const response = await api.post(
                "/admin/contacts/bulk-delete",
                { ids }
            );
            return { ...response.data, ids };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete contacts");
        }
    }
);

const contactSlice = createSlice({
    name: "adminContacts",
    initialState: {
        contacts: [],
        currentContact: null,
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalContacts: 0,
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
        clearCurrentContact: (state) => {
            state.currentContact = null;
        },
        // Real-time updates from socket
        addNewContact: (state, action) => {
            state.contacts.unshift(action.payload);
            state.stats.total += 1;
            state.stats.new += 1;
            state.pagination.totalContacts += 1;
        },
        updateContactInList: (state, action) => {
            const updated = action.payload;
            const index = state.contacts.findIndex(c => c._id === updated._id);
            if (index !== -1) {
                const oldStatus = state.contacts[index].status;
                const newStatus = updated.status;
                
                // Update stats
                if (oldStatus !== newStatus) {
                    state.stats[oldStatus] = Math.max(0, (state.stats[oldStatus] || 0) - 1);
                    state.stats[newStatus] = (state.stats[newStatus] || 0) + 1;
                }
                
                state.contacts[index] = updated;
            }
            if (state.currentContact?._id === updated._id) {
                state.currentContact = updated;
            }
        },
        removeContactFromList: (state, action) => {
            const id = action.payload;
            const contact = state.contacts.find(c => c._id === id);
            if (contact) {
                state.stats[contact.status] = Math.max(0, (state.stats[contact.status] || 0) - 1);
                state.stats.total = Math.max(0, state.stats.total - 1);
            }
            state.contacts = state.contacts.filter(c => c._id !== id);
            state.pagination.totalContacts = Math.max(0, state.pagination.totalContacts - 1);
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all contacts
            .addCase(fetchAllContacts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllContacts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.contacts = action.payload.data;
                state.pagination = action.payload.pagination;
                state.stats = action.payload.stats;
            })
            .addCase(fetchAllContacts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch contact by ID
            .addCase(fetchContactById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchContactById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentContact = action.payload.data;
                // Update in list too
                const index = state.contacts.findIndex(c => c._id === action.payload.data._id);
                if (index !== -1) {
                    state.contacts[index] = action.payload.data;
                }
            })
            .addCase(fetchContactById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update contact status
            .addCase(updateContactStatus.fulfilled, (state, action) => {
                const updated = action.payload.data;
                const index = state.contacts.findIndex(c => c._id === updated._id);
                if (index !== -1) {
                    state.contacts[index] = updated;
                }
                if (state.currentContact?._id === updated._id) {
                    state.currentContact = updated;
                }
            })
            // Delete contact
            .addCase(deleteContact.fulfilled, (state, action) => {
                const { id } = action.payload;
                state.contacts = state.contacts.filter(c => c._id !== id);
                if (state.currentContact?._id === id) {
                    state.currentContact = null;
                }
            })
            // Bulk delete
            .addCase(bulkDeleteContacts.fulfilled, (state, action) => {
                const { ids } = action.payload;
                state.contacts = state.contacts.filter(c => !ids.includes(c._id));
            });
    }
});

export const { 
    clearCurrentContact, 
    addNewContact, 
    updateContactInList, 
    removeContactFromList 
} = contactSlice.actions;

export default contactSlice.reducer;
