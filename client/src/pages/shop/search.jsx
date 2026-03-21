import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { searchProducts, setSearchQuery } from "@/store/shop/search-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ShoppingCart, AlertCircle, ArrowLeft } from "lucide-react";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { searchResults, isLoading, exactMatch, suggestions, message } = useSelector(
    (state) => state.shopSearch
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (query) {
      dispatch(setSearchQuery(query));
      dispatch(searchProducts(query));
    }
  }, [query, dispatch]);

  const handleAddToCart = async (product) => {
    if (!user?.id) {
      toast({
        title: "Please login",
        description: "You need to login to add items to cart",
        variant: "destructive",
      });
      navigate("/auth/login");
      return;
    }

    try {
      await dispatch(
        addToCart({
          userId: user.id,
          productId: product._id,
          quantity: 1,
        })
      ).unwrap();
      
      dispatch(fetchCartItems(user.id));
      
      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/shop/listing?productId=${productId}`);
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(`/shop/search?q=${encodeURIComponent(suggestion)}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Search className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-800">
            Search Results for "{query}"
          </h1>
        </div>

        <p className="text-gray-600">{message}</p>

        {/* Fuzzy match notification */}
        {!exactMatch && searchResults.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-yellow-800 font-medium">
                No exact matches found. Showing similar products:
              </p>
              {suggestions.length > 0 && (
                <div className="mt-2">
                  <span className="text-yellow-700 text-sm">Did you mean: </span>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-blue-600 hover:text-blue-800 text-sm underline mr-2"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* No Results */}
      {searchResults.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No products found
          </h2>
          <p className="text-gray-500 mb-6">
            We couldn't find any products matching "{query}"
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/shop/listing")} variant="outline">
              Browse All Products
            </Button>
            <Button onClick={() => navigate("/shop/home")}>
              Go to Homepage
            </Button>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {searchResults.map((product) => (
            <Card
              key={product._id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div
                className="relative h-48 overflow-hidden bg-gray-100"
                onClick={() => handleProductClick(product._id)}
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.salePrice > 0 && product.salePrice < product.price && (
                  <Badge className="absolute top-2 left-2 bg-red-500">
                    Sale
                  </Badge>
                )}
                {product.totalStock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3
                  className="font-semibold text-gray-800 mb-1 truncate hover:text-primary cursor-pointer"
                  onClick={() => handleProductClick(product._id)}
                >
                  {product.title}
                </h3>

                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                  {product.brand && (
                    <Badge variant="outline" className="text-xs">
                      {product.brand}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {product.salePrice > 0 && product.salePrice < product.price ? (
                      <>
                        <span className="text-lg font-bold text-primary">
                          ${product.salePrice}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          ${product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-primary">
                        ${product.price}
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={product.totalStock === 0}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
