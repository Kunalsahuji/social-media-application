var express = require('express');
var router = express.Router();

const path = require('path');
const fs = require('fs');
const upload = require('../utils/multer').single("profilePic");
const User = require('../model/userModel')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const sendmail = require("../utils/mail")
passport.use(new LocalStrategy(User.authenticate()))


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { user: req.user });
});

router.get('/login', function (req, res, next) {
  res.render('login', { user: req.user });
});

router.post('/login-user',
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login"
  }),
  function (req, res, next) {
  });

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  }
  else {
    res.redirect('/login')
  }
}

router.get('/register', function (req, res, next) {
  res.render('register', { user: req.user });
});

router.post('/register-user', async function (req, res, next) {
  try {
    const { name, username, email, password } = req.body;
    await User.register(
      { name, username, email }, password
    )
    res.redirect('/login',);

    // const newUser = new User(req.body)
    // await newUser.save()
    // res.redirect('/login',);
  } catch (error) {
    // console.log(error)
    res.send(error.message)
  }
});

router.get('/forget-user', function (req, res, next) {
  res.render('fotget-user',);
});

router.get('/about', function (req, res, next) {
  res.render('about', { user: req.user });
});
router.get('/profile', isLoggedIn, async (req, res, next) => {
  // const user = await User.findById(req)
  console.log(req.user)
  res.render('profile', { user: req.user });
});


router.get('/logout-user/:id', isLoggedIn, function (req, res, next) {
  req.logout(() => {
    res.redirect('/login')
  })

});

router.get('/update-user/:id', isLoggedIn, function (req, res, next) {
  console.log(req.user)
  res.render('update-user', { user: req.user });
});
router.post('/update-user/:id', isLoggedIn, async (req, res, next) => {
  try {
    const id = req.params.id
    await User.findByIdAndUpdate(id, req.body)

    // console.log(req.user)
    // res.render('update-user', { user: req.user });
    // console.log("User Updated!")
    res.redirect('/profile')
  } catch (error) {
    res.send(error)
  }
});



router.get('/reset-password/:id', isLoggedIn, function (req, res, next) {
  res.render('reset-password', { user: req.user });
});

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


router.get('/forget-email/', function (req, res, next) {
  res.render('forget-email', { user: req.user });
});

router.post('/forget-email/', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.forgetEmail })
    // res.redirect(`/forget-password/${user._id}`)
    if (user) {
      // const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      const url = `${req.protocol}://${req.get("host")}/forget-password/${user._id}`
      console.log(`url = ${url}`)
      sendmail(res, user, url)
      // res.redirect(`/forget-password/${user._id}`)
    }
    else {
      res.redirect("/forget-email")
    }
  } catch (error) {
    console.log(error)
    res.send(error)
  }
});


router.get('/forget-password/:id', function (req, res, next) {
  res.render('forget-password', { user: req.user, id: req.params.id });
});

router.post('/forget-password/:id', async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id)
    // await user.setPassword(req.body.newPassword)
    if (user.resetPasswordToken === 1) {
      await user.setPassword(req.body.newPassword);
      user.resetPasswordToken = 0;
      await user.save();
      res.redirect('/login')
    } else {
      res.send("Link Expired Try Again!");
    }
  } catch (error) {
    console.log(error.message)
    res.send(error)
  }
});

router.get('/delete-user/:id', isLoggedIn, async (req, res, next) => {
  try {
    const id = req.params.id
    const deleteUser = await User.findByIdAndDelete(id)
    if (deleteUser.profilePic !== "Default.png") {
      fs.unlinkSync(path.join(__dirname, "..", "public", "images", deleteUser.profilePic))
    }
    res.redirect("/login")
  } catch (error) {
    console.log(error)
    res.send(error)
  }
});


router.post("/image/:id", isLoggedIn, upload, async (req, res, next) => {
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

module.exports = router;
