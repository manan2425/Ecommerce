import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";


// Add to Cart
export const addToCart = async(req, res) => {
    try{

        const {userId,productId,quantity,selectedPart} = req.body;
 
        if(!userId || !productId || quantity<=0){
            return res.status(400).json({
                success: false,
                message: "Invalid Data Provided"
            })
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
       
        // If a selectedPart is provided we should consider it when grouping items.
        const findCurrentProductIndex = cart.items.findIndex(item=>{
            if(item.productId.toString() !== productId) return false;
            // both have no selectedPart -> same item
            if(!item.selectedPart && !selectedPart) return true;
            // if selectedPart provided, match by nodeName if available else compare serialized
            if(item.selectedPart && selectedPart){
                if(selectedPart.nodeName && item.selectedPart.nodeName) return item.selectedPart.nodeName === selectedPart.nodeName;
                return JSON.stringify(item.selectedPart) === JSON.stringify(selectedPart);
            }
            return false;
        });

        if(findCurrentProductIndex===-1){
            cart.items.push({productId,quantity,selectedPart});
            // console.log("here cart : ",cart);
        }
        else{   
            cart.items[findCurrentProductIndex].quantity+=quantity;
        }

        
        const response = await cart.save();
        return res.status(200).json({
            success : true,
            message : "Yeah Your Favourite Product Has Been Added Into Your WishList!!",
            data : cart 
        })
 

    }
    catch(error){
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "Some Internal Error Occured"
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

        const cart = await Cart.findOne({userId}).populate({
            path : 'items.productId',
            select : "image title price salePrice"
        })

    

        if(!cart){
            return res.status(404).json({
                success : false,
                message : "Cart not found"
            })
        }


        // If Admin Delete the Product Then This step will occur
        const validItems = cart.items.filter(productItem => productItem.productId);

        if(validItems.length < cart.items.length){
            cart.items = validItems;
            const response = await cart.save();
        }

        const populateCartItems = validItems.map(item=>({
            productId : item.productId._id,
            image : item.productId.image,
            price : item.productId.price,
            salePrice : item.productId.salePrice,
            // include any selected part details captured with the item
            selectedPart: item.selectedPart || null,
            quantity : item.quantity,
            title : item.productId.title,
            itemId : item._id,
        }));

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