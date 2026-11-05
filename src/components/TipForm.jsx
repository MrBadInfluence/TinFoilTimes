// TipForm.jsx — the "GOT A TIP?" box.
//
// This is the first component that REMEMBERS things itself: what
// you've typed so far. In your storyboard this is Step 5.
import { useState } from 'react';
import { capitalise } from '../utils.js';

export default function TipForm({ categories }) {
  // One sticky note per thing we need to remember.
  const [codename, setCodename] = useState('');
  const [headline, setHeadline] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [leakText, setLeakText] = useState('');
  const [sent, setSent] = useState(false); // false = show the form, true = show RECEIVED
  const [sending, setSending] = useState(false); // true while the leak is "in the post"
  const [error, setError] = useState(null); // a message to show if sending failed

  // "async" because we have to WAIT for the server to answer before we
  // know whether to show RECEIVED or an error.
  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser reloading the page (that would break the SPA)
    // The database REQUIRES a headline and a body, so check both here
    // first — no point posting a letter we know will be sent back.
    if (headline.trim() === '' || leakText.trim() === '') {
      setError('A leak needs a headline AND a story. Even we have standards.');
      return;
    }

    // This object matches the request body in Section 4.3 of your doc.
    const newLeak = { headline, submittedBy: codename, category, body: leakText };

    setSending(true);
    setError(null);

    try {
      // fetch() GETs by default, so we spell out three things:
      //  - method: 'POST'  → "I'm sending you something new to save"
      //  - headers         → a label on the parcel saying "the contents are JSON"
      //                      (without it, the server's express.json() ignores the body)
      //  - body            → the leak itself, flattened into a JSON string,
      //                      because only text can travel over the network
      const response = await fetch('http://localhost:5000/api/leaks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeak),
      });

      // fetch only throws if the network itself fails. A 400 or 500 still
      // "succeeds" as far as fetch cares, so we check response.ok ourselves.
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      setSent(true); // only show RECEIVED once MongoDB has actually saved it
    } catch {
      setError("Your leak didn't get through. The backend may be down — or THEY intercepted it.");
    } finally {
      // "finally" runs whether it worked or not, so the button always
      // un-greys itself afterwards.
      setSending(false);
    }
  }

  function fileAnother() {
    setCodename('');
    setHeadline('');
    setCategory(categories[0]);
    setLeakText('');
    setError(null);
    setSent(false);
  }

  // After sending, the SAME box swaps its own contents. No reload.
  if (sent) {
    return (
      <div className="tip-box">
        <span className="stamp">RECEIVED</span>
        <p>Your leak has been filed anonymously. Do not look behind you.</p>
        <button type="button" onClick={fileAnother}>FILE ANOTHER REPORT</button>
      </div>
    );
  }

  return (
    <form className="tip-box" onSubmit={handleSubmit}>
      <h4>GOT A TIP?</h4>
      <p>We won't ask questions. Mostly because we can't — the phones are tapped.</p>

      {/* "Controlled input": the box shows whatever is in our sticky note
          (value), and every keystroke updates the note (onChange).
          React always knows exactly what's typed. */}
      {/* JSX gotcha #4: HTML's for="..." becomes htmlFor="..." */}
      <label htmlFor="codename">Your Codename</label>
      <input
        id="codename"
        type="text"
        placeholder="e.g. Agent Wobbly"
        value={codename}
        onChange={(e) => setCodename(e.target.value)}
      />

      {/* The schema says headline is REQUIRED, so the form must ask for it —
          otherwise MongoDB would reject every single tip. */}
      <label htmlFor="headline">Headline</label>
      <input
        id="headline"
        type="text"
        placeholder="e.g. Pigeons Seen Charging at Power Lines"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
      />

      <label htmlFor="cat">Category</label>
      <select id="cat" value={category} onChange={(e) => setCategory(e.target.value)}>
        {categories.map((c) => (
          <option key={c} value={c}>{capitalise(c)}</option>
        ))}
      </select>

      <label htmlFor="leak">Your Leak</label>
      <textarea
        id="leak"
        placeholder="Type your truth here..."
        value={leakText}
        onChange={(e) => setLeakText(e.target.value)}
      />

      {/* Only drawn when there IS an error. "&&" means: if the left side
          is empty (null), draw nothing; otherwise draw the right side. */}
      {error && <p className="empty-note">{error}</p>}

      {/* disabled while sending, so an impatient double-click can't
          file the same leak twice. */}
      <button type="submit" disabled={sending}>
        {sending ? 'TRANSMITTING...' : 'FILE REPORT ANONYMOUSLY'}
      </button>
    </form>
  );
}
