import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails } from '@/store/shop/products-slice';
import { addToCart, fetchCartItems } from '@/store/shop/cart-slice';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
    ChevronLeft, 
    ChevronRight, 
    Home, 
    ZoomIn, 
    Info, 
    ShoppingCart, 
    ArrowLeft,
    Package
} from 'lucide-react';

/**
 * Part Details Page - Dedicated page for viewing product parts and subparts
 * URL format: /shop/product/:productId/part/:partPath
 * partPath is a comma-separated list of part indices (e.g., "0,2,1" for parts[0].subparts[2].subparts[1])
 */
export default function PartDetailsPage() {
    const { productId, partPath } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { toast } = useToast();

    const { productDetails, isLoading } = useSelector(state => state.shopProducts);
    const { user, isAuthenticated } = useSelector(state => state.auth);

    const [quantity, setQuantity] = useState(1);
    const [selectedPart, setSelectedPart] = useState(null);

    // Fetch product details on mount
    useEffect(() => {
        if (productId) {
            dispatch(fetchProductDetails(productId));
        }
    }, [productId, dispatch]);

    // Parse the part path to get the navigation indices
    const getPathIndices = () => {
        if (!partPath) return [];
        return partPath.split(',').map(i => parseInt(i, 10)).filter(i => !isNaN(i));
    };

    // Get the current part based on the path
    const getCurrentPart = () => {
        if (!productDetails?.parts) return null;
        
        const indices = getPathIndices();
        if (indices.length === 0) return null;

        let current = productDetails.parts;
        let part = null;

        for (let i = 0; i < indices.length; i++) {
            const idx = indices[i];
            if (!current || !current[idx]) return null;
            part = current[idx];
            current = part.subparts || [];
        }

        return part;
    };

    // Get the parent part (for breadcrumb)
    const getParentPart = () => {
        if (!productDetails?.parts) return null;
        
        const indices = getPathIndices();
        if (indices.length <= 1) return null;

        let current = productDetails.parts;
        let part = null;

        for (let i = 0; i < indices.length - 1; i++) {
            const idx = indices[i];
            if (!current || !current[idx]) return null;
            part = current[idx];
            current = part.subparts || [];
        }

        return part;
    };

    // Get current level parts (subparts of current part)
    const getCurrentSubparts = () => {
        const part = getCurrentPart();
        return part?.subparts || [];
    };

    // Get breadcrumb items
    const getBreadcrumbs = () => {
        if (!productDetails?.parts) return [];
        
        const indices = getPathIndices();
        const crumbs = [];
        let current = productDetails.parts;

        for (let i = 0; i < indices.length; i++) {
            const idx = indices[i];
            if (!current || !current[idx]) break;
            const part = current[idx];
            crumbs.push({
                name: part.name || `Part ${idx + 1}`,
                path: indices.slice(0, i + 1).join(',')
            });
            current = part.subparts || [];
        }

        return crumbs;
    };

    // Get current image
    const getCurrentImage = () => {
        const part = getCurrentPart();
        if (part) {
            return part.partImage || part.image || part.thumbnail || productDetails?.image;
        }
        return productDetails?.image;
    };

    // Navigate to a subpart
    const handleNavigateToSubpart = (subpartIndex) => {
        const currentPath = partPath || '';
        const newPath = currentPath ? `${currentPath},${subpartIndex}` : `${subpartIndex}`;
        navigate(`/shop/product/${productId}/part/${newPath}`);
    };

    // Navigate back
    const handleGoBack = () => {
        const indices = getPathIndices();
        if (indices.length <= 1) {
            // Go back to product
            navigate(`/shop/listing`);
        } else {
            // Go to parent part
            const parentPath = indices.slice(0, -1).join(',');
            navigate(`/shop/product/${productId}/part/${parentPath}`);
        }
    };

    // Navigate to product
    const handleGoToProduct = () => {
        navigate(`/shop/listing`);
    };

    // Add to cart
    const handleAddToCart = () => {
        if (!isAuthenticated) {
            toast({
                title: "Please login to add items to cart",
                variant: "destructive"
            });
            return;
        }

        const part = getCurrentPart();
        if (!part) return;

        dispatch(addToCart({
            userId: user._id,
            productId: productId,
            quantity: quantity,
            partId: part._id,
            partName: part.name,
            partPrice: part.price
        })).then(data => {
            if (data?.payload?.success) {
                dispatch(fetchCartItems(user._id));
                toast({
                    title: `${part.name} added to cart`
                });
            } else {
                toast({
                    title: "Failed to add to cart",
                    variant: "destructive"
                });
            }
        });
    };

    const currentPart = getCurrentPart();
    const currentSubparts = getCurrentSubparts();
    const breadcrumbs = getBreadcrumbs();
    const currentImage = getCurrentImage();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!productDetails) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
                <Package className="w-16 h-16 mb-4 text-gray-500" />
                <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
                <Button onClick={() => navigate('/shop/listing')}>
                    Back to Shop
                </Button>
            </div>
        );
    }

    if (!currentPart) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
                <Package className="w-16 h-16 mb-4 text-gray-500" />
                <h2 className="text-2xl font-bold mb-2">Part Not Found</h2>
                <p className="text-gray-400 mb-4">The requested part could not be found.</p>
                <Button onClick={() => navigate('/shop/listing')}>
                    Back to Shop
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Navigation buttons */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleGoToProduct}
                            className="text-white hover:bg-gray-700"
                        >
                            <Home className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleGoBack}
                            className="text-white hover:bg-gray-700"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back
                        </Button>

                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1 text-sm text-gray-400 ml-2">
                            <span 
                                className="cursor-pointer hover:text-white transition-colors"
                                onClick={handleGoToProduct}
                            >
                                {productDetails.title}
                            </span>
                            {breadcrumbs.map((crumb, idx) => (
                                <React.Fragment key={idx}>
                                    <ChevronRight className="w-3 h-3" />
                                    <span 
                                        className={`cursor-pointer transition-colors ${idx === breadcrumbs.length - 1 ? 'text-white font-medium' : 'hover:text-white'}`}
                                        onClick={() => navigate(`/shop/product/${productId}/part/${crumb.path}`)}
                                    >
                                        {crumb.name}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image section */}
                    <div className="relative">
                        <div className="bg-gray-800 rounded-xl p-4 relative">
                            <img
                                src={currentImage}
                                alt={currentPart.name}
                                className="w-full h-auto max-h-[500px] object-contain rounded-lg"
                            />

                            {/* Hotspots for subparts */}
                            {currentSubparts.map((subpart, idx) => {
                                const x = subpart.xPercent ?? subpart.x;
                                const y = subpart.yPercent ?? subpart.y;
                                if (x === undefined || y === undefined) return null;

                                const hasSubparts = subpart.subparts && subpart.subparts.length > 0;
                                const hasImage = subpart.partImage || subpart.image;
                                const canDrillDown = hasSubparts || hasImage;

                                return (
                                    <div
                                        key={idx}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                                        style={{ left: `${x}%`, top: `${y}%` }}
                                        onClick={() => handleNavigateToSubpart(idx)}
                                    >
                                        <button
                                            className={`
                                                relative w-10 h-10 rounded-full border-2 border-white shadow-lg
                                                transition-all duration-200 hover:scale-125
                                                flex items-center justify-center text-white font-bold
                                                ${canDrillDown ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'}
                                            `}
                                        >
                                            {canDrillDown ? <ZoomIn className="w-5 h-5" /> : <Info className="w-4 h-4" />}
                                        </button>

                                        {/* Tooltip */}
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                            <div className="bg-black/90 text-white text-sm px-3 py-2 rounded whitespace-nowrap">
                                                {subpart.name || `Sub-part ${idx + 1}`}
                                                {subpart.price > 0 && <span className="text-green-400 ml-2">${subpart.price}</span>}
                                            </div>
                                        </div>

                                        {/* Pulse */}
                                        <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${canDrillDown ? 'bg-purple-400' : 'bg-blue-400'}`} />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        {currentSubparts.length > 0 && (
                            <div className="mt-4 bg-gray-800 rounded-lg px-4 py-3 flex items-center gap-6 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center">
                                        <ZoomIn className="w-3 h-3 text-white" />
                                    </div>
                                    <span>Click to view inside</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center">
                                        <Info className="w-3 h-3 text-white" />
                                    </div>
                                    <span>Part info</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Details section */}
                    <div className="space-y-6">
                        {/* Part info card */}
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {currentPart.name || 'Part Details'}
                            </h1>
                            {currentPart.nodeName && (
                                <p className="text-gray-500 text-sm mb-4">
                                    Part ID: {currentPart.nodeName}
                                </p>
                            )}

                            {currentPart.description && (
                                <p className="text-gray-300 text-lg mb-6">
                                    {currentPart.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between mb-6">
                                {currentPart.price > 0 && (
                                    <div className="text-4xl font-bold text-green-400">
                                        ${currentPart.price}
                                    </div>
                                )}
                                {currentPart.quantity > 0 && (
                                    <div className="text-gray-400">
                                        <span className="font-medium">{currentPart.quantity}</span> in stock
                                    </div>
                                )}
                            </div>

                            {/* Quantity selector */}
                            {currentPart.price > 0 && (
                                <>
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-gray-400 font-medium">Quantity:</span>
                                        <div className="flex items-center border border-gray-600 rounded-lg">
                                            <button
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                className="px-4 py-2 text-white hover:bg-gray-700 rounded-l-lg transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="px-6 py-2 text-white border-x border-gray-600">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => setQuantity(q => q + 1)}
                                                className="px-4 py-2 text-white hover:bg-gray-700 rounded-r-lg transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="text-xl text-white">
                                            Total: <span className="font-bold text-green-400">
                                                ${(currentPart.price * quantity).toFixed(2)}
                                            </span>
                                        </span>
                                    </div>

                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                                        onClick={handleAddToCart}
                                    >
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        Add to Cart
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Subparts list */}
                        {currentSubparts.length > 0 && (
                            <div className="bg-gray-800 rounded-xl p-6">
                                <h3 className="text-xl font-semibold text-white mb-4">
                                    Sub-Components ({currentSubparts.length})
                                </h3>
                                <div className="space-y-3">
                                    {currentSubparts.map((subpart, idx) => {
                                        const hasSubparts = subpart.subparts && subpart.subparts.length > 0;
                                        const hasImage = subpart.partImage || subpart.image;
                                        const canDrillDown = hasSubparts || hasImage;

                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                                                onClick={() => handleNavigateToSubpart(idx)}
                                            >
                                                {subpart.thumbnail && (
                                                    <img
                                                        src={subpart.thumbnail}
                                                        alt={subpart.name}
                                                        className="w-16 h-16 object-cover rounded-lg border border-gray-600"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium">
                                                            {subpart.name || `Sub-part ${idx + 1}`}
                                                        </span>
                                                        {canDrillDown && (
                                                            <ZoomIn className="w-4 h-4 text-purple-400" />
                                                        )}
                                                    </div>
                                                    {subpart.description && (
                                                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                                            {subpart.description}
                                                        </p>
                                                    )}
                                                </div>
                                                {subpart.price > 0 && (
                                                    <div className="text-green-400 font-bold text-lg">
                                                        ${subpart.price}
                                                    </div>
                                                )}
                                                <ChevronRight className="w-5 h-5 text-gray-500" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
