import { Outlet } from "react-router-dom";
import AdminHeader from "./header";
import AdminSidebar from "./sidebar";
import Footer from "../common/footer";
import { useState } from "react";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full">
      {/* Admin Sidebar */}
      <AdminSidebar open={open} setOpen={setOpen} />
      <div className="flex flex-1 flex-col">
        {/* Admin Header */}
        <AdminHeader setOpen={setOpen} />
        <main className="flex flex-col flex-1 bg-muted/40 p-4 md:p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
