const mongoose = require('mongoose'); //Import mongoose to access mongoDB

const userSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true }, //The user's phone number, which is stored as a string, required, and unique.
    email: { type: String, required: true, unique: true }, //The user's enmail, which is stored as a string, required, and unique.
    comicSeries: [{
        seriesId: { type: String, required: true },  // Series ID
        title: { type: String, required: true },     // Series title
        chapters: { type: Number, required: true }   // Number of chapters
    }], // Array of series with chapter count
}, { timestamps: true });


const User = mongoose.model('User', userSchema); //Creates a mongoose model based off the data

//Export the model so it can be used elsewhere 
module.exports = User;
