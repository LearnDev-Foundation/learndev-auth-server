const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const crypto = require('crypto');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');

const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");

const Token = require("./db/token");
const sendEmail = require("./utils/sendEmail");

dbConnect();

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const oneDay = 1000 * 60 * 60 * 24;

app.use(sessions({
  secret: process.env.SESSION_SECRET,
  secure: true,
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}));
app.use(cookieParser());

var session;

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
            message: "Email already registered",
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
          // if(!passwordCheck) {
          //   return response.status(400).send({
          //     message: "Passwords does not match",
          //     error,
          //   });
          // }

          session = request.session;
          session.userId = user._id;

          response.status(200).send({
            message: "Login Successful",
            id: user._id,
            email: user.email,
            session
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
        message: "User with given email does not exist",
        e,
      });
    });
});

app.post("/changepassword", (request, response) => {
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

app.post("forgotpassword", (request, response) => {
  User.findOne({ email:request.body.email })
    .then((user) => {
      Token.findOne({ userId: user._id })
        .then((token) => {        
          if (!token) {
            token = new Token({
              userId: user._id,
              token: crypto.randomBytes(32).toString("hex"),
            }).save();
          }
          const link = `${process.env.BASEURL}/password-reset/${user.id}/${token.token}`;
          sendEmail(user.email, "Password Reset", link);
    
          response.send("Password reset link sent");
        })
        .catch((error) => {
          response.send({
            message: "An error occured",
            error,
          });
        });
    })
    .catch((error) => {
      response.status(404).send({
        message: "User with given email does not exist",
        error,
      });
    });
})

module.exports = app;