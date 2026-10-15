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

test('sendEmailNotification closes <ul> and escapes HTML in series titles, and checkForNewChapters integrates detectChapterDelta', async () => {
    const { checkForNewChapters, sendEmailNotification } = require('../services/emailService');
    const sent = [];
    const payload = await sendEmailNotification(
        'reader@example.com',
        [{ title: 'Spider-Man & <Friends>', newChapters: 2 }],
        async (to, subject, html) => {
            sent.push({ to, subject, html });
        }
    );
    assert.equal(sent.length, 1);
    assert.ok(payload.html.endsWith('</ul>'));
    assert.ok(payload.html.includes('Spider-Man &amp; &lt;Friends&gt; - 2 new chapter(s)'));

    let saved = false;
    const fakeUser = {
        email: 'sub@example.com',
        comicSeries: [
            { seriesId: 10, title: 'X-Men', chapters: 5 },
            { seriesId: 20, title: 'Avengers', chapters: 10 },
        ],
        async save() {
            saved = true;
        },
    };
    const notifications = [];
    await checkForNewChapters({
        userModel: { find: async () => [fakeUser] },
        fetchCountFn: async (id) => (id === 10 ? 7 : 0),
        notifyFn: async (email, updates) => {
            notifications.push({ email, updates });
        },
    });
    assert.equal(saved, true);
    assert.equal(fakeUser.comicSeries[0].chapters, 7);
    assert.equal(fakeUser.comicSeries[1].chapters, 10);
    assert.equal(notifications.length, 1);
    assert.equal(notifications[0].updates[0].newChapters, 2);
});

