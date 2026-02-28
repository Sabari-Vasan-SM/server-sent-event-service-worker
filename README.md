# SSE & Service Worker Demo

## How to Run Locally

1. **Install dependencies**  
   No dependencies required except Express.  
   Run:  
   ```
   npm install express
   ```

2. **Start the server**  
   ```
   node server.js
   ```

3. **Open the app**  
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## How SSE Works in This Project

- The backend exposes `/events` as an SSE endpoint.
- The server sends a JSON object `{ count: number }` every 2 seconds.
- The frontend uses `EventSource` to connect and listen for updates.
- If the connection drops (e.g., offline), the frontend shows an "Offline Mode" banner and tries to reconnect automatically.

---

## How Service Worker Caching Works

- The Service Worker caches `index.html` and `app.js` during install.
- On fetch, it uses a cache-first strategy:  
  If the file is cached, it serves from cache; otherwise, it fetches from the network.
- This allows the app to load and display the last counter value even when offline.
- The Service Worker handles install, activate, and fetch events according to best practices.

---

## Notes

- All code is commented for clarity.
- SSE headers follow best practices for persistent connections.
- The app is beginner-friendly but uses professional patterns.
