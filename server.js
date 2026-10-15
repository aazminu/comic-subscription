const express = require('express');
const userRoutes = require('./routes/userRoutes'); // Link to the routes file

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Routes
app.use('/api', userRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
