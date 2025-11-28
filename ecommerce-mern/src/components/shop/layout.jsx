import { Outlet } from "react-router-dom";
import ShopHeader from "./header";
import Footer from "../common/footer";


export default function ShopLayout() {
  return (
    <div className="flex flex-col bg-white h-screen overflow-y-scroll">
      {/* common header */}
      <ShopHeader />
      <main className="flex flex-col w-full ">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
