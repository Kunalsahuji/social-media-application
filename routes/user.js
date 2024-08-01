var express = require('express');
var router = express.Router();
// const path = require('path');
// const fs = require('fs');
// const upload = require('../utils/multer')
// const User = require('../model/userModel')
// const Post = require('../model/postModel')
// const passport = require('passport');
// const LocalStrategy = require('passport-local');
// const sendmail = require("../utils/mail")
// passport.use(new LocalStrategy(User.authenticate()))
const {
  isLoggedIn,
  getUser,
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  getForgetUser,
  getAbout,
  getLogoutUser,
  getUpdateUser,
  postUpdateUser,
  getResetPassword,
  postResetPassword,
  getForgetEmail,
  postForgetEmail,
  getForgetPassword,
  postForgetPassword,
  deleteUser
} = require('../controllers/userController')

// homepage
router.get('/', getUser);

// get login page
router.get('/login', getLogin);

// post login page
router.post('/login-user', postLogin, (req, res, next) => { });

// get register page
router.get('/register', getRegister);

// post register page
router.post('/register-user', postRegister);

//get forget-user
router.get('/forget-user', getForgetUser);

// get about page
router.get('/about', getAbout);

// get logout-user
router.get('/logout-user/:id', isLoggedIn, getLogoutUser);

// get update-user/:id
router.get('/update-user/:id', isLoggedIn, getUpdateUser);

// post update-user/:id
router.post('/update-user/:id', isLoggedIn, postUpdateUser);

//get reset-password/:id
router.get('/reset-password/:id', isLoggedIn, getResetPassword);

//post reset-password/:id
router.post('/reset-password/:id', isLoggedIn, postResetPassword);

//get forget-email/:id
router.get('/forget-email/', getForgetEmail);

//post forget-email/:id
router.post('/forget-email/', postForgetEmail);

//get forget-password/:id
router.get('/forget-password/:id', getForgetPassword);

//post forget-password/:id
router.post('/forget-password/:id', postForgetPassword);

//get delete-user/:id
router.get('/delete-user/:id', isLoggedIn, deleteUser);

module.exports = router;

