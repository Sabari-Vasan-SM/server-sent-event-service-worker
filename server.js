// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// SSE endpoint
app.get('/events', (req, res) => {
    // Set headers for SSE
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });
    res.flushHeaders();

    let count = 0;
    const sendEvent = () => {
        count++;
        res.write(`data: ${JSON.stringify({ count })}\n\n`);
    };

    // Send first event immediately
    sendEvent();
    // Send event every 2 seconds
    const interval = setInterval(sendEvent, 2000);

    // Clean up when client disconnects
    req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
