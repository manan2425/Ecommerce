import { Route, Routes, Navigate } from "react-router-dom"
import AuthLayout from "./components/auth/layout"
import AuthLogin from "./pages/auth/Login"
import AuthRegister from "./pages/auth/Register"
import AdminLayout from "./components/admin/layout"
import AdminDashboard from "./pages/admin/dashboard"
import AdminProducts from "./pages/admin/products"
import AdminOrders from "./pages/admin/orders"
import AdminFeatures from "./pages/admin/features"
import ShopLayout from "./components/shop/layout"
import NotFound from "./pages/not-found"
import ShopHome from "./pages/shop/home"
import ShopList from "./pages/shop/listing"
import ShopCheckout from "./pages/shop/checkout"
import ShopAccount from "./pages/shop/account"
import CheckAuth from "./components/common/checkAuth"
import UnAuthPage from "./pages/unauth-page"
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { checkAuth } from "./store/auth-slice"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"

function App() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user, isLoading } = useSelector(state => state.auth);

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
          <Route path="/" element={<Navigate to="/auth/register" replace />} />

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
          </Route>

          <Route path="/shop" element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ShopLayout />
            </CheckAuth>}
          >
            <Route path="home" element={<ShopHome />} />
            <Route path="listing" element={<ShopList />} />
            <Route path="checkout" element={<ShopCheckout />} />
            <Route path="account" element={<ShopAccount />} />
          </Route>
          <Route path="*" element={<NotFound />} />
          <Route path="/unauth-page" element={<UnAuthPage />} />
        </Routes>
      </div>

    </>
  )
}

export default App
