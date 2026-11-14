# 🚂 TrackNova - Live Train Tracker PWA

A high-performance, mobile-first **Progressive Web App (PWA)** for real-time Indian Railways train tracking powered by the **Railcore API**. Features realistic railway animations, live Speedometer HUD, interactive Leaflet GPS radar map, route station timeline with platform & delay predictions, and 1-tap installation on mobile and desktop without requiring any signup.

---

## 🌟 Key Features

1. **📱 Mobile-Friendly & Installable PWA**:
   - Meets all Web App Manifest and Service Worker standards.
   - Installable with 1-tap via the built-in install prompt on Android Chrome and desktop browsers.
   - iOS Safari "Add to Home Screen" instructions card included.
   - Works offline with smart caching of app shell, icons, and schedule records.
   - Native mobile bottom navigation bar (`Live Track`, `Radar Map`, `Stations`, `Saved`).

2. **⚡ Real-Time Railcore API Integration**:
   - Connects directly to the live Railcore IR API (`https://ir.railcore.tech/v1`).
   - Automatically defaults dates to **Indian Standard Time (IST, UTC+5:30)**.
   - 15-second server-side telemetry cache to prevent rate-limiting while providing fresh data.
   - Live train autocomplete search (`/api/trains/search?q=...`) supporting both 5-digit train numbers (e.g. `12951`, `22436`) and train names (e.g. `Tejas`, `Rajdhani`, `Vande Bharat`, `Shatabdi`).

3. **🎨 Rich Animations**:
   - **Dynamic Animated Train Stage**:
     - Aerodynamic electric locomotive with glowing cab window, illuminated passenger coaches, and moving wheels.
     - Projecting headlight beam illuminating the tracks ahead.
     - Overhead electric pantograph with dynamic spark animation when train is in motion.
     - Moving double-rail tracks with animated sliding sleepers whose speed reflects train motion.
   - **Speedometer HUD Arc Gauge**:
     - Modern SVG circular dial measuring 0 to 160 km/h with an animated needle.
     - Color-coded telemetry status: `Stationary`, `Approaching / Slow`, `Cruising Speed`, `Express Corridor`, and `High-Speed Rapid`.
   - **Journey Progress Bar**:
     - Visual progress indicator between Origin and Destination with a pulsing radar pin at the train's exact route percentage.

4. **🗺️ Interactive Live GPS Map**:
   - Interactive Leaflet map with dark theme styling.
   - Animated train radar pin with pulsing halo.
   - Route polyline connecting all intermediate stations.
   - Station markers with popups showing platform number, ETA, and halt duration.
   - "Center on Train" auto-fly-to camera control.

5. **📋 Station Schedule & Halts**:
   - Filter toggle: *Stopping Stations Only* vs *All Passing Stations*.
   - Platform numbers, scheduled vs estimated arrival/departure times, halt durations, and color-coded delay status (green for Right Time, amber for minor delays, red for major delays).

6. **🔒 Zero Signup Required & MERN Architecture**:
   - No login, passwords, or signup friction.
   - Express server with MongoDB integration. If MongoDB is offline or IP is not whitelisted, gracefully falls back to persistent in-memory / browser local storage so the app **never fails or crashes**.
   - Favorite and recently tracked trains accessible with one tap.

---

## 🚀 Quick Start Guide

### 1. Run the Unified Production Server
The server hosts both the Express API and the built React PWA on `http://localhost:3000`:
```bash
npm start
```
Then open: [http://localhost:3000](http://localhost:3000)

### 2. Development Mode
To run client and server in development with hot-reload:
```bash
# Terminal 1: Backend server (Port 3000)
npm run server

# Terminal 2: React Vite Frontend (Port 5173 with auto-proxy)
npm run client
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Leaflet
- **Backend**: Node.js, Express, Native Fetch, Mongoose / MongoDB Atlas
- **Data Source**: Railcore Real-time IR API (`https://ir.railcore.tech/v1`)
- **PWA**: Service Worker (`sw.js`), Web App Manifest (`manifest.json`), Maskable App Icons

