
// Currently waiting for phone number to be approved

// const twilio = require('twilio');

// // Load environment variables from .env file
// const accountSid = process.env.TWILIO_ACCOUNT_SID;  // Your Twilio Account SID
// const authToken = process.env.TWILIO_AUTH_TOKEN;    // Your Twilio Auth Token
// const client = new twilio(accountSid, authToken);   // Create Twilio client

// const sendSMS = (to, message) => {
//     client.messages
//         .create({
//             body: message,                      // SMS body content
//             from: process.env.TWILIO_PHONE_NUMBER, // Twilio phone number from which SMS will be sent
//             to: to                              // Recipient's phone number
//         })
//         .then(message => console.log(`Message sent successfully: ${message.sid}`))
//         .catch(error => console.error('Error sending SMS:', error));
// };

// module.exports = { sendSMS };
