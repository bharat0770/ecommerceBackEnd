const errorHandler = require("../middlewares/errorHandler");
const Cart = require("../models/cart"); 

const addItemsToCart = async(req, res, next) => {
    try{ const {userId, cartItems, status} = req.body; 
    const oldCart = await Cart.findOne({userId : userId}); 
    if(!oldCart){
        const result = await Cart.create({
            userId, 
            cartItems, 
            status, 
        })
        res.status(200).json({
            success : true, 
            message :  result, 
        })
    }else{
        const updatedCartItems = [...oldCart.cartItems];
        cartItems.forEach((item) => {
            existingItemindex =  updatedCartItems.findIndex((i) => i.productId.toString() === item.productId.toString()); 
            if(existingItemindex > -1){
                updatedCartItems[existingItemindex].quantity += item.quantity;
            }else{
                updatedCartItems.push(item); 
            }
        })
        oldCart.cartItems = updatedCartItems;
        const result = await oldCart.save(); 
        res.status(200).json({
            success : true, 
            message :  result, 
        })
    }
}catch(err){
        return next(new errorHandler(err.message, 401)); 
    }
}

const removeItemsFromCart = async(req, res, next) => {
    try{ const {userId, productId} = req.body; 
    const cart = await Cart.findOne({userId : userId}); 
    if(!cart){
        return next(new errorHandler("cart doesn't exists", 401)); 
    }
        cart.cartItems = cart.cartItems.filter((i) => {
            return i.productId != productId; 
        }); 
    
    const result = await cart.save(); 
    res.status(200).json({
        success : true, 
        message :  result, 
    })}catch(err){
        return next(new errorHandler(err.message, 401)); 
    }
}

const getCart = async(req, res, next) => {
    try{
        const {userId} = req.query; 
        // const cart = await Cart.findOne({userId : userId}); 
        const cart = await Cart.findOne({ userId: userId })
    .populate({
        path: 'cartItems.productId',
        model: 'Products', // The name of the Product model
        select: 'name price photo', // Fields to include from the Product model
    });
        if(!cart){
            return next(new errorHandler("cart doesn't exists", 401)); 
        }
        res.status(201).json({
            success: true, 
            message : cart,
        })
    }catch(err){
        
        return next(new errorHandler(err.message, 401)); 
    }
}
const clearCart = async(req, res, next) => {
    try{
        const {userId} = req.query; 
        const cart = await Cart.findOne({userId : userId}); 
        if(!cart){
            return next(new errorHandler("cart doesn't exists", 401)); 
        }
        cart.cartItems = []; 
        const result = await cart.save(); 
        res.status(201).json({
            success: true, 
            message : result,
        })
    }catch(err){
        
        return next(new errorHandler(err.message, 401)); 
    }
}
module.exports = {
    addItemsToCart, 
    removeItemsFromCart, 
    getCart, 
    clearCart,
};

