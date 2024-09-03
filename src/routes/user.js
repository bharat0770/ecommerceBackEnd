const  express = require("express");
const {newUser, allUser, oneUser, deleteUser } = require("../controllers/user.js");
const adminOnly = require("../middlewares/adminOnly.js");

const app = express();

// route - localhost:4000/api/v1/users/new
app.post("/new", newUser);

// route - localhost:4000/api/v1/users/all 
app.get("/all", adminOnly, allUser); 

// route - localhost:4000/api/v1/users/email 
app.get("/email", oneUser); 

// route - localhost:4000/api/v1/users/delete 
app.delete("/delete", adminOnly, deleteUser); 

// app.get("/upload", uploadFile);

module.exports = app;   