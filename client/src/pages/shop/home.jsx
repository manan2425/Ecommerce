import { Button } from "@/components/ui/button";
import { 
  BabyIcon, 
  BookHeart, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  FootprintsIcon, 
  ShirtIcon, 
  WatchIcon, 
  Package, 
  ShieldCheck, 
  Zap, 
  Truck, 
  HeadphonesIcon,
  Star
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import ShoppingProductTile from "../../components/shop/productTile";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { addToCart } from "@/store/shop/cart-slice";
import { fetchShopCategories } from "@/store/shop/category-slice";
import { useToast } from "@/hooks/use-toast";
import ProductDetailsModal from "@/components/shop/product-details";
import { logProductAddToCart } from "@/lib/activityTracker";
import { useRealtimeProducts, useRealtimeCategories } from "@/hooks/use-realtime";

// Default icon mapping for categories (fallback)
const categoryIconMap = {
  'men': ShirtIcon,
  'women': BookHeart,
  'kids': BabyIcon,
  'accessories': WatchIcon,
  'footwear': FootprintsIcon
};

// For Brands
const brands = [
  { id: "nike", label: "Nike" },
  { id: "adidas", label: "Adidas" },
  { id: "puma", label: "Puma" },
  { id: "levi", label: "Levi" },
  { id: "zara", label: "Zara" },
  { id: "h&m", label: "H&M" }
];

export default function ShopHome() {

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Real-time updates - products and categories auto-refresh
  useRealtimeProducts();
  useRealtimeCategories();

  // Get User
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { productDetails } = useSelector(state => state.shopProducts);
  const { categories } = useSelector(state => state.shopCategories);

  // Build categories with icons dynamically
  const categoriesWithIcon = categories.map(cat => ({
    id: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
    label: cat.name,
    icon: categoryIconMap[cat.slug] || categoryIconMap[cat.name.toLowerCase()] || Package,
    image: cat.image
  }));

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchShopCategories());
  }, [dispatch]);



  // Products Data
  const { productList } = useSelector(state => state.shopProducts)

  // For Slides
  const [currentSlide, setCurrentSlide] = useState(0);



  // Get Data By Id
  const handleGetProductDetails = async (id) => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    try {
      console.log("Id : " + id);
      const response = await dispatch(fetchProductDetails(id));
      // console.log("Product Details :",productDetails);

    } catch (error) {
      console.log(error)
    }
  }

  // Add To Cart 
  // productId: string
  // selectedPart: optional object { name, nodeName, price, ... }
  // selectedVariant: optional variant object
  // selectedOptions: optional object { "Color": "Red", "Size": "M" }
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
      console.log("Cart Products Id :  ", productId);
      const response = await dispatch(addToCart({ 
        userId: user?.id, 
        productId, 
        quantity: quantity || 1, 
        selectedPart,
        selectedVariant,
        selectedOptions
      }));
      console.log("Add to Cart Response : ", response);
      if (response?.payload?.success) {
        // Track add to cart activity
        logProductAddToCart(productId);
        toast({
          title: response?.payload?.message,

        })

        try {
          const fetchCartData = await dispatch(fetchCartItems(user?.id));
          console.log("Cart Items : " + fetchCartData)

        } catch (error) {
          console.log(error);
        }

      }
      else {
        toast({
          title: response?.payload?.message || "Something Went Wrong",
          variant: "destructive"
        })
      }

    } catch (error) {
      console.log(error)

    }
  }

  // Get all Products
  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: "price-lowtohigh" }));

      } catch (error) {
        console.log(error);
      }
    }
    getProducts();
  }, [dispatch]);



  // console.log("Product List Home : ",productList);
  const handleNavigatetoListingPage = (item, section) => {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [item.id]
    };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    console.log("Home Filter : ", JSON.stringify(currentFilter));
    navigate("/shop/listing")
  }

  useEffect(() => {
    if (productDetails !== null) {
      setOpenDetailsDialog(true);
    }
  }, [productDetails]);


  // Do This Same for Brands


  return (
    <div className="flex flex-col min-h-screen bg-mesh">

      {/* Cinematic Visual Excellence Hero Section */}
      <div className="relative w-full min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Atmospheric Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-24 pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-[100px] -ml-24 -mb-24 pointer-events-none"></div>

        <div className="w-full px-6 md:px-16 grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-12 items-center py-16 relative z-10">
          <div className="flex flex-col items-start text-left space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase transition-all hover:bg-primary/20 cursor-default">
              <Star className="w-3.5 h-3.5 fill-primary" />
              Trusted by 5,000+ Industrial Partners
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Powering the <br />
              <span className="text-gradient-primary">Industrial Future</span>
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
              Shree Maruti Traders delivers high-precision industrial electronics and electrical solutions that define reliability. Elevate your engineering standards today.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Button 
                size="lg"
                className="text-base px-8 py-7 rounded-xl shadow-premium hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 bg-primary text-white border-0 w-full sm:w-auto font-bold group" 
                onClick={() => navigate("/shop/listing")}
              >
                Shop Now
                <ChevronRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="text-base px-8 py-7 rounded-xl border-slate-200 text-slate-800 bg-white/50 backdrop-blur-md hover:bg-white hover:text-primary transition-all duration-500 w-full sm:w-auto font-bold" 
                onClick={() => navigate("/shop/services")}
              >
                Our Services
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 w-full border-t border-slate-100">
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">10k+</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Products</p>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">24/7</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Support</p>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">100%</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Genuine</p>
              </div>
            </div>
          </div>

          <div className="relative group lg:block hidden max-w-md ml-auto text-center">
            <div className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-[50px] transition-all duration-700 -z-10 translate-y-6 translate-x-6"></div>
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/50 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
              <img 
                src="/hero-industrial.png" 
                alt="Maruti Traders Premium Electronics" 
                className="w-full h-auto object-cover aspect-[4/5] object-center transition-all duration-1000"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/75 via-slate-900/30 to-transparent p-8 pt-16">
                <p className="text-white text-base font-medium italic leading-relaxed">
                  "Excellence in every electrical connection we power."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Maruti Advantage Section */}
      <section className="section-spacing bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: "Genuine Quality", desc: "100% original products sourced directly from manufacturers." },
              { icon: Zap, title: "Rapid Fulfillment", desc: "Swift processing and delivery for all industrial orders." },
              { icon: HeadphonesIcon, title: "Expert Support", desc: "Direct technical assistance for electronics configuration." },
              { icon: Truck, title: "Pan-India Shipping", desc: "Reliable logistics partners for safe transit of delicate parts." }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-8 rounded-3xl hover:bg-slate-50 transition-colors duration-500">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Section with Visual Depth */}
      <section className="section-spacing bg-slate-50/50">

        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Our Specialties
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl">
              From microscopic components to heavy-duty industrial systems, we cover every engineering vertical.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {
              categoriesWithIcon.map((item, index) => {
                return (
                  <Card className="hover-lift cursor-pointer border-0 bg-white shadow-premium overflow-hidden group rounded-[2.5rem]" key={index} onClick={() => handleNavigatetoListingPage(item, "category")} >
                    <CardContent className="flex flex-col items-center justify-center p-12 relative h-full">
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                      <div className="w-20 h-20 rounded-full bg-slate-50 group-hover:bg-primary group-hover:text-white flex items-center justify-center mb-6 transition-all duration-700 shadow-inner">
                        <item.icon className="w-10 h-10 transition-transform duration-700 group-hover:rotate-12" />
                      </div>
                      <span className="font-bold text-xl text-slate-800 group-hover:text-primary transition-colors text-center">{item.label}</span>
                    </CardContent>
                  </Card>
                )
              })
            }
          </div>
        </div>

      </section>

      {/* Featured Products Section */}
      <section className="section-spacing bg-white">

        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 px-4">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Featured Innovation
              </h2>
              <p className="text-lg text-slate-500 max-w-lg">Hand-picked components that are currently shaping the industry.</p>
            </div>
            <Button 
              variant="link" 
              className="text-primary hover:text-primary/80 font-bold text-lg group mt-6 md:mt-0" 
              onClick={() => navigate("/shop/listing")}
            >
              See the full collection 
              <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
            {
              productList && productList.length > 0 ?
                (
                  productList.slice(0, 4).map((productItem, index) => {
                    return (
                      <div key={productItem.id || index} className="hover-lift h-full p-2">
                        <ShoppingProductTile
                          product={productItem}
                          handleGetProductDetails={handleGetProductDetails}
                          handleAddToCart={handleAddToCart}
                        />
                      </div>
                    )
                  }))
                :
                <div className="col-span-full py-24 text-center glass rounded-3xl border-slate-100 flex flex-col items-center">
                  <Package className="w-20 h-20 text-slate-200 mb-6" />
                  <h3 className="text-2xl font-bold text-slate-400">
                    Our inventory is reaching your screen shortly.
                  </h3>
                </div>
            }
          </div>
        </div>

      </section>

      <ProductDetailsModal
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        handleAddToCart={handleAddToCart}
        productDetails={productDetails}
      />

    </div>
  )
}
