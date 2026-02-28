// server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// SSE endpoint
app.get('/events', (req, res) => {
    // Set SSE headers
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    let count = 0;

    // Send initial comment to keep connection open
    res.write(': connected\n\n');

    // Send a JSON object every 2 seconds
    const interval = setInterval(() => {
        count++;
        res.write(`data: ${JSON.stringify({ count })}\n\n`);
    }, 2000);

    // Clean up on client disconnect
    req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});