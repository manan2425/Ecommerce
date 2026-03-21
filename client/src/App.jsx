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
import AdminBrands from "./pages/admin/brands"
import AdminUserActivities from "./pages/admin/user-activities"
import AdminServices from "./pages/admin/services"
import AdminUsers from "./pages/admin/users"
import AdminContacts from "./pages/admin/contacts"
import AdminServiceInquiries from "./pages/admin/service-inquiries"
import ShopLayout from "./components/shop/layout"
import NotFound from "./pages/not-found"
import ShopHome from "./pages/shop/home"
import ShopList from "./pages/shop/listing"
import ShopCheckout from "./pages/shop/checkout"
import ShopAccount from "./pages/shop/account"
import ShopServices from "./pages/shop/services"
import ShopAbout from "./pages/shop/about"
import ShopContact from "./pages/shop/contact"
import ShopSearch from "./pages/shop/search"
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
import { initSocket } from "./lib/socket"

function App() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user, isLoading } = useSelector(state => state.auth);

  useEffect(() => {
    // Initialize content protection when app loads
    initializeContentProtection();
    // Initialize socket connection for real-time updates
    initSocket();
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

  // Show loading skeleton only for a brief moment while checking auth
  // But allow public routes to render even during loading
  if (isLoading) {
    return <Skeleton className="w-[800] bg-black h-[600px]" />;
  }

  return (
    <>
      <div className="flex flex-col overflow-hidden bg-white">

        <Toaster />

        {/* common components */}
        <Routes>
          {/* Root path - redirect to shop home for guests, admin dashboard for admin, shop home for users */}
          <Route path="/" element={
            isAuthenticated 
              ? (user?.role === 'admin' 
                  ? <Navigate to="/admin/dashboard" replace /> 
                  : <Navigate to="/shop/home" replace />)
              : <Navigate to="/shop/home" replace />
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
            <Route path="brands" element={<AdminBrands />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="service-inquiries" element={<AdminServiceInquiries />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="contacts" element={<AdminContacts />} />
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
            <Route path="services" element={<ShopServices />} />
            <Route path="about" element={<ShopAbout />} />
            <Route path="contact" element={<ShopContact />} />
            <Route path="search" element={<ShopSearch />} />
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
