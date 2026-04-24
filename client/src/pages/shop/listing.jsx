import ProductFilter from "@/components/shop/filter";
import ProductDetailsModal from "@/components/shop/product-details";
import ShppingProductTile from "@/components/shop/productTile";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { sortOptions } from "@/config";
import { useToast } from "@/hooks/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchAllFilteredProducts, fetchProductDetails } from "@/store/shop/products-slice";
import { ArrowUpDownIcon, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { logProductAddToCart } from "@/lib/activityTracker";
import { useRealtimeProducts } from "@/hooks/use-realtime";

const createSearchParamsHelper = (filterParams) => {
  const queryParams = [];
  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }
  return queryParams.join("&");
}

export default function ShopList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productList, productDetails } = useSelector(state => state.shopProducts);
  const [filters, setFilters] = useState(() => {
    // Priority 1: URL search params
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      return { category: categoryParam.split(',') };
    }
    // Priority 2: Session storage (only for legacy compatibility/internal transitions)
    try {
      return JSON.parse(sessionStorage.getItem("filters")) || {};
    } catch (e) {
      return {};
    }
  });
  const [sort, setSort] = useState('price-lowtohigh');
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { toast } = useToast();
  const location = useLocation();

  // Real-time product updates - auto-refresh when admin adds/updates products
  useRealtimeProducts(filters, sort);

  // Fetch All Products
  useEffect(() => {
    const getFilteredData = async () => {
      try {
        if (filters !== null && sort !== "") {
          await dispatch(fetchAllFilteredProducts({ 
            filterParams: filters, 
            sortParams: sort, 
            keyword: searchParams.get('keyword') 
          }));
        }
      } catch (error) {
        console.log(error);
      }
    }
    getFilteredData();
  }, [dispatch, sort, filters, searchParams]);

  // Sync filters from URL when it changes (e.g. back button)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const urlFilters = { category: categoryParam.split(',') };
      // Only update if filters are actually different to avoid cycles
      if (JSON.stringify(urlFilters) !== JSON.stringify(filters)) {
        setFilters(urlFilters);
      }
    } else if (Object.keys(filters).length > 0 && !searchParams.get('keyword')) {
      // If URL is empty and we have filters, and it's not a keyword search, clear filters
      // This handles clicking "Home" or clear all
      setFilters({});
    }
  }, [searchParams]);

  // For URL Sync (when filters change via UI)
  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      const newParams = new URLSearchParams(createQueryString);
      
      // Use replace: true if the filters are the same to avoid pushing multiple entries for the same state
      if (searchParams.toString() !== newParams.toString()) {
        setSearchParams(newParams, { replace: false });
      }
    } else {
      // Don't clear searchParams if there's a keyword
      if (!searchParams.get('keyword') && searchParams.toString() !== "") {
        setSearchParams(new URLSearchParams(""), { replace: true });
      }
    }
  }, [filters]);

  useEffect(() => {
    if (productDetails !== null) {
      setOpenDetailsDialog(true);
    }
  }, [productDetails]);

  // For Filter Handling
  const handleFilter = (getSectionId, getCurrentOption, checked) => {
    try {
      let cpyFilters = { ...filters };
      if (checked) {
        if (!cpyFilters[getSectionId]) {
          cpyFilters[getSectionId] = [];
        }
        if (!cpyFilters[getSectionId].includes(getCurrentOption)) {
          cpyFilters[getSectionId].push(getCurrentOption);
        }
      } else {
        if (cpyFilters[getSectionId]) {
          cpyFilters[getSectionId] = cpyFilters[getSectionId].filter(
            (option) => option !== getCurrentOption
          );
          if (cpyFilters[getSectionId].length === 0) {
            delete cpyFilters[getSectionId];
          }
        }
      }
      setFilters(cpyFilters);
      sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
    } catch (error) {
      console.error(error);
    }
  };

  // Get Data By Id
  const handleGetProductDetails = async (id) => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    try {
      const response = await dispatch(fetchProductDetails(id));
    } catch (error) {
      console.log(error)
    }
  }

  // Add To Cart 
  const handleAddToCart = async (productId, selectedPart = null, quantity = 1, selectedVariant = null, selectedOptions = null) => {
    if (!isAuthenticated) {
      toast({
        title: "Please login to add items to cart",
        variant: "destructive"
      })
      navigate('/auth/login');
      return;
    }
    try {
      const response = await dispatch(addToCart({ 
        userId: user?.id, 
        productId, 
        quantity, 
        selectedPart,
        selectedVariant,
        selectedOptions
      }));
      if (response?.payload?.success) {
        // Track add to cart activity
        logProductAddToCart(productId);
        toast({
          title: response?.payload?.message,
        })
        try {
          const fetchCartData = await dispatch(fetchCartItems(user?.id));
        } catch (error) {
          console.log(error);
        }
      } else {
        toast({
          title: response?.payload?.message || "Something Went Wrong",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-mesh">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-12 p-8 md:p-12">
        
        {/* Modern Filter Sidebar */}
        <aside className="relative lg:block hidden">
          <div className="bg-white rounded-[2.5rem] shadow-premium p-10 sticky top-28 border border-slate-100 overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <ProductFilter handleFilter={handleFilter} filters={filters} />
          </div>
        </aside>

        <main className="w-full space-y-10">
          {/* Refined Sort & Count Bar */}
          <div className="p-8 bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-premium flex flex-col sm:flex-row items-center justify-between border border-white gap-6">
            <div className="flex flex-col items-start gap-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Industrial Catalog
              </h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">
                {productList?.length || 0} Components Available
              </p>
            </div>
            
            <div className="flex gap-4 items-center w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="flex items-center gap-3 rounded-2xl border-slate-200 hover:bg-slate-50 hover:text-primary transition-all duration-300 font-bold px-6">
                    <ArrowUpDownIcon className="h-4 w-4" />
                    <span>Sort By</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[220px] bg-white shadow-2xl rounded-3xl border border-slate-100 p-3 mt-2">
                  <DropdownMenuRadioGroup value={sort} onValueChange={(value) => setSort(value)}>
                    {sortOptions.map((sortItem, index) => (
                      <DropdownMenuRadioItem key={index} value={sortItem.id} className="cursor-pointer hover:bg-slate-50 rounded-xl p-3 font-medium transition-colors mb-1 last:mb-0">
                        {sortItem.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-10">
            {productList && productList.length > 0 ? (
              productList.map((productItem, index) => (
                <div key={index} className="flex">
                  <ShppingProductTile product={productItem} handleGetProductDetails={handleGetProductDetails} handleAddToCart={handleAddToCart} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-32 glass rounded-[3rem] border-slate-100 flex flex-col items-center">
                <Package className="w-20 h-20 text-slate-200 mb-6" />
                <h3 className="text-2xl font-black text-slate-300">No components found matching your search.</h3>
              </div>
            )}
          </div>
          
          <ProductDetailsModal
            open={openDetailsDialog}
            setOpen={setOpenDetailsDialog}
            productDetails={productDetails}
            handleAddToCart={handleAddToCart}
          />
        </main>
      </div>
    </div>
  )
}
