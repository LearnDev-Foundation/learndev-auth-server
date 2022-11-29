# LearnDev Foundation Authentication API

**This project is still in development**

## Installation

This project was built using `Node JS`. To install it first fill create a `.env` file to hold sensitive information.

The `.env` file should look like this

```.env
PORT=5000
NODE_ENV=development
PROJECT=LearnDev Foundation
APP_URL=localhost:800
VERIFIED_REDIRECT_URL=localhost:8000/
REDIRECT_URL=localhost:8000/

ALLOWED_ORIGINS=*

MONGODB_URI=

SESSION_SECRET=
SESSION_LIFE=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

EMAIL_USER=
EMAIL_PASS=
SMTP_PORT=
SECURE=false

JWT_SECRET=
REFRESH_TOKEN_LIFE=

SMS_API_KEY=
SMS_API_SECRET=
```

`MONGODB_URI` : This is your MongoDB Atlas Connection String.

`SESSION_SECRET` & `JWT_SECRET` : Secret Key for JSON Web Token and/or Express Session.

`SESSION_LIFE` & `REFRESH_TOKEN_LIFE` : Session (Cookie) expiration time.

`SMS_API_KEY` & `SMS_API_SECRET` : API keys to allow server connect to Vonage. To get this you have to create an account with Vonage.

`GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` : Google OAuth2 api client ID