const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [ true, "Please provide your full name" ],
    },

    email: {
        type: String,
        required: [ true, "Please provide an Email" ],
        unique: [ true, "Email exists" ],
    },

    password: {
        type: String,
        required: [ true, "Please provide a password" ],
    },
})

module.exports = mongoose.model.Users || mongoose.model("Users", userSchema);