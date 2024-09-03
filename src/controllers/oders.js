const errorHandler = require("../middlewares/errorHandler.js");
const Orders = require("../models/orders.js");
const User = require("../models/user.js");
const { reduceStock } = require("../util/features.js");

const newOrder = async (req, res, next) => {

    try {
        const {
            shippingInfo,
            user,
            subTotal,
            tax,
            shippingCharges,
            discount,
            total,
            status,
            orderItems
        } = req.body;
        if (!shippingInfo || !user || !tax  || !total) {
            return next(new errorHandler("Please provide all required data", 400));
        }
        const order = await Orders.create({
            shippingInfo,
            user,
            subTotal,
            tax,
            shippingCharges,
            discount,
            total,
            status,
            orderItems
        })
        await reduceStock(orderItems); 
        res.status(201).json({
            success : true, 
            message : order, 
        })
    } catch (err) {
        return next(new errorHandler(err.message, 400));
    }
}

const myOrders = async(req, res, next) => {
    try{   
        let user = req.query.id; 
        if(!user){
            return next(new errorHandler("UserId doesn't exist", 400));
        }
        
        let order = await Orders.find({user}).populate("orderItems"); 
        res.status(200).json({
            success : true,
            message : order,
        })
    } catch (err) {
        return next(new errorHandler(err.message, 400));
    }
} 
const singleOrder = async(req, res, next) => {
    try{
        const id = req.query.id;  
        if(!id) return next(new errorHandler("invalid id", 400));
        // let order = await Orders.findById(id).populate("user", "name"); 
        let order = await Orders.findById(id).populate("user", "name"); 
        return  res.status(201).json({
            success : true,
            message : order 
        }); 
    }
    catch (err) {
        return next(new errorHandler(err.message, 400));
    }
} 



const allOrders = async(req, res, next) => {
    try{
        let orders = await Orders.find().populate("user", "name"); 
        res.status(200).json({
            success : true,
            message : orders
        })
    } catch (err) {
        return next(new errorHandler(err.message, 400));
    }
} 
const processOrder = async(req, res, next) => {
    try{   
        const id = req.query.id; 
        if(!id) return next(new errorHandler("Please provide an Id", 400));
        const order = await Orders.findById({_id : id}); 
    if(!order) return next(new errorHandler("Order doesn't exist", 400));

        switch(order.status){
            case "processing" : 
            order.status = "shipped";  
            break; 
            case "shipped" : 
            order.status = "delivered";  
            break; 
            default : 
            order.status = "delivered";  
            break; 
        }
        await order.save(); 
        res.status(201).json({
            success : true,
            message : "Order processed successfully",
        })
    } catch (err) {
        return next(new errorHandler(err.message, 400));
    }
} 
const deleteOrder = async(req, res, next) => {
    try{
        const id = req.query.id; 
        if(!id) return next(new errorHandler("Order Id doesn't exist", 400));
    const order = await Orders.findById(id);  
        if(order){
            await  Orders.deleteOne({_id:id})
            res.status(201).json({
                success : true, 
                message : "Order Deleted successfully"
            })
        }
        else{
            res.status(401).json({
                success : false, 
                message : "Order doen't exists", 
            })

        }
    } catch (err) {
        return next(new errorHandler(err.message, 400));
    }
} 



module.exports = {
    newOrder,
    myOrders, 
    singleOrder, 
    processOrder,
    allOrders, 
    deleteOrder,
}


