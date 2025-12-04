/* eslint react/prop-types: 0 */
import React from 'react'
import { Dialog, DialogContent, DialogDescription } from '../ui/dialog'
import { useDispatch, useSelector } from 'react-redux'
import { resetProductDetails } from '@/store/shop/products-slice'
import { addReview, getReviews } from '@/store/shop/review-slice'
import { useToast } from '@/hooks/use-toast'
import HierarchicalProductExplorer from './hierarchical-product-explorer'
import { Separator } from '../ui/separator'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { StarHalfIcon, StarIcon } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'

export default function ProductDetailsModal({ open, setOpen, productDetails, handleAddToCart }) {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const { reviews } = useSelector(state => state.shopReviewSlice);
    const { toast } = useToast();
    const navigate = useNavigate();

    const [rating, setRating] = React.useState(0);
    const [reviewMsg, setReviewMsg] = React.useState("");
    const [showReviews, setShowReviews] = React.useState(false);

    React.useEffect(() => {
        if (productDetails !== null) {
            dispatch(getReviews(productDetails?._id));
        }
    }, [productDetails, dispatch]);

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

    const handleExplorerAddToCart = (item) => {
        if (!isAuthenticated) {
            setOpen(false);
            navigate('/auth/login');
            return;
        }
        // Convert hierarchical format to cart format
        handleAddToCart({
            productId: item.productId,
            quantity: item.quantity,
            breadcrumbInfo: item.breadcrumb
        });
        toast({
            title: `${item.title} added to cart`
        });
    }

    const handleModalOpen = (isOpen) => {
        if (!isOpen) {
            setOpen(false);
            dispatch(resetProductDetails());
            setRating(0);
            setReviewMsg("");
            setShowReviews(false);
            return;
        }
        
        // When opening, check if user is authenticated
        if (isOpen && !isAuthenticated) {
            setOpen(false);
            navigate('/auth/login');
            return;
        }
        
        setOpen(isOpen);
    }
            dispatch(resetProductDetails());
            setRating(0);
            setReviewMsg("");
            setShowReviews(false);
            return;
        }
        
        // When opening, check if user is authenticated
        if (isOpen && !isAuthenticated) {
            setOpen(false);
            navigate('/auth/login');
            return;
        }
        
        setOpen(isOpen);
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={handleModalOpen}>
                <DialogContent className="productModal max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] max-h-[95vh] overflow-auto">
                    <div className="sr-only">
                        <DialogDescription>Product Details</DialogDescription>
                    </div>

                    {productDetails && (
                        <div className="space-y-8 py-4">
                            {/* Hierarchical Product Explorer */}
                            <HierarchicalProductExplorer 
                                product={productDetails}
                                onAddToCart={handleExplorerAddToCart}
                            />

                            {/* Reviews Section */}
                            <div className="border-t pt-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Customer Reviews</h3>
                                    <Button 
                                        variant="outline"
                                        onClick={() => setShowReviews(!showReviews)}
                                    >
                                        {showReviews ? 'Hide' : 'Show'} Reviews
                                    </Button>
                                </div>

                                {/* Add Review Form */}
                                {user && (
                                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                        <h4 className="font-semibold mb-3">Write a Review</h4>
                                        <div className="space-y-3">
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((r) => (
                                                    <button
                                                        key={r}
                                                        onClick={() => handleRatingChange(r)}
                                                        className="transition-transform hover:scale-110"
                                                    >
                                                        {r <= rating ? (
                                                            <StarIcon className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                                                        ) : (
                                                            <StarIcon className="w-6 h-6 text-gray-300" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                            <Input
                                                type="text"
                                                placeholder="Share your thoughts..."
                                                value={reviewMsg}
                                                onChange={(e) => setReviewMsg(e.target.value)}
                                                className="w-full"
                                            />
                                            <Button 
                                                onClick={handleAddReview}
                                                disabled={!reviewMsg.trim() || rating === 0}
                                                className="w-full"
                                            >
                                                Post Review
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Reviews List */}
                                {showReviews && reviews && reviews.length > 0 && (
                                    <div className="space-y-4">
                                        {reviews.map((review) => (
                                            <div key={review._id} className="border rounded-lg p-4">
                                                <div className="flex items-start gap-3 mb-2">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback>
                                                            {review.userName?.charAt(0).toUpperCase() || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-sm">{review.userName}</h4>
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((r) => (
                                                                <StarIcon
                                                                    key={r}
                                                                    className={`w-4 h-4 ${
                                                                        r <= review.reviewValue
                                                                            ? 'fill-yellow-400 text-yellow-400'
                                                                            : 'text-gray-300'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-700">{review.reviewMessage}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {reviews && reviews.length === 0 && showReviews && (
                                    <p className="text-center text-gray-600 py-4">No reviews yet. Be the first to review!</p>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
