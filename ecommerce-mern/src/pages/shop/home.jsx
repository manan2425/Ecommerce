import { Button } from "@/components/ui/button";
import img1 from "../../assets/banner-1.webp";
import img2 from "../../assets/banner-2.webp";
import img3 from "../../assets/banner-3.webp";
import { BabyIcon, BookHeart, ChevronLeftIcon, ChevronRightIcon, FootprintsIcon, ShirtIcon, WatchIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import ShoppingProductTile from "../../components/shop/productTile";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { addToCart } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import ProductDetailsModal from "@/components/shop/product-details";

// For Categories
const categoriesWithIcon = [
  { id: "men", label: "Men", icon: ShirtIcon },
  { id: "women", label: "Women", icon: BookHeart },
  { id: "kids", label: "Kids", icon: BabyIcon },
  { id: "accessories", label: "Accessories", icon: WatchIcon },
  { id: "footwear", label: "Footwear", icon: FootprintsIcon }
];

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

  const slides = [img1, img2, img3];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();



  // Get User
  const { user } = useSelector((state) => state.auth);
  const { productDetails } = useSelector(state => state.shopProducts);



  // Products Data
  const { productList } = useSelector(state => state.shopProducts)

  // For Slides
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto Timer for Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prevSlide => (prevSlide + 1) % slides.length)
    }, 5000);

    return () => clearInterval(timer);

  }, [slides.length]);



  // Get Data By Id
  const handleGetProductDetails = async (id) => {
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
  const handleAddToCart = async (productId, selectedPart = null) => {
    try {
      console.log("Cart Products Id :  ", productId);
      const response = await dispatch(addToCart({ userId: user?.id, productId, quantity: 1, selectedPart }));
      console.log("Add to Cart Response : ", response);
      if (response?.payload?.success) {
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
    <div className="flex flex-col min-h-screen">

      {/* Carousel */}
      <div className="relative w-full h-[600px] overflow-hidden">
        {
          slides.map((slide, index) => {
            return (
              <img src={slide} alt="" key={index}
                className={`${index === currentSlide ? "opacity-100" : "opacity-0"}  absolute top-0 left-0 w-full h-full lg:object-cover md:object-cover  object-cover transition-opacity duration-[1000]`}
              />
            )
          })
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12 pb-24">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">Welcome to E-Commerce</h1>
          <p className="text-xl text-white mb-8 drop-shadow-md max-w-lg">Discover the latest trends in fashion, accessories, and more. Shop now and elevate your style.</p>
          <Button className="w-fit text-lg px-8 py-6 rounded-full shadow-xl hover:scale-105 transition-transform" onClick={() => navigate("/shop/listing")}>
            Shop Now
          </Button>
        </div>

        <Button variant="outline" className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 border-none text-white" size="icon" onClick={() => {
          setCurrentSlide(prevSlide => (prevSlide - 1 + slides.length) % slides.length)
        }}>
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>

        <Button variant="outline" className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 border-none text-white" size="icon" onClick={() => {
          setCurrentSlide(prevSlide => (prevSlide + 1) % slides.length);
        }}>
          <ChevronRightIcon className="w-6 h-6" />
        </Button>

      </div>

      {/* Section */}
      <section className="py-16 bg-gray-50">

        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-12 text-gray-800">
            Shop By Category
          </h2>

          <div className=" grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 ">
            {
              categoriesWithIcon.map((item, index) => {
                return (
                  <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-none bg-white overflow-hidden group" key={index} onClick={() => handleNavigatetoListingPage(item, "category")} >
                    <CardContent className="flex flex-col items-center justify-center p-8 group-hover:bg-primary/5 transition-colors">
                      {
                        <>
                          <item.icon className="w-14 h-14 mb-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                          <span className="font-bold text-lg text-gray-700 group-hover:text-primary transition-colors">{item.label}</span>
                        </>
                      }
                    </CardContent>
                  </Card>
                )
              })
            }
          </div>
        </div>

      </section>

      {/* Fetch AllProducts */}
      <section className="py-12">

        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Feature Products
          </h2>
          <div className="px-5  grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {
              productList && productList.length > 0 ?
                (
                  productList.slice(0, 4).map((productItem, index) => {
                    return (
                      <>
                        <ShoppingProductTile
                          product={productItem}
                          key={index}
                          handleGetProductDetails={handleGetProductDetails}
                          handleAddToCart={handleAddToCart}
                        />
                      </>
                    )
                  }))
                :
                <h3>
                  No Products Present Currently
                </h3>
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
