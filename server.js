// server.js
// Express server with SSE endpoint for live counter
// ---
// 1. Serves static frontend files
// 2. Exposes /events SSE endpoint
// 3. Sends { count } JSON every 2 seconds
// 4. Follows SSE best practices for headers and cleanup
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory stores (for demo)
let connectedUsers = new Map(); // sessionId -> {name, lastSeen}
let chatMessages = []; // {user, message, timestamp}
let counter = 0;
let paused = false;

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

// Helper: get or set sessionId cookie
function getSessionId(req, res) {
    let sessionId = req.cookies.sessionId;
    if (!sessionId) {
        sessionId = uuidv4();
        res.cookie('sessionId', sessionId, { httpOnly: true });
    }
    return sessionId;
}

// SSE endpoint for live counter, users, and chat
app.get('/events', (req, res) => {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
    });
    res.flushHeaders();

    // Track user session
    const sessionId = getSessionId(req, res);
    connectedUsers.set(sessionId, { name: `User-${sessionId.slice(0, 6)}`, lastSeen: Date.now() });

    // Send initial state
    res.write(`data: ${JSON.stringify({ type: 'init', count: counter, users: Array.from(connectedUsers.values()), chat: chatMessages.slice(-10) })}\n\n`);

    // Counter interval
    const sendCounter = () => {
        if (!paused) {
            counter++;
        }
        // Broadcast counter and users
        res.write(`data: ${JSON.stringify({ type: 'counter', count: counter, users: Array.from(connectedUsers.values()) })}\n\n`);
    };
    const interval = setInterval(sendCounter, 2000);

    // Chat message broadcast (simple polling)
    const chatInterval = setInterval(() => {
        res.write(`data: ${JSON.stringify({ type: 'chat', chat: chatMessages.slice(-10) })}\n\n`);
    }, 2000);

    req.on('close', () => {
        clearInterval(interval);
        clearInterval(chatInterval);
        connectedUsers.delete(sessionId);
    });
});

// Chat message POST endpoint
app.post('/chat', (req, res) => {
    const sessionId = req.cookies.sessionId || 'anon';
    const user = connectedUsers.get(sessionId)?.name || `User-${sessionId.slice(0, 6)}`;
    const { message } = req.body;
    if (typeof message === 'string' && message.trim()) {
        chatMessages.push({ user, message: message.trim(), timestamp: Date.now() });
        if (chatMessages.length > 100) chatMessages.shift();
        res.json({ status: 'ok' });
    } else {
        res.status(400).json({ status: 'error', error: 'Invalid message' });
    }
});

// Admin endpoints (simple, no auth yet)
app.post('/admin/reset', (req, res) => {
    counter = 0;
    res.json({ status: 'ok', counter });
});
app.post('/admin/pause', (req, res) => {
    paused = true;
    res.json({ status: 'ok', paused });
});
app.post('/admin/resume', (req, res) => {
    paused = false;
    res.json({ status: 'ok', paused });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
