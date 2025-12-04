import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import ShopHeader from "./header";
import Footer from "../common/footer";


export default function ShopLayout() {
  // Disable copy, paste, and right-click for shop pages
  useEffect(() => {
    const preventCopy = (e) => {
      e.preventDefault();
      return false;
    };

    const preventContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const preventKeyboardShortcuts = (e) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+U (view source)
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a' || e.key === 'u')) {
        e.preventDefault();
        return false;
      }
      // Prevent F12 (dev tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCopy);
    document.addEventListener('paste', preventCopy);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyboardShortcuts);

    // Disable text selection via CSS
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCopy);
      document.removeEventListener('paste', preventCopy);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      
      // Re-enable text selection when leaving shop pages
      document.body.style.userSelect = 'auto';
      document.body.style.webkitUserSelect = 'auto';
    };
  }, []);

  return (
    <div className="flex flex-col bg-white h-screen overflow-y-scroll select-none">
      {/* common header */}
      <ShopHeader />
      <main className="flex flex-col w-full ">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
