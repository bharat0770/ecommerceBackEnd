const fs = require("fs");
const Product = require("../models/product.js");
const errorHandler = require("../middlewares/errorHandler.js");
const { invalidateCache, validateCache, getCache, setCache } = require("../util/features.js");
const path = require("path");



const newProduct = async (req, res, next) => {
    try {
        let { name, price, stock, category } = req.body;
        let { file } = req;
        let checkExistingProduct = await Product.findOne({ name });
        if (checkExistingProduct) {
            return res.send("product already exists");
        }
        let photo = file;
        if (!name || !price || !stock || !category) {
            if (photo) {
                fs.rm(photo.path, (err) => {
                    if(err){
                        return next(new errorHandler(err.message), 401);
                    }
                })
            }
            return next(new errorHandler("Required details of product are not provided", 500));
        }
        if (!photo) {
            return next(new errorHandler("Please provide photo of product", 500));
        }
        let relativepath = photo?.path.split("\\")
        // relativepath = relativepath[relativepath.length - 1];  
        relativepath = relativepath.pop();
        let product = await Product.create({
            name,
            price,
            stock,
            category: category.toLowerCase(),
            photo : relativepath,
        })
        invalidateCache({ product: true });
        if (!product) {
            return next(new errorHandler("product cannot be created", 500));
        }
        return res.status(200).json({
            success: true,
            message: "product created successfully",
        });
    }
    catch (err) {
        return next(new errorHandler(err.message, 400));
    }
};
const latestProduct = async (req, res, next) => {
    try {
        let products;
        if (validateCache("latest-Product")) {
            products = getCache("latest-Product");
        }
        else {
            products = await Product.find().sort({ createdAt: -1 }).limit(5);
            setCache("latest-Product", products);
        }
        return res.status(200).json({
            success: true,
            message: products
            // message : "List of latest products"
        })
    } catch (err) {
        return next(new errorHandler(err.message, 400));
    }
}
const productCategories = async (req, res, next) => {
    try {
        let categories;
        if (validateCache("product-categories")) {
            categories = getCache("product-categories");
        } else {
            categories = await Product.distinct("category");
            setCache("product-categories", categories);
        }
        return res.status(200).json({
            success: true,
            message: categories
        })
    } catch (err) {
        return next(new errorHandler(err.message, 400));
    }
}
const adminProducts = async (req, res, next) => {
    try {
        let products;
        if (validateCache("all-products")) {
            products = getCache("all-products");
        } else {
            products = await Product.find();
            setCache("all-products", products);
        }
        return res.status(200).json({
            success: true,
            message: products
        })
    } catch (err) {
        return next(new errorHandler(err.message, 400));
    }
}
const singleProduct = async (req, res, next) => {
    try {
        const id = req.query.id;
        // const id = req.params.id;
        if (!id) return next(new errorHandler("Id not provided", 400));
        
        let product;
        if (validateCache(`product-${id}`)) {
            product = getCache(`product-${id}`);
        }
        else {
            product = await Product.findById({ _id: id });
            setCache(`product-${id}`, product);
        }
        if (!product) return next(new errorHandler("Invalid product id", 400));
        res.status(200).json({
            success: true,
            message: product,
        })
    } catch (err) {
        return next(new errorHandler(err.message, 400));
    }
}
const updateProduct = async (req, res, next) => {
    try {
        const id = req.query.id;
        if (!id) return next(new errorHandler("Id not provided", 400));
        const { name, stock, price, category } = req.body;
        const photo = req.file;
        const product = await Product.findById({ _id: id });
        if (!product) {
            return next(new errorHandler("Product doesn't exists", 400));
        }
        if (name) {
            product.name = name;
        }
        if (stock) {
            product.stock = stock;
        }
        if (price) {
            product.price = price;
        }
        if (category) {
            product.category = category;
        }
        if (photo) {
            if (product.photo){
                fs.rm(path.join(__dirname, `../../uploads/${product.photo}`), (err) => {
                    if (err) {
                        return next(new errorHandler(err.message), 401);
                    }
                })
            }
            let relativepath = photo.path.split("\\");
            relativepath = relativepath.pop();
            product.photo = relativepath;
        }
        let result = await product.save();
        invalidateCache({ product: true, id : product.id});
        res.status(200).json({
            success: true,
            message: result 
        })
    } catch (err) {
        return next(new errorHandler(err.message, 400));
    }
}
const deleteProduct = async (req, res, next) => {
    try {
        let id = req.query.id;
        if (!id) return next(new errorHandler("Id not provided", 400));
        let product = await Product.findById({ _id: id });
        if (!product) {
            return next(new errorHandler("Product doesn't exists", 400));
        }
        let photo = path.join(__dirname, `../../uploads/${product.photo}`);
        await Product.deleteOne({ _id: id });
        invalidateCache({ product: true });
        fs.rm(photo, (err) => {
            if(err){
                console.log(err.message); 
            }
        })
        res.status(200).json({
            success: true,
            message: "product deleted successfully",
        })
    } catch (err) {
        return next(new errorHandler(err.message, 400));
    }
    
}
const searchProduct = async (req, res, next) => {
    try {
        const { name, price, category } = req.query;
        let sort = req.query.sort;
        let page = Number(req.query.page) || 1;
        let limit = Number(process.env.productLimit) || 8;
        let skip = (page - 1) * limit;
        const queryObject = {};
        if (name) {
            queryObject.name = {
                $regex: name,
                $options: 'i',
            }
        }
        if (price) {
            queryObject.price = {
                $lte: price,
            }
        }
        if (category) {
            queryObject.category = category;
        } 
        const productsPerPagePromise = Product.find(queryObject).sort(sort && { price: sort === "asc" ? 1 : -1 }).limit(limit).skip(skip);
        const totalFilteredProductsPromise = Product.find(queryObject);
        const [productsPerPage, totalFilteredProducts] = await Promise.all([
            productsPerPagePromise,
            totalFilteredProductsPromise
        ])
        const totalPages = Math.ceil(totalFilteredProducts / limit) || 1;
        // const totalPages = 5;
        res.status(200).json({
            success: true,
            message: productsPerPage,
            totalPages, 
        })
    }
    catch (err) {
        return next(new errorHandler(err.message, 400));
    }
}
module.exports = {
    newProduct,
    latestProduct,
    productCategories,
    adminProducts,
    singleProduct,
    updateProduct,
    deleteProduct,
    searchProduct,

};


//! generating dummy prodcuts from faker
// const {faker} = require('@faker-js/faker');
// const generateFakeProduct = async (n) => {
//     const products = [];
//     for(let i = 0; i < n; i++){
//         const product = {
//             name : faker.commerce.productName(),
//             photo : "uploads\\fbc07be1-6fbf-4b0b-940b-1e324c1bcf55.webp",
//             price : faker.commerce.price({min : 1500, max : 80000, dec : 0}),
//             stock : faker.commerce.price({min : 0, max : 100, dec : 0}),
//             category : faker.commerce.department(),
//             createdAt : new   Date(faker.date.past()),
//             updateAt : new   Date(faker.date.recent()),
//             __V : 0,
//         }
//         products.push(product);
//     }
//     try{
//         await Product.create(products);
//     }catch(e){
//         console.log("error whilte creating products");
//     }
// }
// generateFakeProduct(40);

// const deleteFakeProduct = async () => {
//     let products = await Product.find({}).skip(2);
//     for(let i = 0; i < products.length; i++){
//         await products[i].deleteOne();
//     }
//     console.log("fake products deleted successfully");
// }
// deleteFakeProduct();
