const  express = require("express");
const adminOnly = require("../middlewares/adminOnly");
const { newOrder, myOrders, singleOrder, allOrders, deleteOrder, processOrder } = require("../controllers/oders");
const app = express();
app.post("/new", newOrder); 
app.get("/my", myOrders);
app.route("/id").get(singleOrder).put(processOrder).delete(deleteOrder);
app.get("/all", adminOnly, allOrders);
module.exports = app;   