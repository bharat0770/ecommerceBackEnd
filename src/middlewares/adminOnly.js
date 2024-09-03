const User = require("../models/user");
const errorHandler = require("./errorHandler");

const adminOnly = async (req,res,next) => {
    try {
        // /user?email=abc@example.com
        let  {email} = req.query; 
        if(!email){
            return next(new errorHandler("Please enter a valid email", 400)); 
        }
        let user = await  User.findOne({email}); 
        if(user.role !== "admin"){
            return next(new errorHandler("Access denied" , 400)); 
        }
        next(); 
    }catch(err){
        return next(new errorHandler(err.message, 400)); 
    }
} 
module.exports = adminOnly;