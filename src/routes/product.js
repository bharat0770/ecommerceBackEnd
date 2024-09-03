const  express = require("express");
const { newProduct, latestProduct, productCategories,  adminProducts, singleProduct, deleteProduct, updateProduct, allProducts, searchProduct } = require("../controllers/product");
const upload = require("../middlewares/multer");
const adminOnly = require("../middlewares/adminOnly");

const app = express();

// route to post new product in DB : localhost/api/v1/product/newProduct/?email=ghi@gmail.com
app.post("/new", adminOnly, upload.single("photo"),newProduct); 
// route to get categories of product for filter : localhost/api/v1/product/productCategories
app.get("/categories", productCategories);
// route to get 5 latest product sorted by date (homeScreen): localhost/api/v1/product/latest
app.get("/latest",latestProduct);
// route to get all products (admin only)  localhost/api/v1/product/admin-product/?email=ghi@gmail.com
app.get("/admin-products",adminOnly, adminProducts);

// app.route("/id").get().put().delete();
app.get("/id", singleProduct); 
// app.get("/:id", singleProduct); 
app.delete("/id",adminOnly, deleteProduct); 
app.put("/id", adminOnly, upload.single("photo"), updateProduct); 

// searching products for search page : localhost/api/v1/products/search/query
app.get("/search", searchProduct); 

module.exports = app;   