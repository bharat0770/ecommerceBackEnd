//! BACKEND

//* Packages : mongoose, express, validator, joi 


//? FILE STRUCTURE 
//% src
// controllers : contains handlers 
// routes : contains endPoints
// models : contains  schema or table structure 
// middleware : contains  different handlers / helper functions 
// util : contains any additional functions we may need
//% uploads : this contains any file that needs to be uploaded

//? app.js
// sets up the express server and calls the routes from routes folder, also contains the middlewares
// const express = require("express"); 
// const app = express();
// app.lister(port, callbackFunction); 

//? models
// contains the structure for different tables throughout the project 
// calls mongoose and uses mongoose.schema({}) and mongoose.models(tableName, schema)


//? routes 
// contains all the routes used throughout the project 
// app.get("route", handler); 
// app.post("route", handler); 

//? connectors
// connectors are basically handlers or callBack functions that are used when user hits the endpoints/urls 

//? middleware 
// middlewares are like  helper functions that are used 

//? connecting to DB
// use mongoose.connect("localhostLink_DBname") in an async helper function and export it or just make the app.listen  an async function and use that  
// app.listen(port, async () => {
//     try {
//         await connectDB();
//         console.log(`express is working on http://localhost:${port}`);
//     }
//     catch (error) {
//         console.log('Error while connecting db', error);
//     }
// });






//% tutorial 
//? starting server
///? crating database Schema 
//? user APIs
//% use req.body for getting data in api as using params is not secure
//% IMP NOTE : use await for  every mongoose functions like findOne/ deleteOne
// the following apis user route is ==> localhost/api/v1/users
// /new
// /all 
// /email - adminOnly
// /delete - adminOnly

//? custom error handler
// create a middleware called errorHandler in middleware folder which takes error,req,res,next as args and handles them accordingly and use this errorHandler in 

// app.use(errorHandler, (err, req, res, next) => {
//     res.send().json({
//         status : req.statusCode,
//         message : `error ${err}`
//     })
// })


//? middleware admin and multer


//? product APIs
// product schema and apis 
//% NOTE : don't forget to use single upload for files 
// new 
// latest Product
// category
// admin-products

// singleProduct by id
// updateProduct by id  put request
/* NOTE : take id and find product by id
once found we can easily update the attributes of product stored in DB with the new provided info
then await Product.save() */
// deleteProduct by id  delete request 
// all Products for admin only 
// search products api 
/*
this api is one of the most imp api so be careful 
- we take searchKeyword, category, price, sort info from query
- create a helper object based on the data provided 
- pass that object in the mongoose.find({}) method and get all products as per the filters
- NOTE : user regex, options,  lte, etc things for specific product searches 
- create pagination
- create dummy data from faker-js 
*/
//? caching the data
/* caching can  be done using node-cache package
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );
-- myCahe will work similar to localStorage but it will use computer ram 
-- we can use get and set methods and to store methods in JSON format
- cache latestProducts, singleProducts, adminProducts(ALL), productCategory  
-- take measures for invalidating cache data ()
*/
//? env & morgan setup   
//? orders APIs

// newOrder
// - add a function in feature to reduce stock
// myOrder
// adminOrders
// orderDetails
// orderUpdate
// orderDelete
// work on improving caching 
//? coupon schema and api (discount)
// create coupon schema which contains code and amount 
// create coupon api 
//   createCoupon, singeCoupon, allCoupon, updatecoupon, deleteCoupon, applydiscount,
//? payment route

//? admin dashBoard Stats 
//* current task \bookmark\ time : 5.20 
// Apis
    //% /stats : 
//          Database Queries :
// Fetches data related to products, users, and orders for the current and previous months. It also fetches counts of products, users, and orders over different periods, and the latest transactions.
//          Calculations :
// Revenue: Total income from orders.
// Change Percentages: Percentage changes in revenue, product additions, user registrations, and order counts from last month to this month.
// Monthly Order Counts and Revenue: Counts of orders and their revenue over the last six months.
// Category Count: Inventory counts per product category.
// User Ratio: Ratio of male to female users.
// Latest Transactions: List of recent transactions with specific details.
    //% /pie :
    // fetching the following data from DB 
    // processingOrders,
    // shippedOrders,
    // deliveredOrders,
    // productCount,
    // categories,
    // outOfstock,
    
    // allOrders,
    // allUsersDob,
    // admins,
    // users,
    //% /bar : 
    // fetching sixMonthProducts, sixMonthUser, twelveMonthOrders from DB
    //% /line : 
    // fetching products, user, orders, dicount, revenue over last 12 months
//? payment Integration 

    //* remaining
    // - caching