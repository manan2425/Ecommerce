import { Route, Routes, Navigate } from "react-router-dom"
import AuthLayout from "./components/auth/layout"
import AuthLogin from "./pages/auth/Login"
import AuthRegister from "./pages/auth/Register"
import AdminLayout from "./components/admin/layout"
import AdminDashboard from "./pages/admin/dashboard-new"
import AdminProducts from "./pages/admin/products"
import AdminOrders from "./pages/admin/orders"
import AdminFeatures from "./pages/admin/features"
import AdminCategories from "./pages/admin/categories"
import AdminUserActivities from "./pages/admin/user-activities"
import ShopLayout from "./components/shop/layout"
import NotFound from "./pages/not-found"
import ShopHome from "./pages/shop/home"
import ShopList from "./pages/shop/listing"
import ShopCheckout from "./pages/shop/checkout"
import ShopAccount from "./pages/shop/account"
import PartDetailsPage from "./pages/shop/part-details"
import CheckAuth from "./components/common/checkAuth"
import CheckAuthPublic from "./components/common/checkAuthPublic"
import UnAuthPage from "./pages/unauth-page"
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { checkAuth } from "./store/auth-slice"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"
import { initializeContentProtection } from "./lib/contentProtection"

function App() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user, isLoading } = useSelector(state => state.auth);

  useEffect(() => {
    // Initialize content protection when app loads
    initializeContentProtection();
  }, []);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await dispatch(checkAuth());


      } catch (error) {
        console.log(error)
      }
    }
    checkAuthentication();
  }, [dispatch]);


  // Authentication routing is handled by CheckAuth wrapper on the routes.
  // Remove the unconditional cookie redirect to avoid blocking legitimate
  // public routes (for example: /auth/register).



  if (isLoading) {
    return <Skeleton className="w-[800] bg-black h-[600px]" />;
  }

  return (
    <>
      <div className="flex flex-col overflow-hidden bg-white">

        <Toaster />

        {/* common components */}
        <Routes>
          {/* Root path - redirect to login if not authenticated, otherwise redirect based on role */}
          <Route path="/" element={
            isAuthenticated 
              ? (user?.role === 'admin' 
                  ? <Navigate to="/admin/dashboard" replace /> 
                  : <Navigate to="/shop/home" replace />)
              : <Navigate to="/auth/login" replace />
          } />

          <Route path="/auth" element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>}
          >
            <Route path="login" element={<AuthLogin />} />
            <Route path="register" element={<AuthRegister />} />
          </Route>

          <Route path="/admin" element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AdminLayout />
            </CheckAuth>}
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="features" element={<AdminFeatures />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="user-activities" element={<AdminUserActivities />} />
          </Route>

          {/* Public Shop Routes - can access without authentication */}
          <Route path="/shop" element={
            <CheckAuthPublic isAuthenticated={isAuthenticated} user={user}>
              <ShopLayout />
            </CheckAuthPublic>}
          >
            <Route path="home" element={<ShopHome />} />
            <Route path="listing" element={<ShopList />} />
            <Route path="product/:productId/part/:partPath" element={<PartDetailsPage />} />
            <Route path="checkout" element={isAuthenticated ? <ShopCheckout /> : <Navigate to="/auth/login" replace />} />
            <Route path="account" element={isAuthenticated ? <ShopAccount /> : <Navigate to="/auth/login" replace />} />
          </Route>
          <Route path="*" element={<NotFound />} />
          <Route path="/unauth-page" element={<UnAuthPage />} />
        </Routes>
      </div>

    </>
  )
}

export default App
