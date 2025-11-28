import ProductFilter from "@/components/shop/filter";
import ProductDetailsModal from "@/components/shop/product-details";
import ShppingProductTile from "@/components/shop/productTile";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { sortOptions } from "@/config";
import { useToast } from "@/hooks/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchAllFilteredProducts, fetchProductDetails } from "@/store/shop/products-slice";
import { ArrowUpDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useLocation } from "react-router-dom";

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
  const { productList, productDetails } = useSelector(state => state.shopProducts);
  const [filters, setFilters] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("filters")) || {};
    } catch (e) {
      return {};
    }
  });
  const [sort, setSort] = useState('price-lowtohigh');
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { user } = useSelector(state => state.auth);
  const { toast } = useToast();
  const location = useLocation();

  // Fetch All Products
  useEffect(() => {
    const getFilteredData = async () => {
      try {
        if (filters !== null && sort !== "") {
          const response = await dispatch(fetchAllFilteredProducts({ filterParams: filters, sortParams: sort }));
        }
      } catch (error) {
        console.log(error);
      }
    }
    getFilteredData();
  }, [dispatch, sort, filters]);

  // For Filter Session Storage (Reload on URL change)
  useEffect(() => {
    setSort("price-lowtohigh");
    try {
      setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
    } catch (e) {
      setFilters({});
    }
  }, [location.search]);

  // For URL
  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(createQueryString));
    } else {
      const createQueryString = createSearchParamsHelper("");
      setSearchParams(new URLSearchParams(createQueryString));
    }
  }, [filters, setSearchParams]);

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
    try {
      const response = await dispatch(fetchProductDetails(id));
    } catch (error) {
      console.log(error)
    }
  }

  // Add To Cart 
  const handleAddToCart = async (productId, selectedPart = null, quantity = 1) => {
    try {
      const response = await dispatch(addToCart({ userId: user?.id, productId, quantity, selectedPart }));
      if (response?.payload?.success) {
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
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 h-fit sticky top-24 border border-gray-100">
        <ProductFilter handleFilter={handleFilter} filters={filters} />
      </div>
      <div className="bg-transparent w-full">
        <div className="p-6 bg-white rounded-xl shadow-sm mb-6 flex items-center justify-between border border-gray-100">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
            All Products
          </h2>
          <div className="flex gap-4 items-center">
            <span className="text-muted-foreground font-medium bg-gray-100 px-3 py-1 rounded-full text-sm">
              {productList?.length || 0} Products
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-gray-100 transition-colors border-gray-300">
                  <ArrowUpDownIcon className="h-4 w-4" />
                  <span>Sort By</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px] bg-white shadow-xl rounded-lg border border-gray-100 p-2">
                <DropdownMenuRadioGroup value={sort} onValueChange={(value) => setSort(value)}>
                  {sortOptions.map((sortItem, index) => (
                    <DropdownMenuRadioItem key={index} value={sortItem.id} className="cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors">
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productList && productList.length > 0 ? (
            productList.map((productItem, index) => (
              <ShppingProductTile key={index} product={productItem} handleGetProductDetails={handleGetProductDetails} handleAddToCart={handleAddToCart} />
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <h3 className="text-xl font-medium text-gray-500">No products found matching your criteria.</h3>
            </div>
          )}
        </div>
        <ProductDetailsModal
          open={openDetailsDialog}
          setOpen={setOpenDetailsDialog}
          productDetails={productDetails}
          handleAddToCart={handleAddToCart}
        />
      </div>
    </div>
  )
}
