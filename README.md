# Live Visitor Counter (Offline Ready)

## What it does
- **Server** sends increasing counter every 2 seconds (via SSE)
- **Frontend** displays live count
- **Service worker** caches app files for offline support
- If offline → UI still loads (but live updates stop)

---

## Project Structure
```
server-sent-event-service-worker/
│
├── server.js         # Node.js + Express backend
├── public/
│   ├── index.html    # Frontend HTML
│   ├── app.js        # Frontend JS
│   └── sw.js         # Service Worker
└── README.md         # Instructions & explanations
```

---

## Instructions to Run Locally

1. **Install dependencies**
   ```
   npm init -y
   npm install express
   ```

2. **Start the server**
   ```
   node server.js
   ```

3. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

4. **Test offline**
   - Open DevTools → Network → Offline.
   - Reload the page: UI loads, but live updates pause and “Offline Mode” banner appears.

---

## How SSE Works in This Project
- The backend exposes `/events` with proper SSE headers.
- Every 2 seconds, the server sends a JSON `{ count: number }` as an SSE message.
- The frontend uses `EventSource` to connect and listen for updates.
- If the connection drops, the frontend auto-reconnects.

---

## How Service Worker Caching Works
- On install, the Service Worker caches `index.html` and `app.js`.
- On fetch, it serves cached files first (cache-first strategy).
- On activate, it cleans up old caches.
- When offline, the app loads from cache, but SSE/live updates are paused.

---

## Bonus & Best Practices
- SSE headers are set for proper streaming.
- Service Worker uses cache-first for fast offline loads.
- Code is commented for clarity.
- Clean separation of concerns.
