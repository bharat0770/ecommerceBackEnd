const express = require('express');
const { connectDB, invalidateCache } = require('./util/features.js');
// const Stripe = require("stripe");
const dotenv = require("dotenv");
const { config } = dotenv;
config();
const path = require('path');
const cors = require("cors");
// const upload = require('./middlewares/multer.js');
// const  newUser = require('./controllers/user.js');
//? importing  routes
const userRoute = require('./routes/user.js');
const productRoute = require('./routes/product.js');
const orderRoute = require("./routes/order.js");
const paymentRoute = require("./routes/payment.js");
const dashBoardRoute = require("./routes/stats.js")
const cartRoute = require("./routes/cart.js")


const port = process.env.PORT || 4000;
// const stripeKey = process.env.STRIPE_KEY || "";
const app = express();
app.use(express.json());
app.use(cors());
// const stripe = new Stripe(stripeKey);
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); 
app.use('/api/v1/user', userRoute);
app.use('/api/v1/product', productRoute);
app.use('/api/v1/order', orderRoute);
app.use('/api/v1/payment', paymentRoute);
app.use('/api/v1/dashboard', dashBoardRoute);
app.use('/api/v1/cart', cartRoute);


app.get('/uploads/:filename',(req, res) => {
    let filename= req.params.filename;
    res.sendFile(filename, (err) => {
        if (err) {
            res.status(404).send('File not found'); 
        }
    })
}); 
app.get('/', (req, res) => {
    res.send("working with /api/v1");
});
// error middlware 
app.use((err, req, res, next) => {
    return res.status(err.statusCode ?? 500).json({
        success: false,
        message: err.message ? err.message : "invalid reques"
    });
})

app.listen(port, async () => {
    try {
        await connectDB();
        console.log(`express is working on http://localhost:${port}`);
    }
    catch (error) {
        console.log('Error while connecting db', error);
    }
});

