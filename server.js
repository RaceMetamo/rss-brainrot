const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

let messages = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/message', (req, res) => {
    const msg = req.body.message?.trim();
    if (msg && msg.length > 0) {
        messages.unshift({ text: msg, date: new Date().toISOString() });
        if (messages.length > 50) messages.pop(); // limit feed size
        res.redirect('/thank-you.html');
    } else {
        res.status(400).send('Invalid message');
    }
});

app.get('/rss', (req, res) => {
    res.set('Content-Type', 'application/rss+xml');
    res.send(generateRSS(messages));
});

function generateRSS(items) {
    return `<?xml version="1.0"?>
<rss version="2.0">
<channel>
  <title>Live Gallery Feed</title>
  <link>https://your-render-url.onrender.com</link>
  <description>User-submitted messages</description>
  ${items.map(item => `
  <item>
    <title>${escapeXML(item.text)}</title>
    <pubDate>${item.date}</pubDate>
  </item>`).join('')}
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