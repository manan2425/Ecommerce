
import { House, LogOut, Menu, ShoppingCart, User, Search, X, ChevronDown } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "../ui/input";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useSelector, useDispatch } from "react-redux";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logout } from "@/store/auth-slice";
import { logUserLogout } from "@/lib/activityTracker";


import { useEffect, useState, useRef } from "react";
import CartWrapper from "./cart-wrapper";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { fetchShopCategories } from "@/store/shop/category-slice";
import { getSearchSuggestions, clearSuggestions } from "@/store/shop/search-slice";
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

  // Static menu items (non-category)
  const staticMenuItems = [
    { id: "home", label: "Home", path: "/shop/home" },
    { id: "about", label: "About Us", path: "/shop/about" }
  ];

  const endMenuItems = [
    { id: "services", label: "Services", path: "/shop/services" },
    { id: "contact", label: "Contact Us", path: "/shop/contact" }
  ];

  // Category items for dropdown
  const categoryItems = categories.map(cat => ({
    id: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
    label: cat.name,
    path: "/shop/listing"
  }));

  const navigateToCategory = (currentMenu) => {

    sessionStorage.removeItem("filters");
    const currentFilter = (currentMenu.id !== "home" && currentMenu.id !== "products" && currentMenu.id !== "services" && currentMenu.id !== "about" && currentMenu.id !== "contact") ? {
      category: [currentMenu.id]
    } : null;

    if (currentFilter) {
      sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    }

    // Force URL change so ShopList detects it (if already on listing page)
    if (currentMenu.path.includes('listing') && currentFilter) {
      navigate(`${currentMenu.path}?category=${currentMenu.id}`);
    } else {
      navigate(currentMenu.path);
    }
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row ">
      {/* Static menu items */}
      {staticMenuItems.map(menuItem => (
        <Label
          className="text-sm font-medium cursor-pointer hover:text-primary transition-colors relative group"
          onClick={() => navigateToCategory(menuItem)}
          key={menuItem.id}
        >
          {menuItem.label}
          <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
        </Label>
      ))}

      {/* Explicit Products Link */}
      <Label
        className="text-sm font-medium cursor-pointer hover:text-primary transition-colors relative group"
        onClick={() => navigateToCategory({ id: "products", path: "/shop/listing" })}
      >
        Products
        <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
      </Label>

      {/* Categories Dropdown ALWAYS visible now */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="text-sm font-medium cursor-pointer hover:text-primary transition-colors relative group flex items-center gap-1">
            Categories
            <ChevronDown className="h-4 w-4" />
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Product Categories</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {categoryItems.length > 0 ? (
            categoryItems.map(cat => (
              <DropdownMenuItem
                key={cat.id}
                onClick={() => navigateToCategory(cat)}
                className="cursor-pointer"
              >
                {cat.label}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled className="text-gray-400">
              No categories found
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate('/shop/listing')}
            className="cursor-pointer font-medium text-primary"
          >
            View All Products
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* End menu items */}
      {endMenuItems.map(menuItem => (
        <Label
          className="text-sm font-medium cursor-pointer hover:text-primary transition-colors relative group"
          onClick={() => navigateToCategory(menuItem)}
          key={menuItem.id}
        >
          {menuItem.label}
          <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
        </Label>
      ))}
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
      // Log logout activity before dispatching logout
      await logUserLogout();
      const reponse = await dispatch(logout());
      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        navigate('/auth/login');
      }, 100);
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
  const { suggestions } = useSelector(state => state.shopSearch);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [keyword, setKeyword] = useState("");
  const [searchParams] = useSearchParams();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    setKeyword(searchParams.get('keyword') || "");
  }, [searchParams]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword.trim().length >= 2) {
        dispatch(getSearchSuggestions(keyword));
        setShowSuggestions(true);
      } else {
        dispatch(clearSuggestions());
        setShowSuggestions(false);
      }
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [keyword, dispatch]);

  const handleSearch = () => {
    if (keyword.trim()) {
      setShowSuggestions(false);
      navigate(`/shop/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setKeyword(suggestion);
    setShowSuggestions(false);
    navigate(`/shop/search?q=${encodeURIComponent(suggestion)}`);
  };

  const clearSearch = () => {
    setKeyword("");
    dispatch(clearSuggestions());
    setShowSuggestions(false);
  };

  return (

    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-300">

      <div className="flex h-16 items-center justify-between px-4 md:px-6 container mx-auto">

        <Link to="/shop/home" className="flex items-center gap-2 group">
          <img src="/company_logo.png" alt="Company Logo" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
          <span className="font-extrabold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight hidden md:inline">
            SHREE MARUTI TRADERS
          </span>
        </Link>

        <div className="hidden lg:block">
          <MenuItems />
        </div>

        {/* Enhanced Search Bar */}
        <div className="hidden lg:flex items-center w-full max-w-md mx-4 relative" ref={searchRef}>
          <div className="relative w-full">
            <Input
              placeholder="Search products, brands, categories..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => keyword.length >= 2 && setShowSuggestions(true)}
              className="bg-gray-50 pr-16 pl-4 h-10 rounded-full border-gray-200 focus:border-primary focus:ring-primary"
            />
            {keyword && (
              <button
                onClick={clearSearch}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <Button 
              size="icon" 
              onClick={handleSearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
            >
              <Search className="w-4 h-4 text-white" />
            </Button>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
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
              {/* Mobile Search */}
              <div className="relative">
                <Input
                  placeholder="Search products..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-gray-50 pr-10"
                />
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={handleSearch}
                  className="absolute right-0 top-0 h-full"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
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
