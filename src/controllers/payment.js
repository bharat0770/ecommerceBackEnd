
const { Stripe } = require("stripe");
const errorHandler = require("../middlewares/errorHandler.js");
const Coupon = require("../models/coupon.js");
const stripeKey = process.env.STRIPE_KEY; 

const stripe = new Stripe(stripeKey);

const createPaymentIntent = async(req, res, next) => {
    try {
        const {amount} = req.body; 
        if(!amount)return next(new errorHandler("Please provide an amount", 401));  
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Number(amount) * 100,
            currency: "inr",
        });
        res.status(201).json({  
            success :  true,
            clientSecret : paymentIntent.client_secret, 
            })
    } catch (err) {
        return next(new errorHandler(err.message, 401)); 
    }
}
const newCoupon = async(req, res, next) => {
    try {
        const {code, amount} = req.query; 
        if(!code || !amount)return next(new errorHandler("Please provide a coupon code and amount", 401)); 
        const coupon = await Coupon.create({code, amount}); 
        res.status(201).json({
            success :  true,
            message : `Coupon ${coupon.code} created successfully`
        })
    } catch (err) {
        return next(new errorHandler(err.message, 401)); 
    }
}

const deleteCoupon = async(req, res, next) => {
    try {
        const {code} = req.query; 
        if(!code)return next(new errorHandler("Please provide a coupon code and amount", 401)); 
        const coupon = await Coupon.findOne({code}); 
        if(coupon){
            await Coupon.deleteOne({code}); 
            res.status(201).json({
                success :  true,
                message : `Coupon ${coupon.code} deleted successfully`
            })
        }
        else{
            res.status(401).json({
                success :  false,
                message : `Coupon doen't exists`
            })

        }
    } catch (err) {
        return next(new errorHandler(err.message, 401)); 
    }
}

const allCoupons = async(req, res, next) => {
    try {
        const coupon = await Coupon.find(); 
            res.status(201).json({
                success :  true,
                message : coupon
            })
    } catch (err) {
        return next(new errorHandler(err.message, 401)); 
    }
}
const applyDiscount = async (req, res, next) => {
    try {
        const {coupon} = req.query;
        const discount  = await Coupon.findOne({code : coupon}); 
        if(!discount)return next(new errorHandler("Invalid coupon code",  401)); 
        res.status(201).json({
            success :  true,
            discount : discount.amount
        })
    } catch (err) {
        return next(new errorHandler(err.message, 401)); 
    }
}
const singleCoupon = async (req, res, next) => {
    try {
        const {id} = req.query;
        if(!id)return next(new errorHandler("Invalid coupon Id",  401)); 
        const coupon  = await Coupon.findOne({_id:id}); 
        if(!coupon)return next(new errorHandler("Coupon doesn't exists",  401)); 
            res.status(201).json({
                success :  true,
                message  : coupon 
            })
    } catch (err) {
        return next(new errorHandler(err.message, 401)); 
    }
}
const updateCoupon = async (req, res, next) => {
    try {
        const {id, code, amount} = req.query;
        if(!id)return next(new errorHandler("Invalid coupon Id",  401)); 
        const coupon  = await Coupon.findOne({_id:id}); 
        if(!coupon)return next(new errorHandler("Coupon doesn't exists",  401)); 
        if(code){
            coupon.code = code; 
        }
        if(amount){
            coupon.amount = amount; 
        }
        await coupon.save();
        res.status(201).json({
                success :  true,
                message  : `${coupon.code} updated successfully` 
            })
    } catch (err) {
        return next(new errorHandler(err.message, 401)); 
    }
}

module.exports = {
    newCoupon, 
    deleteCoupon, 
    allCoupons, 
    applyDiscount,
    singleCoupon, 
    updateCoupon,
    createPaymentIntent
}