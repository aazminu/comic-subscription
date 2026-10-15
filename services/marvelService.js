const crypto = require('crypto');
let axios = null;
try {
    axios = require('axios');
} catch (_) {
    axios = null;
}

const publicKey = process.env.MARVEL_PUBLIC_KEY || '';
const privateKey = process.env.MARVEL_PRIVATE_KEY || '';
const baseURL = 'https://gateway.marvel.com/v1/public';

function generateHash(ts, privKey = privateKey, pubKey = publicKey) {
    return crypto
        .createHash('md5')
        .update(`${ts}${privKey ?? ''}${pubKey ?? ''}`)
        .digest('hex');
}

/**
 * Compare a user's stored comicSeries subscriptions against newly fetched counts.
 * Ignores non-finite or zero/negative error counts when the stored count is positive,
 * and only triggers notifications when latestCount > storedChapters.
 */
function detectChapterDelta(storedSeriesList, latestCountsBySeriesId) {
    if (!Array.isArray(storedSeriesList)) {
        return { updates: [], updatedSeries: [] };
    }
    const countsMap =
        latestCountsBySeriesId instanceof Map
            ? latestCountsBySeriesId
            : new Map(Object.entries(latestCountsBySeriesId || {}));

    const updates = [];
    const updatedSeries = storedSeriesList.map((series) => {
        const copy = { ...series };
        const key = String(series.seriesId);
        const rawLatest = countsMap.has(series.seriesId)
            ? countsMap.get(series.seriesId)
            : countsMap.get(key);
        const latestCount = Number(rawLatest);
        const prevChapters = Number(series.chapters) || 0;

        if (Number.isFinite(latestCount) && latestCount > prevChapters) {
            updates.push({
                seriesId: series.seriesId,
                title: series.title,
                newChapters: latestCount - prevChapters,
                previousChapters: prevChapters,
                currentChapters: latestCount,
            });
            copy.chapters = latestCount;
        }
        return copy;
    });

    return { updates, updatedSeries };
}

async function fetchCharacterByName(characterName, httpClient = axios) {
    const ts = new Date().getTime();
    const hash = generateHash(ts);

    try {
        const response = await httpClient.get(`${baseURL}/characters`, {
            params: { name: characterName, ts, apikey: publicKey, hash },
        });
        const characters = response.data.data.results;
        if (characters.length === 0) {
            return null;
        }
        return characters[0].id;
    } catch (error) {
        console.error('Error fetching character:', error.response?.data || error.message);
        return null;
    }
}

async function fetchSeriesByCharacterId(characterId, httpClient = axios) {
    const ts = new Date().getTime();
    const hash = generateHash(ts);

    try {
        const response = await httpClient.get(`${baseURL}/characters/${characterId}/series`, {
            params: { ts, apikey: publicKey, hash },
        });
        const seriesList = response.data.data.results;
        return seriesList.length === 0 ? [] : seriesList;
    } catch (error) {
        console.error('Error fetching series:', error.response?.data || error.message);
        return [];
    }
}

async function fetchComicsCountBySeriesId(seriesId, httpClient = axios) {
    const ts = new Date().getTime();
    const hash = generateHash(ts);

    try {
        const response = await httpClient.get(`${baseURL}/series/${seriesId}/comics`, {
            params: { ts, apikey: publicKey, hash },
        });
        return response.data.data.total;
    } catch (error) {
        console.error('Error fetching comics:', error.response?.data || error.message);
        return 0;
    }
}

module.exports = {
    generateHash,
    detectChapterDelta,
    fetchCharacterByName,
    fetchSeriesByCharacterId,
    fetchComicsCountBySeriesId,
};
