const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    media: {
        type: String,
        required: [true, "Media is required"],
    },
    title: {
        type: String,
        trim: true,
        required: [true, "Title is required"],
        minLength: [4, "Title must be atleast 4 charecters long"],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: "user"
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }]
}, { timestamps: true }
)
const Post = mongoose.model("post", postSchema)
module.exports = Post