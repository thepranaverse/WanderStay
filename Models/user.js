const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    // as we know that name & pwd are auto set by passort so we just declare email
    // you can add extra field also
    email: {
        type: String,
        required: true 
    },
});

userSchema.plugin(passportLocalMongoose); // beacuse he auto impleaments name,pwd,hashing,salting also add some methods
module.exports = mongoose.model("User", userSchema);
