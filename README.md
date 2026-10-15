# Comic Subscription Service

A full-stack Node.js, Express, and MongoDB web application that lets readers search Marvel comic series, subscribe to ongoing titles, and receive automated SendGrid email notifications when new chapters or issues are released.

## Features
- **Marvel API Integration (`services/marvelService.js`)**: Deterministic MD5 request signing (`ts + privateKey + publicKey`), series search by title prefix, issue count tracking, and chapter delta detection (`detectChapterDelta`).
- **Subscription & Authentication (`routes/auth.js`, `models/User.js`)**: Passport.js session authentication and per-user series watchlists stored in MongoDB.
- **Automated Release Notifications (`services/emailService.js`)**: Compares current Marvel series issue counts against stored user checkpoints and sends HTML digest emails via SendGrid.

## Quick Start
```bash
npm install
npm test
npm start
```