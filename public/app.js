// app.js
// ---
// 1. Connects to SSE endpoint (/events) using EventSource
const userListEl = document.getElementById('user-list');
const chatBoxEl = document.getElementById('chat-box');
const chatFormEl = document.getElementById('chat-form');
const chatInputEl = document.getElementById('chat-input');
const resetBtn = document.getElementById('reset-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const graphCanvas = document.getElementById('counter-graph');
// 2. Updates live counter in UI
// 3. Handles automatic reconnection
let counterHistory = [];
let paused = false;
// 4. Shows "Offline Mode" banner if network lost
// 5. Registers service worker for offline support
function connectSSE() {
    eventSource = new EventSource('/events');

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'init' || data.type === 'counter') {
            counterEl.textContent = data.count;
            renderUsers(data.users);
            if (!paused) counterHistory.push(data.count);
            renderGraph();
        }
        if (data.type === 'chat') {
            // app.js
            // ---
            // 1. Connects to SSE endpoint (/events) using EventSource
            const counterEl = document.getElementById('counter');
            const offlineBanner = document.getElementById('offline-banner');
            const userListEl = document.getElementById('user-list');
            const chatBoxEl = document.getElementById('chat-box');
            const chatFormEl = document.getElementById('chat-form');
            const chatInputEl = document.getElementById('chat-input');
            const resetBtn = document.getElementById('reset-btn');
            const pauseBtn = document.getElementById('pause-btn');
            const resumeBtn = document.getElementById('resume-btn');
            const graphCanvas = document.getElementById('counter-graph');
            let eventSource;
            let reconnectTimeout = null;
            let counterHistory = [];
            let paused = false;

            function connectSSE() {
                eventSource = new EventSource('/events');

                eventSource.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'init' || data.type === 'counter') {
                        counterEl.textContent = data.count;
                        renderUsers(data.users);
                        if (!paused) counterHistory.push(data.count);
                        renderGraph();
                    }
                    if (data.type === 'chat') {
                        renderChat(data.chat);
                    }
                };

                eventSource.onerror = () => {
                    if (eventSource) eventSource.close();
                    reconnectTimeout = setTimeout(connectSSE, 2000);
                };
            }

            function renderUsers(users) {
                if (!userListEl) return;
                userListEl.innerHTML = '';
                users.forEach(u => {
                    const li = document.createElement('li');
                    li.textContent = u.name;
                    userListEl.appendChild(li);
                });
            }

            function renderChat(chat) {
                if (!chatBoxEl) return;
                chatBoxEl.innerHTML = chat.map(msg => `<div><b>${msg.user}:</b> ${msg.message}</div>`).join('');
                chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
            }

            function renderGraph() {
                if (!graphCanvas) return;
                const ctx = graphCanvas.getContext('2d');
                ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
                ctx.strokeStyle = '#2196f3';
                ctx.beginPath();
                let max = Math.max(...counterHistory, 10);
                let arr = counterHistory.slice(-40);
                arr.forEach((val, i) => {
                    let x = (i / (arr.length - 1 || 1)) * graphCanvas.width;
                    let y = graphCanvas.height - (val / max) * graphCanvas.height;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();
            }
        }
    });
}

// Admin controls
if (resetBtn) {
    resetBtn.onclick = () => {
        fetch('/admin/reset', { method: 'POST' });
        counterHistory = [];
    };
}
if (pauseBtn) {
    pauseBtn.onclick = () => {
        fetch('/admin/pause', { method: 'POST' });
        paused = true;
    };
}
if (resumeBtn) {
    resumeBtn.onclick = () => {
        fetch('/admin/resume', { method: 'POST' });
        paused = false;
    };
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initial load
updateOnlineStatus();

// Register service worker for offline caching
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered:', reg.scope))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}
