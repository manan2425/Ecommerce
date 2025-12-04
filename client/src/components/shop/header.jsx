
import { House, LogOut, Menu, ShoppingCart, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useSelector, useDispatch } from "react-redux";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logout } from "@/store/auth-slice";


import { useEffect, useState } from "react";
import CartWrapper from "./cart-wrapper";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { fetchShopCategories } from "@/store/shop/category-slice";
import { Label } from "../ui/label";
import axios from "axios";


const MenuItems = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.shopCategories);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchShopCategories());
  }, [dispatch]);

  // Build menu items dynamically from categories
  const menuItems = [
    { id: "home", label: "Home", path: "/shop/home" },
    ...categories.map(cat => ({
      id: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
      label: cat.name,
      path: "/shop/listing"
    }))
  ];

  const navigateToCategory = (currentMenu) => {

    sessionStorage.removeItem("filters");
    const currentFilter = currentMenu.id !== "home" ? {
      category: [currentMenu.id]
    } : null;


    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    // Force URL change so ShopList detects it (if already on listing page)
    if (currentMenu.path.includes('listing') && currentFilter) {
      navigate(`${currentMenu.path}?category=${currentMenu.id}`);
    } else {
      navigate(currentMenu.path);
    }
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row ">
      {
        menuItems.map(menuItem => <Label
          className="text-sm font-medium cursor-pointer hover:text-primary transition-colors relative group"
          onClick={() => navigateToCategory(menuItem)}
          key={menuItem.id} >
          {menuItem.label}
          <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
        </Label>
        )
      }
    </nav>
  )
}


const HeaderRightContent = () => {

  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const { cartItems } = useSelector(state => state.shopCart);


  const navigate = useNavigate();
  const dispatch = useDispatch();
  // console.log("User : " + JSON.stringify(user));

  const handleLogOut = async () => {
    try {
      const reponse = await dispatch(logout());
    } catch (error) {
      console.log(error);
    }
  }

  // For Getting Cart Items
  useEffect(() => {

    const fetchCartData = async () => {
      try {

        const reponse = await dispatch(fetchCartItems(user?.id));

      } catch (error) {
        console.log(error);
      }
    }
    
    if (isAuthenticated && user?.id) {
      fetchCartData();
    }
  }, [dispatch, user?.id, isAuthenticated])


  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <Button 
          variant="outline"
          onClick={() => navigate("/auth/login")}
          className="border-primary text-primary hover:bg-primary/10"
        >
          Login
        </Button>
        <Button 
          onClick={() => navigate("/auth/register")}
          className="bg-primary hover:bg-primary/90"
        >
          Register
        </Button>
      </div>
    );
  }

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">

      <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)} >
        <Button variant="ghost" size="icon"
          onClick={() => setOpenCartSheet(true)} className="relative hover:bg-primary/10 transition-colors">
          <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-primary transition-colors" />
          {cartItems?.items?.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
              {cartItems?.items?.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </Button>
        <CartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={cartItems && cartItems.items && cartItems.items.length > 0 ? cartItems.items : []}

        />
      </Sheet>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-gray-100 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
            <AvatarFallback className="bg-primary text-white font-extrabold">

              {user?.userName ? user?.userName[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" className="w-56 bg-white shadow-xl rounded-lg border border-gray-100 p-2">

          <DropdownMenuLabel className="text-gray-700">
            Logged In as {user?.userName || "Guest"}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => navigate("/shop/account")} className="cursor-pointer hover:bg-gray-50 rounded-md">
            <User className="mx-2 h-4 w-4" /> Account
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => handleLogOut()} className="cursor-pointer hover:bg-red-50 text-red-600 rounded-md">
            <LogOut className="mx-2 h-4 w-4" /> Logout
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  );

}


export default function ShopHeader() {


  const { isAuthenticated } = useSelector(state => state.auth);

  return (

    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-300">

      <div className="flex h-16 items-center justify-between px-4 md:px-6 container mx-auto">

        <Link to="/shop/home" className="flex items-center gap-2 group">
          <House className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-extrabold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent tracking-tight">
            E-Commerce
          </span>
        </Link>

        <div className="hidden lg:block">
          <MenuItems />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden border-none hover:bg-gray-100">
              <Menu className="h-6 w-6" />
              <span className="sr-only">
                Toggle Header Menu
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full mx-w-xs bg-white border-r border-gray-100">
            <div className="flex flex-col gap-6 mt-6">
              <MenuItems />
              <HeaderRightContent />
            </div>
          </SheetContent>
        </Sheet>

        <div className="hidden lg:block">
          <HeaderRightContent />
        </div>

      </div>

    </header>
  )
}
