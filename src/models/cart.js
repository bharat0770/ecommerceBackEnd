const mongoose  = require("mongoose"); 

const schema = mongoose.Schema({
    userId : {
        type : mongoose.Types.ObjectId,
        ref : "User", 
        required : [true, "please provide the userID"], 
    }, 

    cartItems : [
        {
            _id : false, 
            productId : {
                type :  mongoose.Types.ObjectId, 
                ref : "Products",
            }, 
            quantity : {
                type : Number,
                default : 1, 
            }
        }
    ], 
    
    status : {
        type : Number, 
        enum : [0,1], 
        default : 0, 
    }, 
    // additionalInfo : {

    // }
}); 
const Cart = mongoose.model("Cart", schema); 
module.exports = Cart;