const mongoose = require("mongoose"); 
const schema = mongoose.Schema({
    shippingInfo : {
        address : {
            type: String, 
            required : true, 
        }, 
        city : {
            type : String, 
            required : true, 
        }, 
        state :{
            type : String, 
            required : true, 
        }, 
        country : {
            type : String,
            required : true,
        }, 
        pinCode : {
            type : Number, 
            required : true, 
        } 
    },
    user:{
        type : String, 
        ref : "User",
        required : true, 
    },  
    subTotal : {
        type : Number,
        required : true, 
    },  
    tax : {
        type : Number, 
        required : true, 
    }, 
    shippingCharges : {
        type : Number, 
        required : true, 
        default : 0, 
    },
    discount : {
        type : Number, 
        required : true, 
        default : 0, 
    },
    total : {
        type : Number, 
        required : true, 
    }, 
    status : {
        type : String, 
        enum : ["processing", "shipped", "delivered"], 
        default : "processing", 
    },
    orderItems : [
        {
            name : String, 
            photo : String, 
            price : Number, 
            quantity : Number, 
            productId : {
                type : mongoose.Types.ObjectId, 
                ref : "Products", 
            } 
        },
    ]
    },
    {
        timestamps: true,
    }
); 
const Orders = mongoose.model("Orders", schema); 
module.exports = Orders;
