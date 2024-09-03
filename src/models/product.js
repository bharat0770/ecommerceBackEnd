const mongoose = require("mongoose");


const schema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide product name"]
    },
    photo: {
        type: String,
        required: [true, "Please provide product photo"]
    },
    price: {
        type: Number,
        required: [true, "Please provide product price"],
        validate(value) {
            if (value < 0) throw new Error("Price cannot be negative");
        }
    },
    stock: {
        type: Number,
        required: [true, "Please provide product stock"]
    },
    category: {
        type: String,
        required: [true, "Please provide product category"],
        trim : true,
    }

}, 
{
    timestamps: true,
})

const Product = mongoose.model("Products", schema);

module.exports = Product; 