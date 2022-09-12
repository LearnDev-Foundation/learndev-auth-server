const mongoose = require("mongoose");
require('dotenv').config()

async function dbConnect() {
    mongoose.connect(
        process.env.DB_URL,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        }
    )
    .then(() => {
        console.log("Successfully connected to MongoDB");
    })
    .catch((error) => {
        console.log("Unable to connect to MongoDB");
        console.log(error);
    })
}

module.exports = dbConnect