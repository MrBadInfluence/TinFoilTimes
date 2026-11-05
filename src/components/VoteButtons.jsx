// VoteButtons.jsx — the BELIEVE / DEBUNKED buttons under each leak.
//
// Written once, used on the featured story AND every card in the list
// (same idea as LeakCard: build the Lego brick once, click it in
// wherever it's needed).
import { useState } from 'react';

export default function VoteButtons({ leak, onVoted }) {
  // true while a vote is "in the post", so a frantic double-click can't
  // send the same vote twice before the first one comes back.
  const [sending, setSending] = useState(false);
  // Which button this visitor pressed (null = hasn't voted yet). One vote
  // per visit — after that both buttons grey out.
  const [voted, setVoted] = useState(null);
  const [error, setError] = useState(null);

  async function castVote(vote) {
    setSending(true);
    setError(null);

    try {
      // PATCH = "change one small part of something that already exists".
      // The leak's _id goes IN the address, so the server knows WHICH
      // leak; the body says WHICH counter to bump.
      const response = await fetch(`http://localhost:5000/api/leaks/${leak._id}/vote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote }),
      });

      // Same as TipForm: fetch only throws if the network dies, so a
      // 400/404/500 has to be checked by hand.
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      // The server sends back the leak WITH the new count. We hand it up
      // to App, which swaps it into its list — so the number on screen
      // is the real number from MongoDB, not a guess made in the browser.
      const updated = await response.json();
      onVoted(updated);
      setVoted(vote);
    } catch {
      setError('Vote lost in transit. Possibly intercepted.');
    } finally {
      setSending(false);
    }
  }

  // "?." (optional chaining) means: if leak.votes is missing for some
  // reason, give back undefined instead of crashing. "?? 0" then turns
  // that undefined into 0.
  const believe = leak.votes?.believe ?? 0;
  const debunked = leak.votes?.debunked ?? 0;
  const locked = sending || voted !== null;

  return (
    <div className="votes">
      <button
        type="button"
        className={voted === 'believe' ? 'chosen' : ''}
        disabled={locked}
        onClick={() => castVote('believe')}
      >
        BELIEVE ({believe})
      </button>
      <button
        type="button"
        className={voted === 'debunked' ? 'chosen' : ''}
        disabled={locked}
        onClick={() => castVote('debunked')}
      >
        DEBUNKED ({debunked})
      </button>
      {error && <span className="vote-error">{error}</span>}
    </div>
  );
}
