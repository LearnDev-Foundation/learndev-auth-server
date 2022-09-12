const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const dbConnect = require("./db/dbConnect")
const User = require("./db/userModel");

dbConnect();

// body parser configuration
app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

app.post("/register", (request, response) => {
  bcrypt.hash(request.body.password, 10)
    .then((hashedPassword) => {
      const user = new User({
        name: request.body.name,
        email: request.body.email,
        password: hashedPassword
      });
      user.save()
        .then((result) => {
          response.status(201).send({
            message: "User Created Succesfully",
            result,
          });
        })
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed succesfully",
        e,
      });
    });
});

module.exports = app;