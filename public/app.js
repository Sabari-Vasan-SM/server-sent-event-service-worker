// public/app.js

const counterEl = document.getElementById('counter');
const offlineBanner = document.getElementById('offline-banner');
let eventSource;

// Connect to SSE endpoint
function connectSSE() {
    eventSource = new EventSource('/events');

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        counterEl.textContent = data.count;
    };

    eventSource.onerror = () => {
        // Try to reconnect after 2 seconds
        setTimeout(() => {
            connectSSE();
        }, 2000);
    };
}

// Show/hide offline banner
function updateOnlineStatus() {
    if (navigator.onLine) {
        offlineBanner.style.display = 'none';
        if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
            connectSSE();
        }
    } else {
        offlineBanner.style.display = 'block';
        if (eventSource) eventSource.close();
    }
}

// Listen for online/offline events
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js');
    });
}

// Initial setup
updateOnlineStatus();
