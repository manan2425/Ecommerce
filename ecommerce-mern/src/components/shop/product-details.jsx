/* eslint react/prop-types: 0 */
import React from 'react'
import { Dialog, DialogContent, DialogDescription } from '../ui/dialog'
import Img from "../../assets/ImgIcon.png"
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { StarHalfIcon, StarIcon } from 'lucide-react'
import { Input } from '../ui/input'
import { useDispatch } from 'react-redux'
import { resetProductDetails } from '@/store/shop/products-slice'
import { generateProductPDF } from '@/utils/pdf-generator'
import { useSelector } from 'react-redux'
import { addReview, getReviews } from '@/store/shop/review-slice'
import { useToast } from '@/hooks/use-toast'


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

    // calculate effective price: if part selected, use part price; else use product price
    const effectivePrice = React.useMemo(() => {
        let price = 0;
        const productPrice = Number(productDetails?.salePrice > 0 ? productDetails.salePrice : productDetails?.price) || 0;

        if (selectedPart) {
            price = Number(selectedPart.price) || 0;
            if (buyWithProduct) {
                price += productPrice;
            }
        } else {
            price = productPrice;
        }
        return price;
    }, [productDetails, selectedPart, buyWithProduct]);

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
            }}>
                <DialogContent className="productModal grid grid-cols-1 lg:grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg-max-w-[70vw]
            h-[90vh]
            overflow-scroll
            ">
                    <div className="sr-only">
                        <DialogDescription>Product Details</DialogDescription>
                    </div>

                    <div className="lg:sticky top-0 rounded-lg">
                        <div className="relative w-full h-[450px] flex items-center justify-center bg-white border rounded">
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
                        </div>
                    </div>

                    <div className="">

                        <div>
                            <h1 className="text-3xl font-extrabold">
                                {productDetails?.title || "Title"}
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
                        </div>


                        <div className="flex items-center justify-between mt-8">
                            <p className={`text-3xl font-bold text-primary
                        ${productDetails?.salePrice > 0 ? "line-through" : ""}
                        `}>
                                {productDetails?.price || "Price"}$
                            </p>
                            {
                                (productDetails?.salePrice > 0 && productDetails?.salePrice < productDetails?.price) &&
                                <p className='text-2xl font-bold text-muted-foreground'>
                                    ${
                                        productDetails?.salePrice || 'Sale Price'
                                    }
                                </p>
                            }
                        </div>

                        <div className='mt-10 mb-4'>
                            <div className="mb-3">
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
                            </div>

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

                            <Button className="w-full" onClick={() => {
                                if (selectedPart && buyWithProduct) {
                                    // Add main product
                                    handleAddToCart(productDetails._id, null, quantity);
                                    // Add part
                                    handleAddToCart(productDetails._id, selectedPart, quantity);
                                } else {
                                    handleAddToCart(productDetails._id, selectedPart, quantity);
                                }
                            }} >
                                Add to Cart
                            </Button>
                            <Button variant="outline" className="w-full mt-2" onClick={() => generateProductPDF(productDetails)}>
                                Download PDF
                            </Button>
                        </div>


                        <Separator />

                        <div className='reviewModal max-h-[300px] overflow-auto'>

                            <h2 className="text-xl font-bold mb-4">
                                Reviews
                            </h2>

                            <div className='grid gap-6'>
                                {
                                    reviews && reviews.length > 0 ?
                                        reviews.map((reviewItem) => (
                                            <div className='flex gap-4'>
                                                <Avatar className="w-10 h-10 border">
                                                    <AvatarFallback>
                                                        {reviewItem?.userName[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="grid gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold">
                                                            {reviewItem?.userName}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-0.5 ">
                                                        {
                                                            [1, 2, 3, 4, 5].map((star) => (
                                                                <StarIcon className={`w-4 h-4 ${star <= reviewItem.reviewValue ? "fill-primary" : "fill-muted stroke-muted-foreground"}`} />
                                                            ))
                                                        }
                                                    </div>
                                                    <p className='mt-4 text-muted-foreground'>
                                                        {reviewItem.reviewMessage}
                                                    </p>
                                                </div>
                                            </div>
                                        )) : <h1>No Reviews</h1>
                                }
                            </div>

                            <div className='mt-10 flex-col flex gap-2'>
                                <label>Write a review</label>
                                <div className='flex gap-1'>
                                    {
                                        [1, 2, 3, 4, 5].map((star) => (
                                            <StarIcon
                                                className={`w-6 h-6 cursor-pointer ${star <= rating ? "fill-primary" : "fill-muted stroke-muted-foreground"}`}
                                                onClick={() => handleRatingChange(star)}
                                            />
                                        ))
                                    }
                                </div>
                                <Input name="reviewMsg" value={reviewMsg} onChange={(event) => setReviewMsg(event.target.value)} placeholder="Write a Review...." />
                                <Button onClick={handleAddReview} disabled={reviewMsg.trim() === ""}>
                                    Submit
                                </Button>
                            </div>

                        </div>

                    </div>


                </DialogContent>
            </Dialog>
        </div>
    )
}
