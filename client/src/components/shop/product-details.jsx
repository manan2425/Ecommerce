/* eslint react/prop-types: 0 */
import React from 'react'
import { Dialog, DialogContent, DialogDescription } from '../ui/dialog'
import Img from "../../assets/ImgIcon.png"
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { StarHalfIcon, StarIcon, MousePointer2, FileText, Check, Eye } from 'lucide-react'
import { Input } from '../ui/input'
import { useDispatch } from 'react-redux'
import { resetProductDetails } from '@/store/shop/products-slice'
import { useSelector } from 'react-redux'
import { addReview, getReviews } from '@/store/shop/review-slice'
import { useToast } from '@/hooks/use-toast'
import VisualPartsViewer from './visual-parts-viewer'
import SecurePdfViewer from './secure-pdf-viewer'
import { logProductView } from '@/lib/activityTracker'


export default function ProductDetailsModal({ open, setOpen, productDetails, handleAddToCart }) {


    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { reviews } = useSelector(state => state.shopReviewSlice);
    const { toast } = useToast();

    const [selectedPart, setSelectedPart] = React.useState(null);
    const [quantity, setQuantity] = React.useState(1);
    const [buyWithProduct, setBuyWithProduct] = React.useState(false);
    const [rating, setRating] = React.useState(0);
    const [reviewMsg, setReviewMsg] = React.useState("");
    const [showVisualViewer, setShowVisualViewer] = React.useState(false);
    const [showPdfViewer, setShowPdfViewer] = React.useState(false);
    
    // Selected options state for variants
    const [selectedOptions, setSelectedOptions] = React.useState({});
    const [selectedVariant, setSelectedVariant] = React.useState(null);

    // Initialize selected options when product changes
    React.useEffect(() => {
        if (productDetails?.options && productDetails.options.length > 0) {
            const initialOptions = {};
            productDetails.options.forEach(opt => {
                if (opt.values && opt.values.length > 0) {
                    initialOptions[opt.name] = opt.values[0]; // Select first value by default
                }
            });
            setSelectedOptions(initialOptions);
        } else {
            setSelectedOptions({});
        }
    }, [productDetails]);

    // Find matching variant when options change
    React.useEffect(() => {
        if (productDetails?.variants && productDetails.variants.length > 0 && Object.keys(selectedOptions).length > 0) {
            const matchingVariant = productDetails.variants.find(variant => {
                const combo = variant.optionCombination;
                return Object.entries(selectedOptions).every(([key, value]) => {
                    // Handle both Map and Object formats
                    if (combo instanceof Map) {
                        return combo.get(key) === value;
                    }
                    return combo[key] === value;
                });
            });
            setSelectedVariant(matchingVariant || null);
        } else {
            setSelectedVariant(null);
        }
    }, [selectedOptions, productDetails]);

    const handleOptionSelect = (optionName, value) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionName]: value
        }));
    };

    function handleRatingChange(getRating) {
        setRating(getRating);
    }

    function handleAddReview() {
        dispatch(addReview({
            productId: productDetails?._id,
            userId: user?._id,
            userName: user?.userName,
            reviewMessage: reviewMsg,
            reviewValue: rating
        })).then((data) => {
            if (data?.payload?.success) {
                setRating(0);
                setReviewMsg("");
                dispatch(getReviews(productDetails?._id));
                toast({
                    title: "Review Added Successfully",
                })
            } else {
                toast({
                    title: data?.payload?.message || "Something went wrong",
                    variant: "destructive"
                })
            }
        })
    }

    React.useEffect(() => {
        if (productDetails !== null) dispatch(getReviews(productDetails?._id));
    }, [productDetails]);

    // Track product view when modal opens
    React.useEffect(() => {
        if (open && productDetails?._id) {
            logProductView(productDetails._id, productDetails.title);
        }
    }, [open, productDetails]);

    // calculate effective price: if variant selected use variant price, else if part selected, use part price; else use product price
    const effectivePrice = React.useMemo(() => {
        let price = 0;
        
        // If variant is selected and has a price, use variant price
        if (selectedVariant && selectedVariant.salePrice > 0) {
            price = Number(selectedVariant.salePrice);
        } else if (selectedVariant && selectedVariant.price > 0) {
            price = Number(selectedVariant.price);
        } else {
            const productPrice = Number(productDetails?.salePrice > 0 ? productDetails.salePrice : productDetails?.price) || 0;

            if (selectedPart) {
                price = Number(selectedPart.price) || 0;
                if (buyWithProduct) {
                    price += productPrice;
                }
            } else {
                price = productPrice;
            }
        }
        return price;
    }, [productDetails, selectedPart, buyWithProduct, selectedVariant]);

    const handleQuantityChange = (type) => {
        if (type === 'plus') {
            setQuantity(prev => prev + 1);
        } else if (type === 'minus' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={(isOpen) => {
                console.log("Open K :", isOpen);
                setOpen(isOpen);
                dispatch(resetProductDetails());
                setSelectedPart(null);
                setQuantity(1);
                setBuyWithProduct(false);
                setSelectedOptions({});
                setSelectedVariant(null);
            }}>
                <DialogContent className="productModal sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw] max-h-[90vh] overflow-y-auto border-0 shadow-2xl rounded-[3rem] bg-mesh">
                    <div className="sr-only">
                        <DialogDescription>Product Details</DialogDescription>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Image */}
                        <div className="rounded-lg">
                            <div className="relative w-full h-[500px] flex items-center justify-center bg-white shadow-premium rounded-[2.5rem] border border-slate-100">
                                <img src={productDetails?.image || Img}
                                    alt={productDetails?.title || "Title"}
                                    className='max-h-[430px] w-auto object-contain'
                                    style={{ maxWidth: '100%' }}
                                    width={600}
                                    height={600} />

                                {/* overlay hotspots if present */}
                                {productDetails?.parts && productDetails.parts.length > 0 && productDetails.parts.map((p, idx) => (
                                    (p.xPercent !== undefined && p.yPercent !== undefined) ? (
                                        <div key={idx} style={{ position: 'absolute', left: `${p.xPercent}%`, top: `${p.yPercent}%`, transform: 'translate(-50%,-50%)' }}>
                                            <button onClick={() => setSelectedPart(p)} title={p.name} className={`w-8 h-8 rounded-full border-2 ${selectedPart === p ? 'bg-primary text-white' : 'bg-white text-primary'}`}>
                                                •
                                            </button>
                                        </div>
                                    ) : null
                                ))}

                                {/* Visual Parts Explorer Button */}
                                {productDetails?.parts && productDetails.parts.length > 0 && (
                                    <Button
                                        onClick={() => setShowVisualViewer(true)}
                                        className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                                        size="sm"
                                    >
                                        <MousePointer2 className="w-4 h-4 mr-2" />
                                        Explore Parts
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Details */}
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                                {productDetails?.title || "Premium Component"}
                            </h1>

                            <div className='my-4 flex items-center gap-2'>
                                <StarIcon className="w-4 h-4 fill-primary" />
                                <StarIcon className="w-4 h-4 fill-primary" />
                                <StarIcon className="w-4 h-4 fill-primary" />
                                <StarIcon className="w-4 h-4 fill-primary" />
                                <StarHalfIcon className="w-4 h-4 fill-primary" />
                                <span className="text-muted-foreground text-sm">
                                    (4.5)
                                </span>
                            </div>

                            <p className="text-muted-foreground mt-4">
                                {productDetails?.description || "Description"}
                            </p>
                            
                            {/* PDF Description - View Only (No Download) */}
                            {productDetails?.descriptionPdf && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm text-blue-700 font-medium">
                                                Detailed Product Specifications (PDF)
                                            </span>
                                        </div>
                                        <Button 
                                            onClick={() => setShowPdfViewer(true)}
                                            size="sm"
                                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View PDF
                                        </Button>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-2">
                                        🔒 Protected document - View only, no download allowed
                                    </p>
                                </div>
                            )}

                            {/* Custom Fields/Specifications */}
                            {productDetails?.customFields && productDetails.customFields.length > 0 && (
                                <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
                                    <h3 className="font-semibold mb-3 text-gray-800">Specifications</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {productDetails.customFields.map((field, idx) => (
                                            <div key={idx} className="flex justify-between items-center py-2 px-3 bg-white rounded border">
                                                <span className="text-sm text-gray-600 font-medium">{field.label}</span>
                                                <span className="text-sm text-gray-900 font-semibold">{field.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Product Options (Color, Size, etc.) */}
                            {productDetails?.options && productDetails.options.length > 0 && (
                                <div className="mt-6 space-y-4">
                                    {productDetails.options.map((option, optIndex) => (
                                        <div key={optIndex}>
                                            <h3 className="font-semibold mb-2 text-gray-800">{option.name}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {option.values.map((value, valIndex) => {
                                                    const isSelected = selectedOptions[option.name] === value;
                                                    // Check if this is a color option
                                                    const isColorOption = option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'colour';
                                                    
                                                    return (
                                                        <button
                                                            key={valIndex}
                                                            onClick={() => handleOptionSelect(option.name, value)}
                                                            className={`
                                                                relative px-4 py-2 rounded-lg border-2 transition-all
                                                                ${isSelected 
                                                                    ? 'border-primary bg-primary/10 text-primary font-semibold' 
                                                                    : 'border-gray-200 hover:border-gray-400'
                                                                }
                                                                ${isColorOption ? 'min-w-[60px]' : ''}
                                                            `}
                                                            style={isColorOption ? {
                                                                backgroundColor: value.toLowerCase(),
                                                                color: ['white', 'yellow', 'beige', 'cream', 'ivory'].includes(value.toLowerCase()) ? '#000' : '#fff',
                                                                borderColor: isSelected ? 'var(--primary)' : value.toLowerCase()
                                                            } : {}}
                                                        >
                                                            {isSelected && (
                                                                <Check className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white rounded-full p-0.5" />
                                                            )}
                                                            {value}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Show selected variant info */}
                                    {selectedVariant && (
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Check className="w-5 h-5 text-green-600" />
                                                    <span className="text-sm text-green-700 font-medium">
                                                        Selected: {Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                    </span>
                                                </div>
                                                {selectedVariant.stock !== undefined && selectedVariant.stock !== '' && (
                                                    <span className={`text-xs px-2 py-1 rounded ${Number(selectedVariant.stock) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {Number(selectedVariant.stock) > 0 ? `In Stock: ${selectedVariant.stock}` : 'Out of Stock'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-8">
                                <p className={`text-4xl font-black text-primary ${productDetails?.salePrice > 0 ? "line-through text-slate-300 text-2xl" : ""}`}>
                                    ${productDetails?.price || "0.00"}
                                </p>
                                {(productDetails?.salePrice > 0 && productDetails?.salePrice < productDetails?.price) && (
                                    <p className='text-2xl font-bold text-muted-foreground'>
                                        ${productDetails?.salePrice || 'Sale Price'}
                                    </p>
                                )}
                            </div>

                            <div className='mt-10 mb-4'>
                                {productDetails?.parts && productDetails.parts.length > 0 && (
                                    <div className="mb-4">
                                        <h3 className="font-semibold mb-2">Interactive parts</h3>
                                        <div className="grid gap-2">
                                            {productDetails.parts.map((p, idx) => (
                                                <div key={idx} className={`p-2 rounded border cursor-pointer hover:bg-primary/5 transition-colors ${selectedPart === p ? 'border-primary bg-primary/5' : ''}`} onClick={() => setSelectedPart(p === selectedPart ? null : p)}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {p.thumbnail && (
                                                                <img src={p.thumbnail} alt={p.name} className="w-12 h-12 object-cover rounded border" />
                                                            )}
                                                            <div>
                                                                <div className="font-bold">{p.name}</div>
                                                                <div className="text-sm text-muted-foreground">{p.description}</div>
                                                            </div>
                                                        </div>
                                                        <div className="font-bold">{p.price ? `$${p.price}` : ''}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="font-semibold">Quantity:</div>
                                    <div className="flex items-center border rounded-md">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => handleQuantityChange('minus')}>
                                            -
                                        </Button>
                                        <span className="w-10 text-center font-medium">{quantity}</span>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => handleQuantityChange('plus')}>
                                            +
                                        </Button>
                                    </div>
                                </div>

                                <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <div className="text-sm text-muted-foreground mb-1">Total Price</div>
                                    <div className="text-3xl font-bold text-primary">${(effectivePrice * quantity).toFixed(2)}</div>
                                    {selectedVariant && (
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            Variant: {Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                        </div>
                                    )}
                                    {selectedPart && (
                                        <div className="mt-2">
                                            <div className="text-xs text-muted-foreground">Buying: {selectedPart.name} (Part Only)</div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <input
                                                    type="checkbox"
                                                    id="buyWithProduct"
                                                    checked={buyWithProduct}
                                                    onChange={(e) => setBuyWithProduct(e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <label htmlFor="buyWithProduct" className="text-sm font-medium cursor-pointer">
                                                    Buy with main product (+${(Number(productDetails?.salePrice > 0 ? productDetails.salePrice : productDetails?.price) || 0).toFixed(2)})
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button className="w-full py-8 text-lg font-bold rounded-2xl shadow-premium transition-all hover:scale-[1.01] hover:shadow-2xl" onClick={() => {
                                    // Strip subparts from selectedPart to avoid large nested data
                                    const cleanPart = selectedPart ? (() => {
                                        const { subparts, ...partWithoutSubparts } = selectedPart;
                                        return partWithoutSubparts;
                                    })() : null;
                                    
                                    if (selectedPart && buyWithProduct) {
                                        handleAddToCart(productDetails._id, null, quantity, selectedVariant, selectedOptions);
                                        handleAddToCart(productDetails._id, cleanPart, quantity, selectedVariant, selectedOptions);
                                    } else {
                                        handleAddToCart(productDetails._id, cleanPart, quantity, selectedVariant, selectedOptions);
                                    }
                                }}>
                                    Add to Cart
                                </Button>
                            </div>

                            <Separator />

                            <div className='mt-4'>
                                <h2 className="text-xl font-bold mb-4">Reviews</h2>

                                <div className='grid gap-6 max-h-[250px] overflow-y-auto'>
                                    {reviews && reviews.length > 0 ?
                                        reviews.map((reviewItem, idx) => (
                                            <div key={idx} className='flex gap-4'>
                                                <Avatar className="w-10 h-10 border">
                                                    <AvatarFallback>
                                                        {reviewItem?.userName[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="grid gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold">{reviewItem?.userName}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <StarIcon key={star} className={`w-4 h-4 ${star <= reviewItem.reviewValue ? "fill-primary" : "fill-muted stroke-muted-foreground"}`} />
                                                        ))}
                                                    </div>
                                                    <p className='mt-4 text-muted-foreground'>{reviewItem.reviewMessage}</p>
                                                </div>
                                            </div>
                                        )) : <h1>No Reviews</h1>
                                    }
                                </div>

                                <div className='mt-6 flex-col flex gap-2'>
                                    <label>Write a review</label>
                                    <div className='flex gap-1'>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <StarIcon
                                                key={star}
                                                className={`w-6 h-6 cursor-pointer ${star <= rating ? "fill-primary" : "fill-muted stroke-muted-foreground"}`}
                                                onClick={() => handleRatingChange(star)}
                                            />
                                        ))}
                                    </div>
                                    <Input name="reviewMsg" value={reviewMsg} onChange={(event) => setReviewMsg(event.target.value)} placeholder="Write a Review...." />
                                    <Button onClick={handleAddReview} disabled={reviewMsg.trim() === ""}>
                                        Submit
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Visual Parts Viewer Modal */}
            <VisualPartsViewer
                open={showVisualViewer}
                onClose={() => setShowVisualViewer(false)}
                productDetails={productDetails}
                handleAddToCart={handleAddToCart}
            />

            {/* Secure PDF Viewer Modal */}
            <SecurePdfViewer
                open={showPdfViewer}
                onClose={() => setShowPdfViewer(false)}
                pdfUrl={productDetails?.descriptionPdf}
                title={`${productDetails?.title || 'Product'} - Specifications`}
            />
        </div>
    )
}
