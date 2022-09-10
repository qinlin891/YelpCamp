//Require necessary node modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

//Define user mongo schema
const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    }
});

//add username and password into model
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);