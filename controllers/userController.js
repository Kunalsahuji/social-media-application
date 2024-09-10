let express = require('express');
let router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../utils/multer')
const User = require('../model/userModel')
const Post = require('../model/postModel')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const sendmail = require("../utils/mail")
passport.use(new LocalStrategy(User.authenticate()))



const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    }
    else {
        res.redirect('/login')
    }
}

const getUser = (req, res, next) => {
    res.render('index', { user: req.user });
}

const getLogin = (req, res, next) => {
    res.render('login', { user: req.user });
}

const postLogin = passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login"
})

const getRegister = (req, res, next) => {
    res.render('register', { user: req.user });
}

const postRegister = async function (req, res, next) {
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
}

const getForgetUser = (req, res, next) => {
    res.render('fotget-user',);
}

const getAbout = (req, res, next) => {
    res.render('about', { user: req.user });
}

const getLogoutUser = function (req, res, next) {
    req.logout(() => {
        res.redirect('/login')
    })
}

const getUpdateUser = function (req, res, next) {
    res.render('update-user', { user: req.user });
}

const postUpdateUser = async (req, res, next) => {
    try {
        const id = req.params.id
        await User.findByIdAndUpdate(id, req.body)
        req.user.save()
        res.redirect('/profile')
    } catch (error) {
        res.send(error)
    }
}

const getResetPassword = function (req, res, next) {
    res.render('reset-password', { user: req.user });
}

const postResetPassword = async function (req, res, next) {
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
}

const getForgetEmail = function (req, res, next) {
    res.render('forget-email', { user: req.user });
}

const postForgetEmail = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.forgetEmail })
        if (user) {
            const url = `${req.protocol}://${req.get("host")}/forget-password/${user._id}`
            sendmail(res, user, url)
        }
        else {
            res.redirect("/forget-email")
        }
    } catch (error) {
        console.log(error)
        res.send(error)
    }
}

const getForgetPassword = function (req, res, next) {
    res.render('forget-password', { user: req.user, id: req.params.id });
}

const postForgetPassword = async function (req, res, next) {
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
}

const deleteUser = async (req, res, next) => {
    try {
        const id = req.params.id
        const deletedUser = await User.findByIdAndDelete(id)
        if (deletedUser.profilePic !== "Default.png") {
            fs.unlinkSync(path.join(__dirname, "..", "public", "images", deletedUser.profilePic))
        }
        deletedUser.posts.forEach(async (postid) => {
            const deletedPost = await Post.findByIdAndDelete(postid)
            fs.unlinkSync(path.join(__dirname, "..", "public", "images", deletedPost.media))
        })
        res.redirect("/login")
    } catch (error) {
        console.log(error)
        res.send(error)
    }
}

module.exports = {
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
}
