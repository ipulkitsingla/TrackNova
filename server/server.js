import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import app from './app.js';
import { connectDB } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Serve frontend static build in local production
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>TrackNova API Server</title></head>
          <body style="font-family: sans-serif; padding: 40px; text-align: center; background: #0f172a; color: white;">
            <h1>🚂 TrackNova Backend API Running</h1>
            <p>Port: ${PORT} | Railcore Integration Active</p>
            <p>Frontend dev server runs at <a href="http://localhost:5173" style="color: #38bdf8;">http://localhost:5173</a></p>
          </body>
        </html>
      `);
    }
  });
});

// Initialize DB and start server
connectDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`[TrackNova] Server running on http://localhost:${PORT}`);
  });
});
