// leak.controller.js — the C in MVC. The actual WORK each route does.
//
// Think of a restaurant: the router (leak.routes.js) is the waiter who
// takes your order and walks it to the right cook. The controller is the
// cook. The model (leak.model.js) is the pantry the cook takes things
// from. The waiter never cooks, and the cook never takes orders.
import mongoose from 'mongoose';
import Leak from '../models/leak.model.js';

// GET /api/leaks — reads ?category= and ?sort= from the URL
export async function getLeaks(req, res) {
  try {
    // req.query is React's walkie-talkie message decoded into an object.
    // A URL like /api/leaks?category=cryptids&sort=top becomes:
    //   { category: 'cryptids', sort: 'top' }
    const { category, sort } = req.query;

    // "filter" is like telling the librarian which shelf to search.
    // An EMPTY filter {} means "search every shelf" (show everything).
    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Start building the database question, but don't ask it yet —
    // this lets us bolt on ".sort()" BEFORE we actually run it.
    let query = Leak.find(filter);

    // "votes.believe": -1 means "biggest number first" (descending).
    // This matches Step 1 in your storyboard: ?sort=top picks the
    // most-believed leak to be the featured front-page story.
    if (sort === 'top') {
      query = query.sort({ 'votes.believe': -1 });
    }

    const leaks = await query; // NOW we actually run it and wait for the answer
    res.json(leaks);
  } catch (error) {
    // Print the real reason in the server's terminal (for you), but only
    // send a vague message to the browser (for strangers). Never hand
    // database details to the public.
    console.error('GET /api/leaks failed:', error);
    res.status(500).json({ error: 'Server Error' });
  }
}

// POST /api/leaks — the tip form's "post box". A new leak arrives here
// and gets saved into MongoDB.
export async function createLeak(req, res) {
  try {
    // req.body is the JSON the form sent, already unpacked into an object
    // by express.json() in server.js.
    //
    // We pick out ONLY the four fields a tipster is allowed to fill in.
    // If we passed req.body straight to the database, a sneaky visitor
    // could send { votes: { believe: 999999 } } and rig the front page.
    // votes, comments, createdAt and _id are left out on purpose — the
    // schema's defaults fill those in fresh (0 votes, today's date).
    // "|| {}" stops a crash if someone sends no body at all.
    const { headline, body, category, submittedBy } = req.body || {};

    // Leak.create() is "fill in the form AND post it" in one step: it
    // checks the leak against the schema (headline required, etc.) and,
    // if it passes, saves it into MongoDB.
    const newLeak = await Leak.create({ headline, body, category, submittedBy });

    // 201 = "Created" — more precise than 200 ("OK"). We send the saved
    // leak back so the caller can see the _id MongoDB gave it.
    res.status(201).json(newLeak);
  } catch (error) {
    // A ValidationError means the leak broke the schema's rules — a
    // missing headline, say. That's the SENDER's mistake, so 400, and
    // we list exactly which fields were wrong so they can fix them.
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        fields: Object.keys(error.errors) // e.g. ["headline", "body"]
      });
    }
    // Anything else (database down, etc.) is OUR problem: 500.
    console.error('POST /api/leaks failed:', error);
    res.status(500).json({ error: 'Server Error' });
  }
}

// PATCH /api/leaks/:id/vote — the BELIEVE / DEBUNKED buttons.
// Send { "vote": "believe" } or { "vote": "debunked" } and that counter
// goes up by one.
//
// Why PATCH and not PUT? PUT means "here is the WHOLE leak, replace it".
// PATCH means "change just this one little bit". A vote only touches one
// number, so PATCH is the honest word for it.
export async function voteOnLeak(req, res) {
  try {
    // ":id" in the route becomes req.params.id — the leak's _id, taken
    // straight out of the address, e.g. /api/leaks/6650ab.../vote
    const { id } = req.params;
    const { vote } = req.body || {};

    // An allow-list: ONLY these two words are accepted. Without it,
    // someone could send { "vote": "headline" } and we'd try to "add 1"
    // to the headline. Like a ballot paper with only two boxes on it.
    if (vote !== 'believe' && vote !== 'debunked') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Vote must be "believe" or "debunked". There is no third option. That is what THEY want you to think.'
      });
    }

    // A MongoDB _id has a strict shape (24 hex characters). Checking it
    // first means "abc" gets a clear 400 ("that's not even an id")
    // instead of a confusing crash deeper down.
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Bad Request', message: 'That is not a valid leak id.' });
    }

    // $inc = "increase by". MongoDB does the +1 itself, INSIDE the
    // database, in one step. If we instead read the number, added 1 in
    // JavaScript, and saved it back, two people voting at the same
    // instant could both read 5, both save 6, and one vote would vanish.
    // $inc can't lose votes that way.
    //
    // The [`votes.${vote}`] in square brackets builds the field name from
    // the vote word: 'believe' → 'votes.believe'.
    //
    // returnDocument: 'after' = "send me the leak AFTER the +1", so the
    // page can show the new count straight away.
    const updated = await Leak.findByIdAndUpdate(
      id,
      { $inc: { [`votes.${vote}`]: 1 } },
      { returnDocument: 'after' }
    );

    // A valid-looking id that doesn't match any leak gives back null.
    // That's a 404: the address is fine, but nothing lives there.
    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'No leak with that id. It has been... removed.' });
    }

    res.json(updated); // 200 OK + the updated leak
  } catch (error) {
    console.error('PATCH /api/leaks/:id/vote failed:', error);
    res.status(500).json({ error: 'Server Error' });
  }
}
