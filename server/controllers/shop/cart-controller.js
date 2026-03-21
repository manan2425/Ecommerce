import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";
import Service from "../../models/Service.js";


// Add to Cart
export const addToCart = async(req, res) => {
    try{

        const {userId, productId, quantity, selectedPart, selectedVariant, selectedOptions, isService} = req.body;
        
        // Default quantity to 1 if not provided or invalid
        const qty = quantity && quantity > 0 ? quantity : 1;
 
        if(!userId || !productId){
            return res.status(400).json({
                success: false,
                message: "Invalid Data Provided - userId and productId are required"
            })
        }

        // Handle service addition
        if (isService) {
            const service = await Service.findById(productId);
            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: "Service Not Found"
                });
            }

            let cart = await Cart.findOne({userId});
            if (!cart) {
                cart = new Cart({userId, items: []});
            }

            // Check if service already in cart
            const existingServiceIndex = cart.items.findIndex(
                item => item.isService && item.serviceId?.toString() === productId
            );

            if (existingServiceIndex === -1) {
                cart.items.push({
                    serviceId: productId,
                    isService: true,
                    quantity: qty
                });
            } else {
                cart.items[existingServiceIndex].quantity += qty;
            }

            await cart.save();
            return res.status(200).json({
                success: true,
                message: "Service added to cart!",
                data: cart
            });
        }

        const product = await Product.findById(productId);
        
        if(!product){
            return res.status(404).json({
                success: false,
                message: "Product Not Found"
            })
        }

        let cart = await Cart.findOne({userId});

        if(!cart){
            cart = new Cart({userId,items : []});
        }
       
        // Helper to compare selected options
        const compareOptions = (opts1, opts2) => {
            if (!opts1 && !opts2) return true;
            if (!opts1 || !opts2) return false;
            const keys1 = Object.keys(opts1);
            const keys2 = Object.keys(opts2);
            if (keys1.length !== keys2.length) return false;
            return keys1.every(key => opts1[key] === opts2[key]);
        };

        // Helper to compare part paths (for nested subparts)
        const comparePartPath = (path1, path2) => {
            if (!path1 && !path2) return true;
            if (!path1 || !path2) return false;
            if (path1.length !== path2.length) return false;
            return path1.every((val, idx) => val === path2[idx]);
        };

        // If a selectedPart or selectedVariant is provided we should consider it when grouping items.
        const findCurrentProductIndex = cart.items.findIndex(item=>{
            // Skip service items (they have serviceId, not productId)
            if(!item.productId) return false;
            if(item.productId.toString() !== productId) return false;
            
            // Compare selectedPart (now with partPath for nested subparts)
            const partMatch = (() => {
                if(!item.selectedPart && !selectedPart) return true;
                if(item.selectedPart && selectedPart){
                    // First check partPath for nested subparts
                    if(selectedPart.partPath && item.selectedPart.partPath) {
                        return comparePartPath(item.selectedPart.partPath, selectedPart.partPath);
                    }
                    // Fallback to nodeName comparison
                    if(selectedPart.nodeName && item.selectedPart.nodeName) {
                        return item.selectedPart.nodeName === selectedPart.nodeName;
                    }
                    // Last resort: JSON comparison
                    return JSON.stringify(item.selectedPart) === JSON.stringify(selectedPart);
                }
                return false;
            })();
            
            if (!partMatch) return false;
            
            // Compare selectedOptions (variant)
            const itemOptions = item.selectedOptions ? Object.fromEntries(item.selectedOptions) : null;
            const optionsMatch = compareOptions(itemOptions, selectedOptions);
            
            return optionsMatch;
        });

        if(findCurrentProductIndex===-1){
            cart.items.push({
                productId,
                quantity: qty,
                selectedPart,
                selectedVariant: selectedVariant ? {
                    optionCombination: selectedVariant.optionCombination,
                    price: selectedVariant.price,
                    salePrice: selectedVariant.salePrice,
                    sku: selectedVariant.sku
                } : null,
                selectedOptions: selectedOptions || null
            });
        }
        else{   
            cart.items[findCurrentProductIndex].quantity+=qty;
        }

        
        const response = await cart.save();
        return res.status(200).json({
            success : true,
            message : "Yeah Your Favourite Product Has Been Added Into Your WishList!!",
            data : cart 
        })
 

    }
    catch(error){
        console.log("Cart Add Error:", error.message);
        console.log("Full Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Some Internal Error Occured"
        })
    }
}

// Fetch Cart Items
export const fetchCartItems = async(req, res) => {
    try{

        const {userId} = req.params;

        
        if(!userId){
            return res.status(400).json({
                success : false,
                message : "userId is required"
            })
        }

        const cart = await Cart.findOne({userId})
            .populate({
                path : 'items.productId',
                select : "image title price salePrice"
            })
            .populate({
                path: 'items.serviceId',
                select: "image title price priceType category"
            });

    

        if(!cart){
            return res.status(404).json({
                success : false,
                message : "Cart not found"
            })
        }


        // Filter valid items (products or services)
        const validItems = cart.items.filter(item => 
            (item.isService && item.serviceId) || (!item.isService && item.productId)
        );

        if(validItems.length < cart.items.length){
            cart.items = validItems;
            const response = await cart.save();
        }

        const populateCartItems = validItems.map(item => {
            // Handle service items
            if (item.isService && item.serviceId) {
                return {
                    serviceId: item.serviceId._id,
                    isService: true,
                    image: item.serviceId.image || '',
                    price: item.serviceId.price,
                    priceType: item.serviceId.priceType,
                    category: item.serviceId.category,
                    quantity: item.quantity,
                    title: item.serviceId.title,
                    itemId: item._id,
                };
            }
            
            // Handle product items
            return {
                productId : item.productId._id,
                isService: false,
                image : item.productId.image,
                price : item.productId.price,
                salePrice : item.productId.salePrice,
                // include any selected part details captured with the item
                selectedPart: item.selectedPart || null,
                // include selected variant and options
                selectedVariant: item.selectedVariant ? {
                    optionCombination: item.selectedVariant.optionCombination ? Object.fromEntries(item.selectedVariant.optionCombination) : null,
                    price: item.selectedVariant.price,
                    salePrice: item.selectedVariant.salePrice,
                    sku: item.selectedVariant.sku
                } : null,
                selectedOptions: item.selectedOptions ? Object.fromEntries(item.selectedOptions) : null,
                quantity : item.quantity,
                title : item.productId.title,
                itemId : item._id,
            };
        });

        return res.status(200).json({
            success : true,
            message : "Cart Data Found Successfully",
            data : {
                ...cart._doc,
                items : populateCartItems
            }
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Some Internal Error Occured"
        })
    }
}

// Update Cart Item
export const updateCartItemQty = async(req, res) => {
    try{
        const {userId,itemId,quantity} = req.body;
        
        if(!userId || !itemId || quantity<=0){
            return res.status(400).json({
                success: false,
                message: "Invalid Data Provided"
            })
        }
        

        const cart = await Cart.findOne({userId});
    
        if(!cart){
            return res.status(404).json({
                success : false,
                message : "Cart not found"
            })
        }
        
        const findCurrentProductIndex =  cart.items.findIndex(item=>item._id.toString() === itemId);

        if(findCurrentProductIndex === -1){
            return res.status(404).json({
                success : false,
                message : "Cart Item not found"
            })
        }

        cart.items[findCurrentProductIndex].quantity=quantity;
        const response = await cart.save();

        const response1 = await cart.populate({
            path : 'items.productId',
            select : "image title price salePrice"
        });

        const populateCartItems = cart.items.map((item)=>({
            productId : item?.productId?._id ? item?.productId?._id : null,
            image : item?.productId?.image || null,
            price : item?.productId?.price || null,
            salePrice : item?.productId?.salePrice || null,
            selectedPart: item?.selectedPart || null,
            selectedVariant: item?.selectedVariant ? {
                optionCombination: item.selectedVariant.optionCombination ? Object.fromEntries(item.selectedVariant.optionCombination) : null,
                price: item.selectedVariant.price,
                salePrice: item.selectedVariant.salePrice,
                sku: item.selectedVariant.sku
            } : null,
            selectedOptions: item?.selectedOptions ? Object.fromEntries(item.selectedOptions) : null,
            quantity : item?.quantity || null,
            title : item?.productId?.title || "Product Not Found",
            itemId : item?._id,
        }));


        return res.status(200).json({
            message : "Cart Items Found",
            data : {
                ...cart._doc,
                items : populateCartItems
            },
            success : true
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Some Internal Error Occured"
        })
    }
}

// Delete Cart Item
export const deleteCartItem = async(req, res) => {
    try{

        const {userId,itemId} = req.params;
        if(!userId || !itemId){
            return res.status(400).json({
                success : false,
                message : "Insufficient Data"
            })
        }

        const cart = await Cart.findOne({userId}).populate({
            path : 'items.productId',
            select : "image title price salePrice"
        });

        if(!cart){
            return res.status(404).json({
                success : false,
                message : "Cart not found"
            })
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);

        const response = await cart.save();

        const populateCartItems = cart.items.map((item)=>({
            productId : item?.productId?._id ? item?.productId?._id : null,
            image : item?.productId?.image || null,
            price : item?.productId?.price || null,
            salePrice : item?.productId?.salePrice || null,
            selectedPart: item?.selectedPart || null,
            selectedVariant: item?.selectedVariant ? {
                optionCombination: item.selectedVariant.optionCombination ? Object.fromEntries(item.selectedVariant.optionCombination) : null,
                price: item.selectedVariant.price,
                salePrice: item.selectedVariant.salePrice,
                sku: item.selectedVariant.sku
            } : null,
            selectedOptions: item?.selectedOptions ? Object.fromEntries(item.selectedOptions) : null,
            quantity : item?.quantity || null,
            title : item?.productId?.title || "Product Not Found",
            itemId : item?._id,
        }));

        return res.status(200).json({
            message : "Hope You Get Better Product, Product Removed From Cart",
            data : {
                ...cart._doc,
                items : populateCartItems
            },
            success : true
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Some Internal Error Occured"
        })
    }
}