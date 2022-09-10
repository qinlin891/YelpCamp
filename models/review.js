//Require necessary node modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//define mongo review schema 
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model("Review", reviewSchema);