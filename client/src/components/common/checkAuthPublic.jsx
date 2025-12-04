import { useLocation, Navigate } from "react-router-dom"

export default function CheckAuthPublic({ isAuthenticated, user, children }) {
  const location = useLocation();

  // Require authentication for all shop pages
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  // If admin user tries to access shop, redirect to admin dashboard
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <>
      {children}
    </>
  )
}
