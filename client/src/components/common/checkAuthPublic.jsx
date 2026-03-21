import { useLocation, Navigate } from "react-router-dom"

export default function CheckAuthPublic({ isAuthenticated, user, children }) {
  const location = useLocation();

  // Allow public access to shop pages - no authentication required for browsing
  // Only redirect admin users away from shop pages
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  // Allow everyone (logged in or not) to access shop pages
  return (
    <>
      {children}
    </>
  )
}

