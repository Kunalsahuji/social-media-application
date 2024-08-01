var express = require('express');
var router = express.Router();
const  isLoggedIn  = require('../utils/auth')
const path = require('path');
const fs = require('fs');
const upload = require('../utils/multer')
const User = require('../model/userModel')
const Post = require('../model/postModel')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const sendmail = require("../utils/mail")
passport.use(new LocalStrategy(User.authenticate()))

// homepage
router.get('/', (req, res, next) => {
  res.render('index', { user: req.user });
});

// get login page
router.get('/login', function (req, res, next) {
  res.render('login', { user: req.user });
});

// post login page
router.post('/login-user',
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login"
  }),
  function (req, res, next) {
  });

// get register page
router.get('/register', function (req, res, next) {
  res.render('register', { user: req.user });
});

// post register page
router.post('/register-user', async function (req, res, next) {
  try {
    const { name, username, email, password } = req.body;
    await User.register(
      { name, username, email }, password
    )
    res.redirect('/login',);
  } catch (error) {
    console.log(error)
    res.send(error.message)
  }
});

//get forget-user
router.get('/forget-user', function (req, res, next) {
  res.render('fotget-user',);
});

// get about page
router.get('/about', function (req, res, next) {
  res.render('about', { user: req.user });
});

// get logout-user
router.get('/logout-user/:id', isLoggedIn, function (req, res, next) {
  req.logout(() => {
    res.redirect('/login')
  })
});

// get update-user/:id
router.get('/update-user/:id', isLoggedIn, function (req, res, next) {
  res.render('update-user', { user: req.user });
});

// post update-user/:id
router.post('/update-user/:id', isLoggedIn, async (req, res, next) => {
  try {
    const id = req.params.id
    await User.findByIdAndUpdate(id, req.body)
    console.log(`Updated User: ${req.user}`)
    res.redirect('/profile')
  } catch (error) {
    res.send(error)
  }
});

//get reset-password/:id
router.get('/reset-password/:id', isLoggedIn, function (req, res, next) {
  res.render('reset-password', { user: req.user });
});

//post reset-password/:id
router.post('/reset-password/:id', isLoggedIn, async function (req, res, next) {
  try {
    await req.user.changePassword(
      req.body.oldPassword,
      req.body.newPassword,
    )
    req.user.save()
    res.redirect(`/update-user/${req.user._id}`);
  } catch (error) {
    console.log(error)
    res.send(error)
  }
});

//get forget-email/:id
router.get('/forget-email/', function (req, res, next) {
  res.render('forget-email', { user: req.user });
});

//post forget-email/:id
router.post('/forget-email/', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.forgetEmail })
    if (user) {
      const url = `${req.protocol}://${req.get("host")}/forget-password/${user._id}`
      console.log(`url = ${url}`)
      sendmail(res, user, url)
    }
    else {
      res.redirect("/forget-email")
    }
  } catch (error) {
    console.log(error)
    res.send(error)
  }
});

//get forget-password/:id
router.get('/forget-password/:id', function (req, res, next) {
  res.render('forget-password', { user: req.user, id: req.params.id });
});

//post forget-password/:id
router.post('/forget-password/:id', async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id)
    if (user.resetPasswordToken === 1) {
      await user.setPassword(req.body.newPassword);
      user.resetPasswordToken = 0;
      await user.save();
      res.redirect('/login')
    } else {
      res.send("Link Expired. Try Again!");
    }
  } catch (error) {
    console.log(error.message)
    res.send(error)
  }
});

//get delete-user/:id
router.get('/delete-user/:id', isLoggedIn, async (req, res, next) => {
  try {
    const id = req.params.id
    const deletedUser = await User.findByIdAndDelete(id)
    if (deletedUser.profilePic !== "Default.png") {
      fs.unlinkSync(path.join(__dirname, "..", "public", "images", deletedUser.profilePic))
    }
    deletedUser.posts.forEach(async (postid) => {
      const deletedPost = await Post.findByIdAndDelete(postid)
      // console.log(`deletedPost : ${deletedPost}`)
      fs.unlinkSync(path.join(__dirname, "..", "public", "images", deletedPost.media))
    })
    res.redirect("/login")
  } catch (error) {
    console.log(error)
    res.send(error)
  }
});

//get profile page
router.get('/profile', isLoggedIn, async (req, res, next) => {
  try {
    const posts = await Post.find().populate("user")
    posts.forEach((elem) => {
      console.log(`ye mera h ${elem.user.username}`)
    })
    res.render('profile', { user: req.user, posts });
  } catch (error) {
    console.log(error.message)
    res.send(error)
  }
});

// get timeline page
router.get('/timeline', isLoggedIn, async (req, res, next) => {
  try {
    res.render('timeline', { user: await req.user.populate("posts") });
  } catch (error) {
    console.log(error.message)
    res.send(error)
  }
});

//get delete-post/:id
router.get('/delete-post/:id', isLoggedIn, async (req, res, next) => {
  try {
    const deletepost = await Post.findByIdAndDelete(req.params.id)
    fs.unlinkSync(path.join(__dirname, "..", 'public', 'images', deletepost.media))
    res.redirect('/timeline')
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})

//get update-post/:id
router.get('/update-post/:id', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
    res.render('update-post', { user: req.user, post })
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})

//post update-post/:id
router.post('/update-post/:pid', isLoggedIn, async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(req.params.pid, req.body)
  // res.redirect(`/update-post/${req.params.pid}`)
  res.redirect(`/timeline`)

})

//post post-image/:id
router.post('/post-image/:pid', isLoggedIn, upload.single("media"), async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.pid)
    fs.unlinkSync(path.join(__dirname, "..", "public", "images", post.media))
    post.media = req.file.filename
    await post.save()
    res.redirect(`/update-post/${req.params.pid}`)
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})

// get create-post
router.get('/create-post/', isLoggedIn, (req, res, next) => {
  res.render('create-post', { user: req.user })
})

//post create-post
router.post('/create-post/', isLoggedIn, upload.single("media"), async (req, res, next) => {
  try {
    const newPost = new Post({
      media: req.file.filename,
      title: req.body.title,
      user: req.user._id,
    })

    req.user.posts.push(newPost._id)
    await newPost.save()
    await req.user.save()
    console.log(`Post Create:-- user: ${req.user}\npost: ${newPost}`)
    res.redirect('/profile')
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})

// post image/:id
router.post("/image/:id", isLoggedIn, upload.single("profilePic"), async (req, res, next) => {
  try {
    if (req.user.profilePic !== "Default.png") {
      fs.unlinkSync(path.join(__dirname, "..", "public", "images", req.user.profilePic))
    }
    req.user.profilePic = req.file.filename
    await req.user.save()
    res.redirect(`/update-user/${req.params.id}`)
  } catch (error) {
    console.log(error.message)
    res.send(error)
  }
})

// get like/:id
router.get('/like/:postid', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postid)
    if (post.likes.includes(req.user._id)) {
      post.likes = post.likes.filter((uid) => uid != req.user.id)
    }
    else {
      post.likes.push(req.user.id)
    }
    await post.save()
    res.redirect('/profile')
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})

// get likes/:id
router.get('/likes/:postid', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postid)
    if (post.likes.includes(req.user._id)) {
      post.likes = post.likes.filter((uid) => uid != req.user.id)
    }
    else {
      post.likes.push(req.user.id)
    }
    await post.save()
    res.redirect('/timeline')
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})

module.exports = router;
