var express = require('express');
var router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../utils/multer')
const User = require('../model/userModel')
const Post = require('../model/postModel')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const sendmail = require("../utils/mail")
passport.use(new LocalStrategy(User.authenticate()))

const {
  isLoggedIn,
  getProfile,
  timeline,

  deletePost,
  getUpdatePost,
  PostUpdatePost,
  postImage,
  getCreatePost,
  postCreatePost,
  PostImagePid,
  likeProfile,
  likesTimeline } = require('../controllers/profileController')
//get profile page
router.get('/profile', isLoggedIn, getProfile);

// get timeline page
router.get('/timeline', isLoggedIn, timeline);

//get delete-post/:id
router.get('/delete-post/:id', isLoggedIn, deletePost)

//get update-post/:id
router.get('/update-post/:id', isLoggedIn, getUpdatePost)

//post update-post/:id
router.post('/update-post/:pid', isLoggedIn, PostUpdatePost)

//post post-image/:id
router.post('/post-image/:pid', isLoggedIn, upload.single("media"), postImage)

// get create-post
router.get('/create-post/', isLoggedIn, getCreatePost)

//post create-post
router.post('/create-post/', isLoggedIn, upload.single("media"), postCreatePost)

// post image/:id
router.post("/image/:id", isLoggedIn, upload.single("profilePic"), PostImagePid)

// get like/:id
router.get('/like/:postid', isLoggedIn, likeProfile)

// get likes/:id
router.get('/likes/:postid', isLoggedIn, likesTimeline)
module.exports = router;
