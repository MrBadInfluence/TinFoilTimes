// leak.model.js — the M in MVC. The ONE place the shape of a leak is
// written down.
//
// Before this file existed, the schema was copy-pasted into both
// server.js and seed.js. That's like two people each keeping their own
// copy of a recipe: change one, forget the other, and the two cakes
// quietly stop matching. Now everyone imports the recipe from here, so
// there is only ever one version.
import mongoose from 'mongoose';

const leakSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  body: { type: String, required: true },
  // enum is a list of allowed answers, like a form with tick-boxes instead
  // of a blank line. Each tab on the page can only show its own category,
  // so a leak filed under a made-up one would be saved but never appear
  // under any tab. Anything else now fails validation, and the controller
  // answers with a 400. These seven must match CATEGORIES in src/App.jsx:
  // the browser and server run separately, so each keeps its own copy.
  category: {
    type: String,
    required: true,
    enum: ['aliens', 'cryptids', 'government', 'animals', 'tech', 'celebrity', 'unexplained']
  },
  submittedBy: { type: String, default: '' },
  linkText: String,
  link: String,
  votes: {
    believe: { type: Number, default: 0 },
    debunked: { type: Number, default: 0 }
  },
  comments: [{ user: String, text: String }],
  createdAt: { type: Date, default: Date.now }
});

// mongoose.model('Leak', ...) turns the recipe into a working tool that
// can find, create and update leaks. Mongoose automatically lowercases
// and pluralises the name, so 'Leak' lives in the "leaks" collection.
const Leak = mongoose.model('Leak', leakSchema);

export default Leak;
