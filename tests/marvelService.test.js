const test = require('node:test');
const assert = require('node:assert/strict');
const { generateHash, detectChapterDelta } = require('../services/marvelService');

test('generateHash computes deterministic MD5 digest for Marvel API signing', () => {
    const h = generateHash('1700000000', 'priv123', 'pub456');
    assert.equal(h, '0867ceceaa3c513bdfd7301ee4e21a09');
    assert.equal(typeof generateHash(12345), 'string');
    assert.equal(generateHash(12345).length, 32);
});

test('detectChapterDelta reports only strictly positive issue increases and preserves state on API error', () => {
    const subscriptions = [
        { seriesId: 101, title: 'Amazing Spider-Man', chapters: 12 },
        { seriesId: 202, title: 'Immortal Thor', chapters: 8 },
        { seriesId: 303, title: 'X-Men', chapters: 20 },
    ];

    const latestCounts = {
        101: 15, // +3 new chapters
        202: 8,  // unchanged -> must NOT trigger 0-chapter email
        303: 0,  // transient API error returning 0 -> must NOT overwrite 20 with 0
    };

    const { updates, updatedSeries } = detectChapterDelta(subscriptions, latestCounts);
    assert.equal(updates.length, 1);
    assert.deepEqual(updates[0], {
        seriesId: 101,
        title: 'Amazing Spider-Man',
        newChapters: 3,
        previousChapters: 12,
        currentChapters: 15,
    });

    assert.equal(updatedSeries[0].chapters, 15);
    assert.equal(updatedSeries[1].chapters, 8);
    assert.equal(updatedSeries[2].chapters, 20);
});
