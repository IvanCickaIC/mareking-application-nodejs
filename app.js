const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const userRoutes = require('./routes/userRoutes')
const flash = require('express-flash')
const session = require('express-session')
const path = require('path'); // Require path module
require('dotenv').config() //varables form env are loaded when i start app

const app = express()
const port = 3000



 // Set up middleware to serve static files from the root directory
app.use(express.static(__dirname));

app.use(bodyParser.json())
app.set('view-engine', 'ejs')


app.use(express.urlencoded({extended : false}))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use('/',userRoutes)


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
