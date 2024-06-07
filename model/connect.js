const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://social:social@kunalcluster.beakm07.mongodb.net/social-media?retryWrites=true&w=majority&appName=kunalcluster").then(() => {
    console.log("DB connected!")
}).catch((error) => {
    console.log(error.message)
})