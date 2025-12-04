import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ShoppingCart, ZoomIn } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export default function HierarchicalProductExplorer({ product, onAddToCart }) {
  const [currentLevel, setCurrentLevel] = useState({
    product,
    part: null,
    breadcrumb: [{ name: product.title, data: product }]
  });
  const [hoveredPart, setHoveredPart] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  // Get current displayable data
  const getCurrentData = () => {
    if (currentLevel.part) {
      return currentLevel.part;
    }
    return currentLevel.product;
  };

  const currentData = getCurrentData();
  const visibleParts = currentData.subparts || currentData.parts || [];

  // Draw hotspot lines on canvas overlay
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const img = imageRef.current;

    canvas.width = img.offsetWidth;
    canvas.height = img.offsetHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    visibleParts.forEach((part) => {
      if (part.xPercent === undefined || part.yPercent === undefined) return;

      const x = (part.xPercent / 100) * canvas.width;
      const y = (part.yPercent / 100) * canvas.height;

      // Draw circle for hotspot
      if (hoveredPart === part._id || hoveredPart === part.nodeName) {
        // Highlighted hotspot
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.stroke();

        // Draw line to text
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 15, y);
        ctx.lineTo(x + 60, y - 30);
        ctx.stroke();
      } else {
        // Normal hotspot
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }, [hoveredPart, visibleParts, imageRef]);

  const handlePartClick = (part) => {
    // Always allow drilling down to see details, even if no subparts
    setCurrentLevel({
      product: currentLevel.product,
      part: part,
      breadcrumb: [
        ...currentLevel.breadcrumb,
        { name: part.name, data: part }
      ]
    });
    setQuantity(1);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === 0) {
      setCurrentLevel({
        product: currentLevel.product,
        part: null,
        breadcrumb: [{ name: currentLevel.product.title, data: currentLevel.product }]
      });
    } else {
      const newBreadcrumb = currentLevel.breadcrumb.slice(0, index + 1);
      setCurrentLevel({
        product: currentLevel.product,
        part: newBreadcrumb[newBreadcrumb.length - 1].data,
        breadcrumb: newBreadcrumb
      });
    }
    setQuantity(1);
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      productId: currentLevel.product._id,
      partId: currentLevel.part ? currentLevel.part._id : null,
      quantity: quantity,
      title: currentData.name || currentData.title,
      price: currentData.salePrice || currentData.price,
      image: currentData.partImage || currentData.image,
      breadcrumb: currentLevel.breadcrumb
    };
    onAddToCart(itemToAdd);
  };

  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        {currentLevel.breadcrumb.map((item, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-gray-400">/</span>}
            <button
              onClick={() => handleBreadcrumbClick(idx)}
              className={`font-medium hover:text-primary transition ${idx === currentLevel.breadcrumb.length - 1
                  ? 'text-primary font-bold'
                  : 'text-gray-600 hover:underline'
                }`}
            >
              {item.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section - 50% width on large screens */}
        <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 relative h-[500px] lg:h-[600px]">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              ref={imageRef}
              src={currentData.partImage || currentData.image}
              alt={currentData.name || currentData.title}
              className="max-w-full max-h-full object-contain"
            />
            {/* Canvas overlay for hotspot lines */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 cursor-pointer"
              onMouseMove={(e) => {
                if (!canvasRef.current) return;
                const rect = canvasRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                let foundPart = null;
                visibleParts.forEach((part) => {
                  if (part.xPercent !== undefined && part.yPercent !== undefined) {
                    const px = (part.xPercent / 100) * canvasRef.current.width;
                    const py = (part.yPercent / 100) * canvasRef.current.height;
                    const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
                    if (distance < 20) {
                      foundPart = part._id || part.nodeName;
                    }
                  }
                });
                setHoveredPart(foundPart);
              }}
              onMouseLeave={() => setHoveredPart(null)}
              onClick={(e) => {
                if (!canvasRef.current) return;
                const rect = canvasRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                visibleParts.forEach((part) => {
                  if (part.xPercent !== undefined && part.yPercent !== undefined) {
                    const px = (part.xPercent / 100) * canvasRef.current.width;
                    const py = (part.yPercent / 100) * canvasRef.current.height;
                    const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
                    if (distance < 20) {
                      handlePartClick(part);
                    }
                  }
                });
              }}
            />
          </div>
        </div>

        {/* Info Section - 50% width */}
        <div className="space-y-6">
          {/* Title & Pricing */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              {currentData.name || currentData.title}
            </h1>
            {currentLevel.part && (
              <p className="text-gray-600 text-sm mb-2">
                Part of: {currentLevel.breadcrumb.slice(0, -1).map(b => b.name).join(' > ')}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-primary">
            ${currentData.salePrice && currentData.salePrice > 0
              ? currentData.salePrice
              : currentData.price}
          </div>

          {/* Stock Quantity (Admin Only Info) */}
          {currentData.quantity && (
            <div className="text-sm text-gray-600">
              Available: <span className="font-semibold">{currentData.quantity} units</span>
            </div>
          )}

          {/* Description */}
          {currentData.description && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {currentData.description}
              </p>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Quantity</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-3 py-2 border rounded text-center"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} />
            Add to Cart
          </Button>

          {/* Subparts List */}
          {visibleParts.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-semibold text-lg">
                {currentLevel.part ? 'Sub-parts' : 'Main Parts'}
              </h3>
              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                {visibleParts.map((part) => (
                  <Card
                    key={part._id || part.nodeName}
                    className={`cursor-pointer transition hover:shadow-md ${hoveredPart === part._id || hoveredPart === part.nodeName
                        ? 'ring-2 ring-primary'
                        : ''
                      }`}
                    onClick={() => handlePartClick(part)}
                    onMouseEnter={() => setHoveredPart(part._id || part.nodeName)}
                    onMouseLeave={() => setHoveredPart(null)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{part.name}</h4>
                          {part.nodeName && (
                            <p className="text-xs text-gray-600">ID: {part.nodeName}</p>
                          )}
                          {part.description && (
                            <p className="text-xs text-gray-600 mt-1">{part.description}</p>
                          )}
                        </div>
                        <div className="text-right ml-2">
                          {part.price > 0 && (
                            <p className="font-semibold text-sm">${part.price}</p>
                          )}
                          {part.subparts && part.subparts.length > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {part.subparts.length} parts
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
