// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.error('Service Worker registration failed:', err));
}

const counterEl = document.getElementById('counter');
const offlineBanner = document.getElementById('offline-banner');

let eventSource;
let reconnectTimeout = null;

// Function to connect to SSE
function connectSSE() {
    eventSource = new EventSource('/events');

    eventSource.onmessage = (event) => {
        // Parse and display count
        const data = JSON.parse(event.data);
        counterEl.textContent = data.count;
        hideOfflineBanner();
    };

    eventSource.onerror = () => {
        showOfflineBanner();
        // Attempt reconnection after 2 seconds
        if (!reconnectTimeout) {
            reconnectTimeout = setTimeout(() => {
                reconnectTimeout = null;
                connectSSE();
            }, 2000);
        }
    };
}

// Show offline banner
function showOfflineBanner() {
    offlineBanner.style.display = 'block';
}

// Hide offline banner
function hideOfflineBanner() {
    offlineBanner.style.display = 'none';
}

// Listen for online/offline events
window.addEventListener('online', () => {
    hideOfflineBanner();
    connectSSE();
});
window.addEventListener('offline', showOfflineBanner);

// Initial SSE connection
connectSSE();
