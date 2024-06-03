const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
const userSchema = new mongoose.Schema({
    profilePic: {
        type: String,
        default: "Default.png"
    },
    name: {
        type: String,
        required: [true, "Name is required!"],
        trim: true,
        minLength: [4, "Name must be atleast 4 charecter long"],
    },
    username: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: [true, "Username is required"],
        // match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid username']
        match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: [true, 'Email address is required'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: String,
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
    resetPasswordToken: {
        type: Number,
        default: 0,
    },
}, { timestamps: true })


userSchema.plugin(plm)
const User = mongoose.model('user', userSchema)
module.exports = User