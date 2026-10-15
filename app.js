require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const mongoose = require('./config/db'); // Import database connection
const userRoutes = require('./routes/userRoutes'); // Import routes
const { sendSMS } = require('./services/twilioService');
const path = require('path');
const { fetchComicsCountBySeriesId } = require('./services/marvelService');  // Import your Marvel API functions
const User = require('./models/User');  // Import your User model
const { checkForNewChapters, sendEmailNotification } = require('./services/emailService');  // You'll need to define this service to send emails



const app = express();

app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api', userRoutes); 


//checks for new chapters

(async () => {
    console.log('Running manual check for new chapters');
    await checkForNewChapters();
})();


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//sendSMS('4253620045', 'Hello! This is a test message from your app.');
