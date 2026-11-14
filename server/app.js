import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getFavorites, addFavorite, removeFavorite, addHistory, getHistory, getDBStatus } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const RAILCORE_API_KEY = process.env.RAILCORE_API_KEY || 'rk_live_kQkwmugGVugvp0-uwKJSsAWWgKr1D-77';
const RAILCORE_BASE_URL = process.env.RAILCORE_BASE_URL || 'https://ir.railcore.tech/v1';

app.use(cors());
app.use(express.json());

// In-memory cache for live requests to reduce Railcore API pressure
const cache = new Map();
const CACHE_TTL_MS = 15 * 1000; // 15 seconds

function getTodayIST() {
  const now = new Date();
  const utcOffset = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istOffset = 5.5 * 3600000; // IST is UTC+5:30
  const istDate = new Date(utcOffset + istOffset);
  return istDate.toISOString().split('T')[0];
}

// Popular Trains Preset List for 1-click live demo
const POPULAR_TRAINS = [
  { train_number: '12951', train_name: 'New Delhi Tejas Rajdhani Express', type: 'RAJDHANI', from: 'MMCT', to: 'NDLS' },
  { train_number: '22436', train_name: 'Vande Bharat Express', type: 'VANDE BHARAT', from: 'NDLS', to: 'BSB' },
  { train_number: '12002', train_name: 'Bhopal Shatabdi Express', type: 'SHATABDI', from: 'NDLS', to: 'RKMP' },
  { train_number: '12301', train_name: 'Howrah Rajdhani Express', type: 'RAJDHANI', from: 'HWH', to: 'NDLS' },
  { train_number: '12259', train_name: 'Sealdah Bikaner AC Duronto', type: 'DURONTO', from: 'SDAH', to: 'BKN' },
  { train_number: '12626', train_name: 'Kerala Express', type: 'SUPERFAST', from: 'NDLS', to: 'TVC' }
];

// Helper for Railcore API calls
async function callRailcore(endpoint, queryParams = {}) {
  const url = new URL(`${RAILCORE_BASE_URL}${endpoint}`);
  Object.entries(queryParams).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.append(k, v);
  });

  const response = await fetch(url.toString(), {
    headers: {
      'X-Api-Key': RAILCORE_API_KEY,
      'Accept': 'application/json'
    },
    signal: AbortSignal.timeout(30000)
  });

  const body = await response.json();
  if (!response.ok || !body.success) {
    const errorMsg = body?.error?.message || body?.message || `Railcore API error (status ${response.status})`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.details = body;
    throw err;
  }

  return body;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    todayIST: getTodayIST(),
    db: getDBStatus()
  });
});

app.get('/api/popular', (req, res) => {
  res.json({
    success: true,
    data: POPULAR_TRAINS
  });
});

// Train Search Endpoint
app.get('/api/trains/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) {
    return res.status(400).json({ success: false, message: 'Search query "q" is required' });
  }

  try {
    const cacheKey = `search_${query.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 60000) {
      return res.json(cached.data);
    }

    const data = await callRailcore('/trains/search', { q: query });
    cache.set(cacheKey, { timestamp: Date.now(), data });
    res.json(data);
  } catch (err) {
    console.error('Search error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Failed to search trains'
    });
  }
});

// Train Live Status Endpoint
app.get('/api/trains/live/:trainNumber', async (req, res) => {
  const { trainNumber } = req.params;
  const date = req.query.date || getTodayIST();
  const maxAge = req.query.max_age || '0';

  const cacheKey = `live_${trainNumber}_${date}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json({ ...cached.data, _cached: true, _cachedAt: cached.timestamp });
  }

  try {
    const data = await callRailcore(`/trains/${trainNumber}/live`, {
      date,
      max_age: maxAge
    });

    cache.set(cacheKey, { timestamp: Date.now(), data });

    // Track in history asynchronously
    if (data?.data?.train_name) {
      addHistory({
        trainNumber,
        trainName: data.data.train_name
      }).catch(e => console.error('History track error:', e));
    }

    res.json(data);
  } catch (err) {
    console.error(`Live status error for ${trainNumber}:`, err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || `Unable to fetch live status for train ${trainNumber}`,
      details: err.details || null
    });
  }
});

// Train Static Info Endpoint
app.get('/api/trains/info/:trainNumber', async (req, res) => {
  const { trainNumber } = req.params;
  try {
    const data = await callRailcore(`/trains/${trainNumber}`);
    res.json(data);
  } catch (err) {
    console.error(`Info error for ${trainNumber}:`, err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || `Unable to fetch train information for ${trainNumber}`
    });
  }
});

// Favorites & History APIs
app.get('/api/favorites', async (req, res) => {
  try {
    const favs = await getFavorites();
    res.json({ success: true, data: favs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/favorites', async (req, res) => {
  try {
    const { trainNumber, trainName, sourceStation, destinationStation } = req.body;
    if (!trainNumber) {
      return res.status(400).json({ success: false, message: 'trainNumber is required' });
    }
    const saved = await addFavorite({ trainNumber, trainName, sourceStation, destinationStation });
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/favorites/:trainNumber', async (req, res) => {
  try {
    const { trainNumber } = req.params;
    await removeFavorite(trainNumber);
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const history = await getHistory();
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default app;
