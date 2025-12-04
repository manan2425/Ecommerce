import { useLocation,Navigate } from "react-router-dom"
 
export default function CheckAuth({isAuthenticated,user,children}) {
   
    const location = useLocation();

    // Redirect to login if not authenticated (except for login/register pages)
    if(!isAuthenticated && !(location.pathname.includes("/login")) && !(location.pathname.includes("/register"))) {
        return <Navigate to="/auth/login" replace />
    }

    // If authenticated and on login/register, redirect to dashboard or home
    if(isAuthenticated && ((location.pathname.includes("/login")) || location.pathname.includes("/register"))){
         if(user?.role==="admin"){
            return <Navigate to="/admin/dashboard" replace />
        }
        else{
            return <Navigate to="/shop/home" replace />
        }
    }

    // Non-admin users trying to access admin routes - redirect to login
    if(isAuthenticated && user?.role!=="admin" && location.pathname.includes("admin")){
        return <Navigate to="/auth/login" replace />
    }  

    // Admin users trying to access shop routes - redirect to admin dashboard
    if(isAuthenticated && user?.role==="admin" && location.pathname.includes("shop")){
        return <Navigate to="/admin/dashboard" replace />
    }

    return (
        <>
            {children}
        </>
  )
}
