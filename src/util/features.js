const mongoose = require("mongoose");
const Product = require("../models/product");
const nodeCache = require("node-cache");
const myCache = new nodeCache();
const connectDB = () => {
    // mongoose.connect("mongodb://localhost:27017", {
    //     dbName : "Ecommerce_24", 
    // })
    // .then((c) => { console.log(`DB connectred to ${c.connection.host}`)})
    // .catch((e) => {console.log(e)});
    // return mongoose.connect("mongodb://localhost:27017/Ecommerce_24");
    
    return mongoose.connect(process.env.MONGO_URL);
};

const setCache = (key, productList) => {
    myCache.set(key, JSON.stringify(productList));
}
const getCache = (key) => {
    if (myCache.has(key)) {
        return JSON.parse(myCache.get(key));
    }
}
const validateCache = (key) => {
    return myCache.has(key);
}
const invalidateCache = async (props) => {
    try {
        const { product, order, admin, id} = props;
        if (product) {
            let productkeys = [
                "latest-Product",
                "product-categories",
                "all-products",
                `product-${id}`
            ];
            // const productIds = await Product.find({}).select("_id");
            // productIds.forEach((id) => {
            //     productkeys.push(`product-${id}`);
            // })
            myCache.del(productkeys);
        }
        if (order) { }
        if (admin) { }
    } catch (error) {
        console.log("error" + error.message);
    }
}

const reduceStock = async (orderItems) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if (!product) throw new Error("Product Not Found");
        product.stock -= order.quantity;
        await product.save();
    }
};

const calculatePercentage = (thisMonth, lastMonth) => {
    // dividing the marks obtained with the total marks * 100
    let percent;
    if (lastMonth === 0) {
        percent = thisMonth * 100;
    } else {
        percent = (thisMonth / lastMonth) * 100;
    }

    // the following function converts the num in string and rounds it to 2 decimal places
    return Number(percent.toFixed(2));
}


const getInventory = async (categories, productCount) => {
    try {
        // Create promises to count the number of products in each category
        let categoryCountPromise = categories.map(category => {
            return Product.countDocuments({ category });
        });

        // Await the resolution of all promises
        let categoryProductCount = await Promise.all(categoryCountPromise);

        // Calculate the percentage of total products for each category
        let categoryCount = categories.map((category, i) => (
            {
            name : category, 
            value : Math.floor((categoryProductCount[i] / productCount) * 100)
        }
    ));

        return categoryCount;
    } catch (err) {
        return new Error(err.message);
    }
};


const getChartData = (length, today, docArray, property = "") => {
    let  arr = new Array(length).fill(0) 
    docArray.forEach((elem) => {
        let  creationDate = elem.createdAt; 
        let monthDiff = (today.getMonth() - creationDate.getMonth() +12) %12;  
        if(monthDiff < length){
            if(property !== ""){
                arr[length - monthDiff - 1] += elem[property]; 
            }else{
                arr[length - monthDiff - 1] += 1; 
            }
        }
    }); 
    return arr;     
}
module.exports = {
    connectDB,
    getCache,
    setCache,
    validateCache,
    invalidateCache,
    reduceStock,
    calculatePercentage,
    getInventory,
    getChartData,
};




