const mongoose = require('mongoose'); //Import mongoose to access mongoDB


//Connect to Mongo Db using the string stored in the .env file
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        // If connection succeeds
        console.log('Connected to MongoDB Atlas');
    })
    .catch((error) => {
        //If connection fails
        console.error('Error connecting to MongoDB: ', error);
    });

    //Exports mongoose for use in other files
module.exports = mongoose;
