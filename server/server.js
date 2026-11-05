import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import leakRoutes from './routes/leak.routes.js';

// Load the secrets from .env. Plain `import 'dotenv/config'` only looks
// for .env in whatever folder you happen to be standing in when you type
// the command — so `cd server && node server.js` found nothing and the
// MongoDB address came back "undefined". Instead we work out where THIS
// file lives (the server folder), step up one level (..) to the project
// root, and point dotenv straight at .env there. Like writing the full
// street address on the map instead of "look under the nearest doormat".
// (ES modules don't get __dirname for free, so we build it from the
// file's own URL.)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173'
}));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ---------------------------------------------------------------------
// ROUTES — server.js no longer holds any route logic itself. It's the
// front door: it sets up the building (JSON, CORS, database) and then
// points visitors down the right corridor.
//
// Every address starting with /api/leaks is handed to the leak router
// (server/routes/leak.routes.js), which hands each one to a controller
// function (server/controllers/leak.controller.js), which uses the
// model (server/models/leak.model.js) to talk to MongoDB.
//   server.js → routes → controllers → models → MongoDB
// ---------------------------------------------------------------------
app.use('/api/leaks', leakRoutes);

// ---------------------------------------------------------------------
// 404 CATCH-ALL — this MUST stay below every real route.
//
// Express checks routes from top to bottom, like a postman walking down
// a street checking house numbers. If he reaches the end of the street
// and nobody matched, he lands here. Because it's LAST, it only ever
// catches the leftovers — put it higher up and it would swallow real
// routes before they got a chance.
//
// app.use() with no path means "match ANY address and ANY method"
// (GET, POST, DELETE...), which is exactly what a catch-all needs.
// Without this, Express sends back its own HTML "Cannot GET /whatever"
// page — and our React app only speaks JSON, so it couldn't read it.
// ---------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `No route for ${req.method} ${req.originalUrl}. The truth is out there, but not at this address.`
  });
});

// ---------------------------------------------------------------------
// ERROR HANDLER — the safety net under everything.
//
// Express spots an error handler by counting its arguments: FOUR
// (err, req, res, next) instead of the usual three. If any route or
// built-in piece crashes, Express skips straight down to here.
//
// The main case it catches: someone sends broken JSON (e.g. a missing
// quote in Postman). express.json() can't read it and throws — and
// without this net Express would answer with another HTML error page.
// err.status is 400 ("bad request — your fault") for broken JSON;
// anything without a status is treated as 500 ("our fault").
// ---------------------------------------------------------------------
app.use((err, req, res, next) => {
  // Rare edge case: if we'd ALREADY started sending a reply before the
  // crash, we can't start a second one — hand it back to Express.
  if (res.headersSent) return next(err);

  const status = err.status || 500;
  res.status(status).json({
    error: status === 400 ? 'Bad Request' : 'Server Error',
    message: status === 400 ? 'That JSON is scrambled. Check your quotes and commas.' : 'Something broke on our end.'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));