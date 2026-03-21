import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import Cart from "../../models/Cart.js";
import { emitEvent, SOCKET_EVENTS } from "../../helpers/socket.js";
import { sendOrderNotification } from "../../helpers/emailService.js";

export const createOrder = async(req,res)=>{
    try{
 
        const {userId,cartItems,addressInfo,
            orderStatus,paymentMethod,
            paymentStatus,totalAmount,
            orderDate,orderUpdateDate,  
            paymentId, 
            payerId
        } = req.body;


        const newOrder = new Order({
            userId,cartItems,addressInfo,orderStatus,paymentMethod,paymentStatus,totalAmount,orderDate,orderUpdateDate,paymentId,payerId
        });

        // Decrement Stock Logic
        for(let item of cartItems){
            let product = await Product.findById(item.productId);
            if(!product) continue;

            if(item.selectedPart){
                // Decrement part stock
                const partIndex = product.parts.findIndex(p => p.name === item.selectedPart.name);
                if(partIndex > -1){
                    product.parts[partIndex].quantity -= item.quantity;
                    if(product.parts[partIndex].quantity < 0) product.parts[partIndex].quantity = 0; // Prevent negative stock
                }
            } else {
                // Decrement main product stock
                product.totalStock -= item.quantity;
                if(product.totalStock < 0) product.totalStock = 0;
            }
            await product.save();
        }

        const saveOrder = await newOrder.save();

        // Clear Cart after successful order
        await Cart.findOneAndDelete({ userId });

        // Emit real-time event for order creation
        emitEvent(SOCKET_EVENTS.ORDER_CREATED, { order: saveOrder });
        emitEvent(SOCKET_EVENTS.REFRESH_ORDERS, { action: 'created', orderId: saveOrder._id });
        // Also emit product refresh for stock updates
        emitEvent(SOCKET_EVENTS.REFRESH_PRODUCTS, { action: 'stock_updated' });

        // Send email notification to admin
        sendOrderNotification(saveOrder).catch(err => console.log('Email notification failed:', err));

        return res.status(200).json({
            success : true,
            message : "Order Created Successfully",
            orderId : newOrder._id
        });


        

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Some Error Occured"
        })
    }
}

export const capturePayment = async(req,res)=>{
    try{



    }catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Some Error Occured"
        })
    }
}

export const getAllOrderByUser = async(req,res)=>{
    try{
        const {userId} = req.params;
        const orders = await Order.find({userId});

        if(!orders.length){
            return res.status(404).json({
                success : false,
                message : "Order Not Found"
            })
        }
        return res.status(200).json({
            success : true,
            data : orders
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Some Error Occured"
        })
    }

}

export const getOrderDetails = async(req,res)=>{
    try{
        const {id}  = req.params;
        // console.log("Order Id : ",id);
  
        const order = await Order.findById(id);
        if(!order){
            return res.status(404).json({
                success : false,
                message : "Order Not Found"
            })
        }
        return res.status(200).json({
            success : true,
            data : order,
            message : 'Order Get Successfully'
        })


    }catch(error){
        console.log(error.message);
        return res.status(500).json({
            success : false,
            message : "Some Error Occured"
        })
    }

}

export const getAllOrders = async(req,res)=>{
        try{
 
        const orders = await Order.find({});
 
        if(!orders.length){
            return res.status(404).json({
                success : false,
                message : "Order Not Found"
            })
        }
        return res.status(200).json({
            success : true,
            data : orders,
            message : 'Fetch All Orders Successfuly'
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Some Error Occured"
        })
    }
    
}

export const updateOrderStatus = async(req,res)=>{
    try{
        const {id} = req.params;
        const {orderStatus} = req.body;
  
        const order = await Order.findById(id);
        if(!order){
            return res.status(404).json({
                success : false,
                message : "Order Not Found"
            })
        }

        const updateOrder = await Order.findByIdAndUpdate(id,{orderStatus});
        
        // Emit real-time event for order status update
        emitEvent(SOCKET_EVENTS.ORDER_UPDATED, { orderId: id, orderStatus });
        emitEvent(SOCKET_EVENTS.REFRESH_ORDERS, { action: 'updated', orderId: id });
        
        return res.status(200).json({
            success : true,
            message : 'Order Updated Successfuly'
        })


    }catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Some Error Occured"
        })
    }
}

export const cancelOrder = async(req,res)=>{
    try{
        const {id} = req.params;
        const order = await Order.findById(id);
        if(!order){
            return res.status(404).json({
                success : false,
                message : "Order Not Found"
            })
        }

        if(order.orderStatus.toLowerCase() !== 'pending'){
            return res.status(400).json({
                success : false,
                message : "Order can not be cancelled"
            })
        }

        order.orderStatus = 'cancelled';
        await order.save();

        return res.status(200).json({
            success : true,
            message : 'Order Cancelled Successfully'
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Some Error Occured"
        })
    }
}