
const mongoose = require("mongoose");

const validator = require("validator");

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter your name"]
    },
    email: {
        type: String,
        required: [true, "please enter your name"],
        unique: [true, "enter already exists"],
        // validate: (value : string)=> validator.isEmail(value)
        validate: validator.default.isEmail,
    },
    photo: {
        type: String,
        required: [true, "please add photo"]
    },
    role: {
        type: String,
        required: [true, "please enter your role"],
        default: "user"
    },
    gender: {
        type: String,
        required: [true, "please enter gender"],
        enum: ["male", "female"],
    },
    dob: {
        type: Date,
        required: [true, "please enter DOB"],
    },
}, {
    timestamps: true,
});
schema.virtual('age').get(function () {
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();
    if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
});


const User = mongoose.model("User", schema);
module.exports = User;
