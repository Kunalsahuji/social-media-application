const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "Title is required"],
        minLength: [4, "Title must be atleast 4 charecters long"],
    },
    media: {
        type: String,
        required: [true, "Media is required"],
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId, ref: "user"
    },

}, { timestamps: true }
)
const Post = mongoose.model("post", postSchema)
module.exports = Post