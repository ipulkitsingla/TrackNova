import mongoose from 'mongoose';

let isMongoConnected = false;

// In-memory fallback if MongoDB is not running
const memoryStore = {
  favorites: [],
  history: []
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tracknova';
  try {
    // 2-second timeout to connect so app doesn't hang if MongoDB is offline
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB connected successfully to ${uri}`);
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB not reachable (${err.message}). Falling back to in-memory store for favorites/history.`);
  }
};

// Mongoose Models (used if MongoDB connected)
const favoriteSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, unique: true },
  trainName: String,
  sourceStation: String,
  destinationStation: String,
  addedAt: { type: Date, default: Date.now }
});

const historySchema = new mongoose.Schema({
  trainNumber: { type: String, required: true },
  trainName: String,
  searchedAt: { type: Date, default: Date.now }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);
const History = mongoose.model('History', historySchema);

export const getFavorites = async () => {
  if (isMongoConnected) {
    return await Favorite.find().sort({ addedAt: -1 }).lean();
  }
  return memoryStore.favorites;
};

export const addFavorite = async (data) => {
  if (isMongoConnected) {
    return await Favorite.findOneAndUpdate(
      { trainNumber: data.trainNumber },
      { ...data, addedAt: new Date() },
      { upsert: true, new: true }
    ).lean();
  }
  const existingIdx = memoryStore.favorites.findIndex(f => f.trainNumber === data.trainNumber);
  const entry = { ...data, addedAt: new Date() };
  if (existingIdx >= 0) {
    memoryStore.favorites[existingIdx] = entry;
  } else {
    memoryStore.favorites.unshift(entry);
  }
  return entry;
};

export const removeFavorite = async (trainNumber) => {
  if (isMongoConnected) {
    return await Favorite.deleteOne({ trainNumber });
  }
  memoryStore.favorites = memoryStore.favorites.filter(f => f.trainNumber !== trainNumber);
  return { deleted: true };
};

export const addHistory = async (data) => {
  if (isMongoConnected) {
    await History.create({ ...data, searchedAt: new Date() });
    return;
  }
  memoryStore.history.unshift({ ...data, searchedAt: new Date() });
  if (memoryStore.history.length > 20) {
    memoryStore.history.pop();
  }
};

export const getHistory = async () => {
  if (isMongoConnected) {
    return await History.find().sort({ searchedAt: -1 }).limit(15).lean();
  }
  return memoryStore.history;
};

export const getDBStatus = () => ({
  isMongoConnected,
  type: isMongoConnected ? 'MongoDB' : 'In-Memory Fallback'
});

