import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import api from "@/lib/api"

// Initial State
const initialState = {
    isAuthenticated: false,
    isLoading: true,
    user : null
}

// Register New USer
export const registerUser = createAsyncThunk("/auth/register",async(formData)=>{
    try{
        const response = await api.post(`/auth/register`,formData,{
            withCredentials : true,
        });
        console.log("Register User : " + response.data);
        return response.data;

    }catch(error){
        console.log("Error In Registeration : ", error?.message || error);
        // Normalize error return so callers always get an object
        return error?.response?.data || { success: false, message: error?.message || 'Network Error' };
    }
})


// Login User
export const loginUser = createAsyncThunk("/auth/login",async(formData)=>{
    try{
        const response = await api.post(`/auth/login`,formData,{
            withCredentials : true,
        });
        console.log("Login User : " + response.data);
        return response.data;

    }catch(error){
        console.log("Error In Login : ", error?.message || error );
        return error?.response?.data || { success: false, message: error?.message || 'Network Error' };
    }
})

// Check Auth
export const checkAuth = createAsyncThunk("/auth/checkauth",async()=>{

    try{
  
        const response = await api.get(`/auth/check-auth`,{headers:"Cache-Control : no-store,no-cache,must-revalidate,proxy-revalidate"});
         
        return response.data;
    }catch(error){
        console.log(error);
  
    }
})


// Logout 
export const logout = createAsyncThunk("/auth/logout",async(formData)=>{
    try{
        const response = await api.post(`/auth/logout`,{},{
            withCredentials : true,
        });
        console.log("Logout User : ",response.data);
        return response.data;

    }catch(error){
        console.log("Error In Login : " + error );
        return error.response.data;
    }
})


// auth Slice
const authSlice = createSlice({
    name : "auth",
    initialState,
    reducers : {
        setUser : (state,action)=>{

        }
    },
    extraReducers : (builder)=>(
        // Register
        builder
        .addCase(registerUser.pending,(state)=>{
            state.isLoading = true
        })
        .addCase(registerUser.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.user = action.payload.success ? action.payload.user :  false;
            state.isAuthenticated = false;
        })
        .addCase(registerUser.rejected,(state)=>{
            state.isLoading = false;
            state.user = null;
            state.isAuthenticated = false;
        })
        // Login
        .addCase(loginUser.pending,(state)=>{
            state.isLoading = true
        })
        .addCase(loginUser.fulfilled,(state,action)=>{
            
            console.log("Actions in Auth Slice : ",action)
            state.isLoading = false;
            state.user = action.payload?.success ? action.payload.user :  false;
            state.isAuthenticated = action.payload?.success ? true :  false;
        })
        .addCase(loginUser.rejected,(state)=>{
            state.isLoading = false;
            state.user = null;
            state.isAuthenticated = false;
        })
        // Refresh Handle
        .addCase(checkAuth.pending,(state)=>{
            state.isLoading = true
        })
        .addCase(checkAuth.fulfilled,(state,action)=>{
            
            state.isLoading = false;
            const payload = action.payload || {};
            // console.log("Payload: " + JSON.stringify(payload));
            state.user = payload.success ?  payload.user :  null;
            state.isAuthenticated =  payload.success ? true :  false;
        })
        .addCase(checkAuth.rejected,(state)=>{
            state.isLoading = false;
            state.user = null;
            state.isAuthenticated = false;
        })
        // Logout
        .addCase( logout.pending,(state)=>{
            state.isLoading = true;
        })
        .addCase(logout.fulfilled,(state,action)=>{
            
            state.isLoading = false;
            const payload = action.payload || {};
            state.user = null;
            state.isAuthenticated = false;
        })



    )
})


export const {setUser}  = authSlice.actions;
export default authSlice.reducer;

// .addCase(checkAuth.fulfilled, (state, action) => {
//     state.isLoading = false;
//     const payload = action.payload || {};
//     state.user = payload.success ? payload.user : null;
//     state.isAuthenticated = !!payload.success;
// })