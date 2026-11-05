// seed.js — a ONE-TIME script to fill your real database with sample
// leaks. You run this yourself by typing a command — it is NOT part
// of the server that keeps running. Think of it like filling a fish
// tank with water once, not a hose that stays on forever.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// The SAME model the server uses — imported, not copied. If the schema
// ever changes in leak.model.js, the seed script gets the change too.
import Leak from './models/leak.model.js';

// Find files by where THIS script lives, not by whatever folder you're
// standing in when you run it. Without this, `cd server && node seed.js`
// can't find .env or leaks.json. __dirname = the server folder; ".."
// steps up to the project root. (ES modules don't get __dirname for
// free, so we build it from the file's own URL.)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env') });

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for seeding...');

  // Read the sample file straight off your hard drive
  const raw = fs.readFileSync(path.join(projectRoot, 'src', 'data', 'leaks.json'), 'utf-8');
  const leaks = JSON.parse(raw);

  // No "_id" fields in leaks.json on purpose — the old fake
  // "ObjectId('...')" placeholders were all identical and would clash.
  // With no _id given, MongoDB invents a REAL, unique one for each leak.
  const cleaned = leaks;

  // Clear out anything already there first, so running this script
  // twice doesn't just pile up duplicate copies of everything.
  await Leak.deleteMany({});
  console.log('Cleared old leaks.');

  // insertMany = upload the whole batch in one go, instead of 35
  // separate trips (much faster than looping and inserting one at a time).
  await Leak.insertMany(cleaned);
  console.log(`Inserted ${cleaned.length} leaks!`);

  await mongoose.disconnect();
  console.log('Done. Disconnected.');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});