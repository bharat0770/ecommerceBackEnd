const User = require("../models/user.js");
const errorHandler = require("../middlewares/errorHandler.js");

const newUser = async (req, res, next) => {
    try {
        // if user exists welcome them
        let checkExistingUser = await User.findOne({ email: req.body.email });
        if (checkExistingUser) {
            return res.status(201).json({
                success: true,
                message: ` welcome ${req.body.name}`
            });
        }
        
        if(!req.body.name || !req.body.email || !req.body.photo || !req.body.role || !req.body.gender || !req.body.dob) {
            next(new errorHandler("Please enter all required fields", 400));
        }
        
        
        // if no user exists create one

        const user = await User.create({
            // _id : req.body._id, 
            name: req.body.name,
            email: req.body.email,
            photo: req.body.photo,
            role: req.body.role,
            gender: req.body.gender,
            dob: req.body.dob
        });

        return res.status(200).json({
            success: true,
            message: `welcome ${user.name}`,
        });
    }


    catch (error) {
        return next(new errorHandler(error.message, 400)); 
    }
};


const allUser =  async (req, res, next) => {
    try{
        let result = await User.find(); 
        res.status(200).json({
            success  :true, 
            message : result,
        })
    }catch(e){
        console.log(e.message); 
        return next(new errorHandler("Error while getting all users", 400)); 
        
    }
}



//* we can use params to get email for searching data but that is not secure
//! hence I used req.body to get the email to be searched for which makes it more secure
const oneUser =  async(req, res, next) => {
    try{
        if(!req.query.email){
            return next(new errorHandler("provided email is not valid", 400));
        }
        // let result = await User.findOne({email : req.params.email}); 
        let result = await User.findOne({email : req.query.email}); 
        
        if(!result){
            return next(new errorHandler("user doesn't exists", 400));
        }
        res.status(200).json({
            success  :true, 
            message : result,
        })
    }catch(e){
        console.log(e.message); 
        return next(new errorHandler("Error while getting all users", 400));
    }
}   

const deleteUser = async(req, res, next) => {
    try {
        let {userEmail}= req.query; 
        if(!userEmail){
            return next(new errorHandler("provided email is not valid", 400));
        }
        let user = await User.findOne({email : userEmail}); 
        
        if(!user){
            return next(new errorHandler("user doesn't exists", 400));
            }
            
        await user.deleteOne(); 

        res.status(200).json({
            success : true, 
            message : "User deleted successfully"
        })
    } catch (err) {
        return next(new errorHandler(err.message, 400)); 
    }
    
    
}


module.exports = {
    newUser, 
    allUser, 
    oneUser, 
    deleteUser
};



