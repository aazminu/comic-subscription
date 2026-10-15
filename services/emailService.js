const cron = require('node-cron');
const User = require('../models/User');
const { fetchComicsCountBySeriesId } = require('../services/marvelService');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY); 

//This file utilizes Send Grid to send emails. 

async function sendEmail(to, subject, htmlContent) {
    // sets up message schema 
    const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@comicsubscription.local',
        subject,
        html: htmlContent,
    };
    //calls send email method and logs success/failure in console
    try {
        await sgMail.send(msg);
        console.log('Email sent to:', to);
    } catch (error) {
        console.error('Error sending email:', error.response ? error.response.body : error.message);
    }
}


// This function will check for new chapters for each user
async function checkForNewChapters() {
    try {
        const users = await User.find(); // Get all users

        //Iterate through all users 
        for (const user of users) {
            let newChaptersFound = false;
            let newSeriesList = [];

            //iterates through the series the current user has
            for (const series of user.comicSeries) {
                //fetches the comic count based off series ID
                const currentComicsCount = await fetchComicsCountBySeriesId(series.seriesId);
                
                // Only trigger notification when actual new issues have been published
                if (currentComicsCount > series.chapters) {
                    newChaptersFound = true;
                    newSeriesList.push({ title: series.title, newChapters: currentComicsCount - series.chapters });
                    
                    // Update the stored number of chapters for this series
                    series.chapters = currentComicsCount;
                }
            }

            // If new chapters are found, send an email to the user
            if (newChaptersFound) {
                await sendEmailNotification(user.email, newSeriesList);
                await user.save(); // Save updated chapters count to the database
            }
        }
    } catch (error) {
        console.error('Error checking for new chapters:', error);
    }
}

// Function to send email when new chapters are found
async function sendEmailNotification(email, newSeriesList) {
    const subject = 'New Chapters Available for Your Subscribed Series';
    let htmlContent = '<p>The following series have new chapters available:</p><ul>';
    
    //Iterates through the new series and appends this data to the email 
    newSeriesList.forEach(series => {
        htmlContent += `<li>${series.title} - ${series.newChapters} new chapter(s)</li>`;
    });
    
    await sendEmail(email, subject, htmlContent);
}

// Function to check daily, not active right now. 
// cron.schedule('0 0 * * *', () => {
//     console.log('Running daily check for new chapters');
//     checkForNewChapters();
// });

module.exports ={
    checkForNewChapters,
    sendEmailNotification

}; 
