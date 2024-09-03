const express = require("express"); 
const app = express();
const {addItemsToCart, removeItemsFromCart, getCart, clearCart} = require("../controllers/cart");


app.post("/add", addItemsToCart); 
app.patch("/remove", removeItemsFromCart); 
app.get("/getCart", getCart); 
app.get("/clearCart", clearCart); 

module.exports = app; 