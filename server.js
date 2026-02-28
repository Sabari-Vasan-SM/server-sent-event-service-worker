// server.js
// Express server with SSE endpoint for live counter
// ---
// 1. Serves static frontend files
// 2. Exposes /events SSE endpoint
// 3. Sends { count } JSON every 2 seconds
// 4. Follows SSE best practices for headers and cleanup
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// SSE endpoint for live counter
app.get('/events', (req, res) => {
    // --- SSE headers (required for EventSource) ---
    res.set({
        'Content-Type': 'text/event-stream', // SSE MIME type
        'Cache-Control': 'no-cache',         // Prevent caching
        'Connection': 'keep-alive',          // Keep connection open
        'Access-Control-Allow-Origin': '*',  // Allow cross-origin (for demo)
    });
    res.flushHeaders(); // Send headers immediately

    let count = 0;
    // Send event every 2 seconds
    const sendEvent = () => {
        count++;
        // SSE format: data: <string>\n\n
        // Send JSON as SSE data
        res.write(`data: ${JSON.stringify({ count })}\n\n`);
    };
    const interval = setInterval(sendEvent, 2000);

    // --- Cleanup on client disconnect ---
    req.on('close', () => {
        clearInterval(interval);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
