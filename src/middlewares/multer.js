
const multer = require("multer");
const {v4  }= require("uuid");
const path = require("path");

//% configuring storage details as per our need
// const dirname = "C:\\Users\\BHAVESH\\Desktop\\sukuna\\WEBDEV\\PROJECTS\\ecommerce\\ecommerce_backend";
// const dirname = "C:\\Users\\BHAVESH\\Desktop\\sukuna\\WEBDEV\\PROJECTS\\ecommerce\\ecommerce_backend";
    const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // cb(null, path.join(dirname, "uploads"));
        cb(null, "../ecommerce_backend/uploads");
    },
    filename: function (req, file, cb) {
        let id  = v4();
        let extName = file.originalname.split('.').pop();
        let fileName = `${id}.${extName}`; 
        cb(null, fileName); 
    }
})

//% this will enable us to use the multer with custom storage 
const upload = multer({ storage });

module.exports = upload; 