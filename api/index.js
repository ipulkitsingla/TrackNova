import app from '../server/app.js';
import { connectDB } from '../server/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (e) {
    // Database connection fallback
  }
  return app(req, res);
}
