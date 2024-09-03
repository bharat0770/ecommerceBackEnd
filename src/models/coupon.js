const mongoose = require("mongoose")

const schema = mongoose.Schema({
    code : {
        type : String, 
        required : [true, "please provide a coupon"], 
        unique : true, 
    },
    amount : {
        type : Number,
        required : [true, "please enter the discount amount"], 
    },
})

const Coupon = mongoose.model("Coupon", schema); 
module.exports = Coupon;