const axios = require('axios');
const crypto = require('crypto');

// Marvel API public and private keys
const publicKey = 'bc667eb7c5194d725b2259f32dbd32c9';  // Replace with your actual public key
const privateKey = '4a3d545add841f81d5a6876fa8682361328c12b0';  // Replace with your actual private key
const baseURL = 'https://gateway.marvel.com/v1/public';


function generateHash(ts) {
    return crypto.createHash('md5').update(ts + privateKey + publicKey).digest('hex');
}

async function fetchCharacterByName(characterName) {
    const ts = new Date().getTime();
    const hash = generateHash(ts);

    try {
        const response = await axios.get(`${baseURL}/characters`, {
            params: {
                name: characterName,
                ts,
                apikey: publicKey,
                hash
            }
        });

        const characters = response.data.data.results;
        if (characters.length === 0) {
            console.log(`Character ${characterName} not found.`);
            return null;
        } else {
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
    const ts = new Date().getTime();
    const hash = generateHash(ts);

    try {
        const response = await axios.get(`${baseURL}/characters/${characterId}/series`, {
            params: {
                ts,
                apikey: publicKey,
                hash
            }
        });

        const seriesList = response.data.data.results;
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
            params: {
                ts,
                apikey: publicKey,
                hash
            }
        });

        const comicsList = response.data.data.results;
        const comicsCount = response.data.data.total; // Total number of comics in the series
        console.log(`Series ID ${seriesId} has ${comicsCount} comics (chapters).`);
        return comicsCount;
    } catch (error) {
        console.error('Error fetching comics:', error.response?.data || error.message);
        return 0;
    }
}

// Export functions using CommonJS syntax
module.exports = { fetchCharacterByName, fetchSeriesByCharacterId, fetchComicsCountBySeriesId };

// Example usage
(async () => {
    const seriesId = '20443';  // Replace with the series ID you want to check
    const comicsCount = await fetchComicsCountBySeriesId(seriesId);
    console.log(`Total comics in series ${seriesId}: ${comicsCount}`);
    }
)();