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
require('dotenv').config();
passport.use(new LocalStrategy(User.authenticate()))



const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    }
    else {
        res.redirect('/login')
    }
}
const getProfile = async (req, res, next) => {
    try {
        const posts = await Post.find().populate("user")
        res.render('profile', { user: req.user, posts });
    } catch (error) {
        console.log(error.message)
        res.send(error)
    }
}
const timeline = async (req, res, next) => {
    try {
        res.render('timeline', { user: await req.user.populate("posts") });
    } catch (error) {
        console.log(error.message)
        res.send(error)
    }
}

const deletePost = async (req, res, next) => {
    try {
        const deletepost = await Post.findByIdAndDelete(req.params.id)
        fs.unlinkSync(path.join(__dirname, "..", 'public', 'images', deletepost.media))
        res.redirect('/timeline')
    } catch (error) {
        console.log(error)
        res.send(error)
    }
}

const getUpdatePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
        res.render('update-post', { user: req.user, post })
    } catch (error) {
        console.log(error)
        res.send(error)
    }
}

const PostUpdatePost = async (req, res, next) => {
    const post = await Post.findByIdAndUpdate(req.params.pid, req.body)
    res.redirect(`/timeline`)

}

const postImage = async (req, res, next) => {
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
}
const getCreatePost = (req, res, next) => {
    res.render('create-post', { user: req.user })
}
const postCreatePost = async (req, res, next) => {
    try {
        const newPost = new Post({
            media: req.file.filename,
            title: req.body.title,
            user: req.user._id,
        })
        req.user.posts.push(newPost._id)
        await newPost.save()
        await req.user.save()
        res.redirect('/profile')
    } catch (error) {
        console.log(error)
        res.send(error)
    }
}
const PostImagePid = async (req, res, next) => {
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
}
const likeProfile = async (req, res, next) => {
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
}
const likesTimeline = async (req, res, next) => {
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
}

module.exports = {
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
    likesTimeline,
}