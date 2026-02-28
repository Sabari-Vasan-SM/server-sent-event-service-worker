// app.js
// ---
// 1. Connects to SSE endpoint (/events) using EventSource
// 2. Updates live counter in UI
// 3. Handles automatic reconnection
// 4. Shows "Offline Mode" banner if network lost
// 5. Registers service worker for offline support

const counterEl = document.getElementById('counter');
const offlineBanner = document.getElementById('offline-banner');
let eventSource;
let reconnectTimeout = null;

// Connect to SSE endpoint
function connectSSE() {
    eventSource = new EventSource('/events');

    eventSource.onmessage = (event) => {
        // Parse JSON from server
        const data = JSON.parse(event.data);
        counterEl.textContent = data.count;
    };

    eventSource.onerror = () => {
        // Try to reconnect after 2 seconds
        if (eventSource) eventSource.close();
        reconnectTimeout = setTimeout(connectSSE, 2000);
    };
}

// Show/hide offline banner and manage SSE connection
function updateOnlineStatus() {
    if (navigator.onLine) {
        offlineBanner.style.display = 'none';
        // Reconnect SSE if needed
        if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
            connectSSE();
        }
    } else {
        offlineBanner.style.display = 'block';
        // Close SSE connection when offline
        if (eventSource) eventSource.close();
    }
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
