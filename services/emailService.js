const { fetchComicsCountBySeriesId, detectChapterDelta } = require('../services/marvelService');

let sgMail = null;
try {
    sgMail = require('@sendgrid/mail');
    if (process.env.SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
} catch (_) {
    sgMail = null;
}

function getDefaultUserModel() {
    return require('../models/User');
}

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function sendEmail(to, subject, htmlContent) {
    const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@comicsubscription.local',
        subject,
        html: htmlContent,
    };
    try {
        if (sgMail) {
            await sgMail.send(msg);
        }
        console.log('Email sent to:', to);
    } catch (error) {
        console.error('Error sending email:', error.response ? error.response.body : error.message);
    }
}

// Check for new chapters for each user using detectChapterDelta
async function checkForNewChapters(deps = {}) {
    const userModel = deps.userModel || getDefaultUserModel();
    const fetchCountFn = deps.fetchCountFn || fetchComicsCountBySeriesId;
    const notifyFn = deps.notifyFn || sendEmailNotification;

    try {
        const users = await userModel.find();

        for (const user of users) {
            const latestCounts = {};
            for (const series of user.comicSeries || []) {
                latestCounts[series.seriesId] = await fetchCountFn(series.seriesId);
            }

            const { updates, updatedSeries } = detectChapterDelta(user.comicSeries || [], latestCounts);

            if (updates.length > 0) {
                for (let i = 0; i < (user.comicSeries || []).length; i += 1) {
                    user.comicSeries[i].chapters = updatedSeries[i].chapters;
                }
                await notifyFn(user.email, updates);
                await user.save();
            }
        }
    } catch (error) {
        console.error('Error checking for new chapters:', error);
    }
}

// Function to send email when new chapters are found
async function sendEmailNotification(email, newSeriesList, sendFn = sendEmail) {
    const subject = 'New Chapters Available for Your Subscribed Series';
    let htmlContent = '<p>The following series have new chapters available:</p><ul>';

    (newSeriesList || []).forEach((series) => {
        htmlContent += `<li>${escapeHtml(series.title)} - ${Number(series.newChapters) || 0} new chapter(s)</li>`;
    });
    htmlContent += '</ul>';

    await sendFn(email, subject, htmlContent);
    return { to: email, subject, html: htmlContent };
}

module.exports = {
    checkForNewChapters,
    sendEmailNotification,
    escapeHtml,
};

