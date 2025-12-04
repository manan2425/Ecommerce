/* eslint react/prop-types: 0 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Home, ZoomIn, Info, ShoppingCart, X, ExternalLink } from 'lucide-react';

/**
 * Visual Parts Viewer - User-facing component to explore product parts visually
 * Users can click on hotspots to view part details and drill down into subparts
 */
export default function VisualPartsViewer({ open, onClose, productDetails, handleAddToCart }) {
    const navigate = useNavigate();
    
    // Navigation path for drill-down (array of { part, index })
    const [navPath, setNavPath] = useState([]);
    // Currently selected part for details panel
    const [selectedPart, setSelectedPart] = useState(null);
    // Part details modal
    const [showPartDetails, setShowPartDetails] = useState(false);
    // Quantity for add to cart
    const [quantity, setQuantity] = useState(1);

    // Reset state when product changes or dialog opens
    useEffect(() => {
        if (open) {
            setNavPath([]);
            setSelectedPart(null);
            setShowPartDetails(false);
            setQuantity(1);
        }
    }, [open, productDetails?._id]);

    if (!productDetails) return null;

    // Get current level parts based on navigation path
    const getCurrentParts = () => {
        if (navPath.length === 0) {
            return productDetails.parts || [];
        }
        let current = productDetails.parts || [];
        for (const nav of navPath) {
            if (current[nav.index]) {
                current = current[nav.index].subparts || [];
            } else {
                return [];
            }
        }
        return current;
    };

    // Get current image (product image or part image)
    const getCurrentImage = () => {
        if (navPath.length === 0) {
            return productDetails.image;
        }
        let current = productDetails.parts || [];
        let lastPartWithImage = null;
        for (const nav of navPath) {
            if (current[nav.index]) {
                const part = current[nav.index];
                const partImg = part.partImage || part.image;
                if (partImg) {
                    lastPartWithImage = partImg;
                }
                current = part.subparts || [];
            }
        }
        return lastPartWithImage || productDetails.image;
    };

    // Get current title
    const getCurrentTitle = () => {
        if (navPath.length === 0) {
            return productDetails.title;
        }
        const lastNav = navPath[navPath.length - 1];
        return lastNav.part?.name || productDetails.title;
    };

    // Handle hotspot click
    const handleHotspotClick = (part, index) => {
        setSelectedPart(part);
        setShowPartDetails(true);
    };

    // Drill down into a part's subparts
    const handleDrillDown = (part, index) => {
        const partImg = part.partImage || part.image;
        if ((part.subparts && part.subparts.length > 0) || partImg) {
            setNavPath(prev => [...prev, { part, index }]);
            setSelectedPart(null);
            setShowPartDetails(false);
        }
    };

    // Navigate back one level
    const handleGoBack = () => {
        setNavPath(prev => prev.slice(0, -1));
        setSelectedPart(null);
        setShowPartDetails(false);
    };

    // Navigate to home (product level)
    const handleGoHome = () => {
        setNavPath([]);
        setSelectedPart(null);
        setShowPartDetails(false);
    };

    // Add part to cart
    const handleAddPartToCart = () => {
        if (selectedPart && handleAddToCart) {
            handleAddToCart(productDetails._id, selectedPart, quantity);
            setShowPartDetails(false);
            setQuantity(1);
        }
    };

    const currentParts = getCurrentParts();
    const currentImage = getCurrentImage();
    const currentTitle = getCurrentTitle();

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] p-0 overflow-hidden bg-gray-900">
                <DialogTitle className="sr-only">Visual Parts Viewer</DialogTitle>
                <DialogDescription className="sr-only">
                    Explore product parts visually by clicking on hotspots
                </DialogDescription>

                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                        <div className="flex items-center gap-3">
                            {/* Navigation buttons */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleGoHome}
                                disabled={navPath.length === 0}
                                className="text-white hover:bg-gray-700"
                            >
                                <Home className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleGoBack}
                                disabled={navPath.length === 0}
                                className="text-white hover:bg-gray-700"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Back
                            </Button>

                            {/* Breadcrumb */}
                            <div className="flex items-center gap-1 text-sm text-gray-400 ml-2">
                                <span 
                                    className="cursor-pointer hover:text-white transition-colors"
                                    onClick={handleGoHome}
                                >
                                    {productDetails.title}
                                </span>
                                {navPath.map((nav, idx) => (
                                    <React.Fragment key={idx}>
                                        <ChevronRight className="w-3 h-3" />
                                        <span 
                                            className="cursor-pointer hover:text-white transition-colors"
                                            onClick={() => setNavPath(prev => prev.slice(0, idx + 1))}
                                        >
                                            {nav.part?.name || `Part ${idx + 1}`}
                                        </span>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-white hover:bg-gray-700"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Main content */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Image area with hotspots */}
                        <div className="flex-1 relative flex items-center justify-center bg-gray-900 p-4">
                            <div className="relative inline-block">
                                <img
                                    src={currentImage}
                                    alt={currentTitle}
                                    className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
                                    style={{ minWidth: '400px' }}
                                />

                                {/* Hotspots */}
                                {currentParts.map((part, idx) => {
                                    const x = part.xPercent ?? part.x;
                                    const y = part.yPercent ?? part.y;
                                    if (x === undefined || y === undefined) return null;

                                    const hasSubparts = part.subparts && part.subparts.length > 0;
                                    const hasImage = part.partImage || part.image;
                                    const canDrillDown = hasSubparts || hasImage;

                                    return (
                                        <div
                                            key={idx}
                                            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                                            style={{ left: `${x}%`, top: `${y}%` }}
                                        >
                                            {/* Hotspot button */}
                                            <button
                                                onClick={() => handleHotspotClick(part, idx)}
                                                className={`
                                                    relative w-8 h-8 rounded-full border-2 border-white shadow-lg
                                                    transition-all duration-200 hover:scale-125
                                                    flex items-center justify-center text-white font-bold text-sm
                                                    ${canDrillDown 
                                                        ? 'bg-purple-600 hover:bg-purple-500' 
                                                        : 'bg-blue-600 hover:bg-blue-500'}
                                                    ${selectedPart === part ? 'ring-4 ring-yellow-400 scale-125' : ''}
                                                `}
                                            >
                                                {canDrillDown ? <ZoomIn className="w-4 h-4" /> : <Info className="w-3 h-3" />}
                                            </button>

                                            {/* Tooltip */}
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                                <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                                    {part.name || `Part ${idx + 1}`}
                                                    {part.price > 0 && ` - $${part.price}`}
                                                </div>
                                            </div>

                                            {/* Pulse animation ring */}
                                            <div className={`
                                                absolute inset-0 rounded-full animate-ping opacity-30
                                                ${canDrillDown ? 'bg-purple-400' : 'bg-blue-400'}
                                            `} />
                                        </div>
                                    );
                                })}

                                {/* No parts message */}
                                {currentParts.length === 0 && navPath.length > 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-black/50 text-white px-6 py-3 rounded-lg">
                                            No sub-parts defined for this component
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Legend */}
                            <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 rounded-full bg-purple-600 border border-white flex items-center justify-center">
                                        <ZoomIn className="w-2 h-2" />
                                    </div>
                                    <span>Has subparts</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 rounded-full bg-blue-600 border border-white flex items-center justify-center">
                                        <Info className="w-2 h-2" />
                                    </div>
                                    <span>Part info</span>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600/90 text-white text-sm px-4 py-2 rounded-lg">
                                Click on hotspots to view part details
                            </div>
                        </div>

                        {/* Parts list sidebar */}
                        <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
                            <div className="p-4">
                                <h3 className="text-white font-semibold mb-3">
                                    {navPath.length === 0 ? 'Product Parts' : `${currentTitle} - Components`}
                                </h3>

                                {currentParts.length === 0 ? (
                                    <p className="text-gray-400 text-sm">No parts available</p>
                                ) : (
                                    <div className="space-y-2">
                                        {currentParts.map((part, idx) => {
                                            const hasSubparts = part.subparts && part.subparts.length > 0;
                                            const hasImage = part.partImage || part.image;
                                            const canDrillDown = hasSubparts || hasImage;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`
                                                        p-3 rounded-lg cursor-pointer transition-all
                                                        ${selectedPart === part 
                                                            ? 'bg-blue-600/30 border border-blue-500' 
                                                            : 'bg-gray-700/50 hover:bg-gray-700 border border-transparent'}
                                                    `}
                                                    onClick={() => handleHotspotClick(part, idx)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {/* Thumbnail */}
                                                        {part.thumbnail && (
                                                            <img
                                                                src={part.thumbnail}
                                                                alt={part.name}
                                                                className="w-12 h-12 object-cover rounded border border-gray-600"
                                                            />
                                                        )}

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-white font-medium truncate">
                                                                    {part.name || `Part ${idx + 1}`}
                                                                </span>
                                                                {canDrillDown && (
                                                                    <ZoomIn className="w-3 h-3 text-purple-400 flex-shrink-0" />
                                                                )}
                                                            </div>
                                                            {part.nodeName && (
                                                                <div className="text-gray-500 text-xs">
                                                                    ID: {part.nodeName}
                                                                </div>
                                                            )}
                                                            {part.price > 0 && (
                                                                <div className="text-green-400 font-semibold text-sm mt-1">
                                                                    ${part.price}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Part Details Modal */}
                {showPartDetails && selectedPart && (
                    <div 
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]"
                        onClick={() => setShowPartDetails(false)}
                    >
                        <div 
                            className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Part image */}
                            {(selectedPart.partImage || selectedPart.image || selectedPart.thumbnail) && (
                                <div className="relative h-48 bg-gray-100">
                                    <img
                                        src={selectedPart.partImage || selectedPart.image || selectedPart.thumbnail}
                                        alt={selectedPart.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}

                            {/* Part info */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {selectedPart.name || 'Part Details'}
                                        </h2>
                                        {selectedPart.nodeName && (
                                            <p className="text-gray-500 text-sm">
                                                Part ID: {selectedPart.nodeName}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setShowPartDetails(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {selectedPart.description && (
                                    <p className="text-gray-600 mb-4">
                                        {selectedPart.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between mb-4">
                                    {selectedPart.price > 0 && (
                                        <div className="text-3xl font-bold text-green-600">
                                            ${selectedPart.price}
                                        </div>
                                    )}
                                    {selectedPart.quantity > 0 && (
                                        <div className="text-sm text-gray-500">
                                            Stock: {selectedPart.quantity} available
                                        </div>
                                    )}
                                </div>

                                {/* Quantity selector */}
                                {selectedPart.price > 0 && (
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-gray-600 font-medium">Quantity:</span>
                                        <div className="flex items-center border rounded-lg">
                                            <button
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                className="px-3 py-1 hover:bg-gray-100"
                                            >
                                                -
                                            </button>
                                            <span className="px-4 py-1 border-x">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(q => q + 1)}
                                                className="px-3 py-1 hover:bg-gray-100"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="text-gray-600">
                                            Total: <span className="font-bold text-green-600">
                                                ${(selectedPart.price * quantity).toFixed(2)}
                                            </span>
                                        </span>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-3">
                                    {/* Drill down button */}
                                    {((selectedPart.subparts && selectedPart.subparts.length > 0) || 
                                      selectedPart.partImage || selectedPart.image) && (
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                const idx = currentParts.findIndex(p => p === selectedPart);
                                                handleDrillDown(selectedPart, idx);
                                            }}
                                        >
                                            <ZoomIn className="w-4 h-4 mr-2" />
                                            View Inside
                                        </Button>
                                    )}

                                    {/* Add to cart button */}
                                    {selectedPart.price > 0 && handleAddToCart && (
                                        <Button
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            onClick={handleAddPartToCart}
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            Add to Cart
                                        </Button>
                                    )}
                                </div>

                                {/* View Full Page button */}
                                <Button
                                    variant="outline"
                                    className="w-full mt-3"
                                    onClick={() => {
                                        const idx = currentParts.findIndex(p => p === selectedPart);
                                        const pathIndices = [...navPath.map(n => n.index), idx];
                                        const partPath = pathIndices.join(',');
                                        onClose();
                                        navigate(`/shop/product/${productDetails._id}/part/${partPath}`);
                                    }}
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Full Page
                                </Button>

                                {/* Subparts preview */}
                                {selectedPart.subparts && selectedPart.subparts.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <h4 className="text-sm font-semibold text-gray-600 mb-2">
                                            Contains {selectedPart.subparts.length} sub-component(s):
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPart.subparts.slice(0, 5).map((sub, idx) => (
                                                <span 
                                                    key={idx}
                                                    className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600"
                                                >
                                                    {sub.name || `Sub-part ${idx + 1}`}
                                                </span>
                                            ))}
                                            {selectedPart.subparts.length > 5 && (
                                                <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-500">
                                                    +{selectedPart.subparts.length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
