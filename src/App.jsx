import { useState, useEffect } from 'react';
import Masthead from './components/Masthead.jsx';
import BreakingBanner from './components/BreakingBanner.jsx';
import CategoryNav from './components/CategoryNav.jsx';
import FeaturedLeak from './components/FeaturedLeak.jsx';
import LeakList from './components/LeakList.jsx';
import Corkboard from './components/Corkboard.jsx';
import TipForm from './components/TipForm.jsx';
import Footer from './components/Footer.jsx';

const CATEGORIES = ['aliens', 'cryptids', 'government', 'animals', 'tech', 'celebrity', 'unexplained'];

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [leaks, setLeaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const controller = new AbortController();

    async function loadLeaks() {
      setLoading(true);
      setError(null);

      try {
        
        const params = new URLSearchParams({ sort: 'top' });
        if (activeCategory !== 'all') {
          params.set('category', activeCategory);
        }

        const response = await fetch(`http://localhost:5000/api/leaks?${params}`, {
          signal: controller.signal, 
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();
        setLeaks(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError("Couldn't reach the Tin Foil Times servers. Is the backend running?");
        }
      } finally {
        // "finally" runs even when this request was cancelled. By then, a
        // newer request has usually taken over and is still on its way.
        // It's like a relay race: a runner who has been told to stop must
        // not announce "race finished" while the next runner is still
        // running. So only a request that was NOT cancelled may switch
        // "Loading" off. Otherwise the old stories would appear under the
        // new tab until the new answer arrived.
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadLeaks();

    return () => controller.abort();
  }, [activeCategory]);

  // Called by VoteButtons after the server confirms a vote. The server
  // sends back the whole updated leak; we swap it into our list in
  // place of the old copy. .map() builds a NEW array (React only notices
  // a change if it gets a new array, not the old one edited) where every
  // leak stays the same EXCEPT the one whose _id matches.
  // We don't re-sort, so cards don't jump around under your mouse.
  function handleVoted(updated) {
    setLeaks((current) =>
      current.map((leak) => (leak._id === updated._id ? updated : leak))
    );
  }

  const featured = leaks[0];
  const rest = leaks.slice(1, 9);

  return (
    <div className="paper">
      <Masthead />
      <BreakingBanner />

      <CategoryNav
        categories={CATEGORIES}
        active={activeCategory}
        onSelect={setActiveCategory}
      />

      <div className="content-grid">
        <main>
          {/* Show exactly ONE of these three states at a time */}
          {loading && <p className="empty-note">Loading today's leaks...</p>}
          {error && <p className="empty-note">{error}</p>}
          {!loading && !error && (
            featured ? (
              <FeaturedLeak leak={featured} onVoted={handleVoted} />
            ) : (
              <p className="empty-note">No leaks filed under this category yet. Be the first to talk.</p>
            )
          )}
          {!loading && !error && <LeakList leaks={rest} onVoted={handleVoted} />}
        </main>

        <aside>
          <Corkboard />
          <TipForm categories={CATEGORIES} />
        </aside>
      </div>

      <Footer />
    </div>
  );
}