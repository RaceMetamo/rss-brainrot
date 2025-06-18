const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

let messages = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// --- Word pools for random RSS ---
const subjects = [
    'Thrilled to announce ',
    'Humble and proud',
    'This journey has ',
    'Empowering teams ',
    'Rooted in purpose '
];
const verbs = [
    'iterate',
    'transform',
    'align',
    'synergize',
    'craft'
];
const objects = [
    'conscious pipeline ',
    'while executing ',
    'product is presence',
    'our growth strategy ',
    'building community'
];

function generateRandomSentence() {
    const s = subjects[Math.floor(Math.random() * subjects.length)];
    const v = verbs[Math.floor(Math.random() * verbs.length)];
    const o = objects[Math.floor(Math.random() * objects.length)];
    return `${s} ${v} ${o}.`;
}

app.post('/message', (req, res) => {
    const msg = req.body.message?.trim();
    if (msg && msg.length > 0) {
        messages.unshift({ text: msg, date: new Date().toISOString() });
        if (messages.length > 20) {
            messages = messages.slice(0, 20);
        }
        res.redirect('/thank-you.html');
    } else {
        res.status(400).send('Invalid message');
    }
});


app.get('/rss', (req, res) => {
    res.set('Content-Type', 'application/rss+xml');
    res.send(generateRSS(messages));
});

// --- New Route: /random-rss ---
app.get('/random-rss', (req, res) => {
    const sentence = generateRandomSentence();
    const now = new Date().toISOString();

    const randomFeed = `<?xml version="1.0"?>
<rss version="2.0">
<channel>
  <title>Random Sentence Generator</title>
  <link>https://rss-brainrot.onrender.com/random-rss</link>
  <description>Procedurally generated phrases</description>
  <item>
    <title>${escapeXML(sentence)}</title>
    <pubDate>${now}</pubDate>
  </item>
</channel>
</rss>`;

    res.set('Content-Type', 'application/rss+xml');
    res.send(randomFeed);
});

function generateRSS(items) {
    const combinedText = items.map(item => item.text).join('\n');
    const latestDate = items[0]?.date || new Date().toISOString();

    return `<?xml version="1.0"?>
<rss version="2.0">
<channel>
  <title>Live Gallery Feed</title>
  <link>https://rss-brainrot.onrender.com/</link>
  <description>User-submitted messages</description>
  <item>
    <title>${escapeXML(combinedText)}</title>
    <pubDate>${latestDate}</pubDate>
  </item>
</channel>
</rss>`;
}

function escapeXML(str) {
    return str.replace(/[<>&'"]/g, c => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;',
        '\'': '&apos;', '"': '&quot;'
    }[c]));
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
