
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const {initializePassport, checkAuthenticated, checkNotAuthenticated} = require('./auth')


const app = express();
mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true}, () => {
    console.log('---Mongodb connected ---');
})

const users = []; // TOD: user will go to db

initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req,res) => {
  res.render('index.ejs', {name: req.user.name});
})

app.get('/login', checkNotAuthenticated, (req,res) => {
  res.render('login.ejs');
})
app.post('/login', checkNotAuthenticated, passport.authenticate('signin', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))
app.get('/register', checkNotAuthenticated, (req,res) => {
  res.render('register.ejs');
})
app.post('/register', checkNotAuthenticated, async (req,res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch (error) {
    res.redirect('/register')
  }

})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})
app.listen(3000);
