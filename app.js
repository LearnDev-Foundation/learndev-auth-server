const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
const auth = require("./auth");

dbConnect();

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.get("/", (request, response, next) => {
//   response.json({ message: "Hey! This is your server response!" });
//   next();
// });

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

app.post("/login", (request, response) => {
  User.findOne({ email: request.body.email })
    .then((user) => {
      bcrypt.compare(request.body.password, user.password)
        .then((passwordCheck) => {
          if(!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM_TOKEN"
          );

          response.status(200).send({
            message: "Login Successful",
            id: user._id,
            email: user.email,
            token,
          });
        })
        .catch((error) => {
          response.status(400).send({
            message: "Password does not match",
            error,
          });
        });
    })
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

app.post("/changepassword", auth, (request, response) => {
  User.findOne({ _id:request.body.id })
    .then((user) => {
      // console.log(user);
      bcrypt.compare(request.body.password, user.password)
        .then(() => {
          bcrypt.hash(request.body.newpassword, 10)
            .then((hashedPassword) => {
              user.password = hashedPassword;
              user.save()
                .then((result) => {
                  response.status(201).send({
                    message: "Password successfully changed",
                    result,
                  });
                })
                .catch((error) => {
                  response.status(500).send({
                    message: "Error changing password",
                    error,
                  });
                });
            })
            .catch((error) => {
              response.status(500).send({
                message: "Password was not hashed succesfully",
                error,
              });
            });
        })
        .catch((error) => {
          response.status(500).send({
            message: "Current Password is Incorrect",
            error,
          });
        });
    })
    .catch((e) => {
      response.status(401).send({
        message: "Login to access resource",
        e,
      });
    });
});



module.exports = app;