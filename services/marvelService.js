const axios = require('axios');
const crypto = require('crypto');
const publicKey = process.env.MARVEL_PUBLIC_KEY;
const privateKey = process.env.MARVEL_PRIVATE_KEY;
//the basic URL we build off of, allows for less typing 
const baseURL = 'https://gateway.marvel.com/v1/public';

// Marvel requires a hash function to be able to send a request, this is that, it uses 'md5'.
function generateHash(ts) {
    return crypto.createHash('md5').update(ts + privateKey + publicKey).digest('hex');
}


async function fetchCharacterByName(characterName) {
    //timestamps are also needed for the api request
    const ts = new Date().getTime();
    // generates hash from the derails
    const hash = generateHash(ts);

    try {
        //gets the character using the marvel API 
        const response = await axios.get(`${baseURL}/characters`, {
            
            params: { name: characterName, ts, apikey: publicKey, hash }
        });

        // stores the characters
        const characters = response.data.data.results;
        
        if (characters.length === 0) {
            console.log(`Character ${characterName} not found.`);
            return null;
        } else {
            //stores the ID for the character 
            const characterId = characters[0].id;
            console.log(`Character ID for ${characterName}: ${characterId}`);
            return characterId;
        }
    } catch (error) {
        console.error('Error fetching character:', error.response?.data || error.message);
        return null;
    }
}

async function fetchSeriesByCharacterId(characterId) {
    //timestamps are also needed for the api request
    const ts = new Date().getTime();
     // generates hash from the derails
    const hash = generateHash(ts);

    try {
        // sends a  request for the series 
        const response = await axios.get(`${baseURL}/characters/${characterId}/series`, {
            params: { ts, apikey: publicKey, hash }
        });

        //gets the list of series' 
        const seriesList = response.data.data.results;
        // 
        if (seriesList.length === 0) {
            console.log('No series found for this character.');
            return [];
        } else {
            console.log('Series List:', seriesList.map(series => series.title));
            return seriesList;
        }
    } catch (error) {
        console.error('Error fetching series:', error.response?.data || error.message);
        return [];
    }
}

async function fetchComicsCountBySeriesId(seriesId) {
    const ts = new Date().getTime();
    const hash = generateHash(ts);

    try {
        const response = await axios.get(`${baseURL}/series/${seriesId}/comics`, {
            params: { ts, apikey: publicKey, hash }
        });

        const comicsList = response.data.data.results;
        const comicsCount = response.data.data.total; // Total number of comics
        console.log(`Series ID ${seriesId} has ${comicsCount} comics (chapters).`);
        return comicsCount;
    } catch (error) {
        console.error('Error fetching comics:', error.response?.data || error.message);
        return 0;
    }
}



module.exports = { fetchCharacterByName, fetchSeriesByCharacterId, fetchComicsCountBySeriesId };
