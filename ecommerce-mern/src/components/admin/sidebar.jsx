
import {ChartNoAxesCombined} from "lucide-react"
import { useNavigate } from "react-router-dom"
import {LayoutDashboard,ShoppingBasket,Truck} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";



// SideBar 
const menuItems = [
  {
      id : "dashboard",
      label : "Dashboard",
      path : "/admin/dashboard",
      icons : <LayoutDashboard />
  },
  {
      id : "products",
      label : "Products",
      path : "/admin/products",
      icons : <ShoppingBasket />
  },
  {
      id : "orders",
      label : "Orders",
      path : "/admin/orders",
      icons : <Truck />
  }
]


const MenuItems =({setOpen})=>{
  const navigate = useNavigate();
  return (
     
    <nav className="mt-8 flex-col flex gap-2">
      {
        menuItems.map((menuItem,index)=>{
          return <div key={index} className="flex items-center gap-2 rounded px-3 py-2 cursor-pointer hover:bg-muted hover:text-foreground hover:font-semibold text-md"
          onClick={()=>{navigate(menuItem.path)
          setOpen ? setOpen(false) :null}}
        >
            {menuItem.icons}
            <span>
              {menuItem.label || "" }
            </span>
          </div>
        })
      }
    </nav>
  )
}

export default function AdminSidebar({open,setOpen}) {
  const navigate = useNavigate();

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}  >
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex gap-2 mt-5 mb-5">
                <ChartNoAxesCombined size={30} />
                <span>
                  Admin Panel
                </span>
              </SheetTitle>  
            </SheetHeader>
            <MenuItems setOpen={setOpen}  />
          </div>
        </SheetContent>

      </Sheet>
      <aside className="hidden w-64 flex-col border-r bg-background p-6 lg:flex ">
        <div className="flex items-center gap-2 cursor-pointer" onClick={()=>navigate("/admin/dashboard")} >
          <ChartNoAxesCombined size={30} />
          <h1 className="text-xl font-extrabold">Admin Panel</h1>
        </div>
          <MenuItems/>
 
      </aside>
    </>
  )
}
