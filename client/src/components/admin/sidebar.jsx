import { ChartNoAxesCombined, Building2, MessageCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBasket, Truck, TagsIcon, Activity, Wrench, Users, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getSocket, subscribeToOrderUpdates } from "@/lib/socket";
import {
  fetchAllServiceInquiries,
  addNewInquiry,
  updateInquiryInList,
  removeInquiryFromList,
} from "@/store/admin/service-inquiry-slice";
import { getAllOrders } from "@/store/shop/order-slice";

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
      id : "categories",
      label : "Categories",
      path : "/admin/categories",
      icons : <TagsIcon />
  },
  {
      id : "brands",
      label : "Brands",
      path : "/admin/brands",
      icons : <Building2 />
  },
  {
      id : "services",
      label : "Services",
      path : "/admin/services",
      icons : <Wrench />
  },
  {
      id : "service-inquiries",
      label : "Service Inquiries",
      path : "/admin/service-inquiries",
      icons : <MessageCircle />
  },
  {
      id : "orders",
      label : "Orders",
      path : "/admin/orders",
      icons : <Truck />
  },
  {
      id : "users",
      label : "Users",
      path : "/admin/users",
      icons : <Users />
  },
  {
      id : "contacts",
      label : "Contact Messages",
      path : "/admin/contacts",
      icons : <MessageSquare />
  },
  {
      id : "user-activities",
      label : "User Activities",
      path : "/admin/user-activities",
      icons : <Activity />
  }
];

const MenuItems = ({ setOpen }) => {
  const navigate = useNavigate();
  const { stats } = useSelector((state) => state.adminServiceInquiries);
  const { allOrders } = useSelector((state) => state.shopOrderSlice || {});

  const pendingOrdersCount = allOrders
    ? allOrders.filter((order) => order.orderStatus?.toLowerCase() === "pending").length
    : 0;

  const newInquiriesCount = stats?.new || 0;

  return (
    <nav className="mt-8 flex-col flex gap-2">
      {
        menuItems.map((menuItem, index) => {
          const badgeCount = menuItem.id === "service-inquiries"
            ? newInquiriesCount
            : menuItem.id === "orders"
            ? pendingOrdersCount
            : 0;

          return (
            <div
              key={index}
              className="flex items-center gap-2 rounded px-3 py-2 cursor-pointer hover:bg-muted hover:text-foreground hover:font-semibold text-md w-full"
              onClick={() => {
                navigate(menuItem.path);
                if (setOpen) setOpen(false);
              }}
            >
              {menuItem.icons}
              <span>{menuItem.label || ""}</span>
              {badgeCount > 0 && (
                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-extrabold text-white animate-pulse">
                  {badgeCount}
                </span>
              )}
            </div>
          );
        })
      }
    </nav>
  );
};

export default function AdminSidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Initial fetch of admin service inquiry stats and all orders
    dispatch(fetchAllServiceInquiries({ page: 1, limit: 10, status: "all" }));
    dispatch(getAllOrders());
  }, [dispatch]);

  useEffect(() => {
    const socket = getSocket();

    const handleNewInquiry = (inquiry) => {
      dispatch(addNewInquiry(inquiry));
      
      // Toast notification if not on the service inquiries page
      if (location.pathname !== "/admin/service-inquiries") {
        toast({
          title: "New Service Inquiry",
          description: `New inquiry from ${inquiry.name} for ${inquiry.serviceTitle}`,
        });
      }
    };

    const handleUpdateInquiry = (inquiry) => {
      dispatch(updateInquiryInList(inquiry));
    };

    const handleDeleteInquiry = (id) => {
      dispatch(removeInquiryFromList(id));
    };

    socket.on("new-service-inquiry", handleNewInquiry);
    socket.on("service-inquiry-updated", handleUpdateInquiry);
    socket.on("service-inquiry-deleted", handleDeleteInquiry);

    // Subscribe to order updates via central socket client helper
    const unsubscribeOrders = subscribeToOrderUpdates((data) => {
      dispatch(getAllOrders());
      
      // Toast notification for new order if not on the orders page
      if (data?.action === 'created' || data?.order) {
        if (location.pathname !== "/admin/orders") {
          toast({
            title: "New Order Placed",
            description: "A new order has been placed successfully.",
          });
        }
      }
    });

    return () => {
      socket.off("new-service-inquiry", handleNewInquiry);
      socket.off("service-inquiry-updated", handleUpdateInquiry);
      socket.off("service-inquiry-deleted", handleDeleteInquiry);
      unsubscribeOrders();
    };
  }, [dispatch, location.pathname, toast]);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex gap-2 mt-5 mb-5 items-center">
                <img src="/company_logo.png" alt="Company Logo" className="h-10 w-auto object-contain" />
                <span>Admin Panel</span>
              </SheetTitle>  
            </SheetHeader>
            <MenuItems setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
      <aside className="hidden w-64 flex-col border-r bg-background p-6 lg:flex">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/admin/dashboard")}>
          <img src="/company_logo.png" alt="Company Logo" className="h-10 w-auto object-contain" />
          <h1 className="text-xl font-extrabold">Admin Panel</h1>
        </div>
        <MenuItems />
      </aside>
    </>
  );
}
