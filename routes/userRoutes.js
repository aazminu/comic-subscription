const express = require('express'); 
const router = express.Router();

const User = require('../models/User'); // User model

//Methods from the marvel file which are needed for this file
const { fetchCharacterByName, fetchSeriesByCharacterId, fetchComicsCountBySeriesId } = require('../services/marvelService');

// User signup route
router.post('/signup', async (req, res) => {
    //Isolates the details from the body of the request
    const { phone, email, comicSeries } = req.body;
    console.log("req recieved", req.body)
    
    //Ensures that there are the appropriate parameters in the request
    if (!phone || !email || !comicSeries || comicSeries.length === 0) {
        return res.status(400).send('Phone number, email, and comic series are required.');
    }

    try {
        // Check if a user with the same email or phone number already exists
        const existingUser = await User.findOne({ $or: [{ phone}, { email }] });
        if (existingUser) {
            return res.status(400).send('User already exists with this phone number or email.');
        }

        // Create a new user and store it in MongoDB
        const newUser = new User({ phone, email, comicSeries });
        await newUser.save();
        res.status(201).send('User signed up successfully!');
        console.log('New user is in! ')


    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).send('Error signing up user.');
    }
});

// Route to get character series by name
router.get('/character/:name/series', async (req, res) => {
    //Isolates the character's name from the request
    const characterName = req.params.name;
    try {
        //Fetches the character ID 
        const characterId = await fetchCharacterByName(characterName);
        if (!characterId) {
            return res.status(404).send('Character not found.');
        }  

        //Fetches the series' based off the character ID we previously isolated
        const series = await fetchSeriesByCharacterId(characterId);

        //edge case that might occur
        if (series.length === 0) {
            return res.status(404).send('No series found for this character.');
        }
        // Puts details into a json file to parse easily later on. 
        res.status(200).json({ character: characterName, series });
    } catch (error) {
        res.status(500).send('Error fetching character and series.');
    }
});


router.get('/series/:seriesId/comics', async (req, res) => {
    const seriesId = req.params.seriesId;
    try {
        //Fetch comics count
        const comicsCount = await fetchComicsCountBySeriesId(seriesId);  
        if (comicsCount === undefined) {
            // Edge case where there might not be any comics 
            throw new Error("Comics count not available");
        }
        //Puts details into a json file to parse easily later on
        res.status(200).json({ totalComics: comicsCount });
    } catch (error) {
        console.error('Error fetching comics count:', error.message);
        res.status(500).json({ error: 'Error fetching comics count', details: error.message });
    }
});
//allows router to be used in other files 
module.exports = router;
