import { shorten } from '../utils.js';
import LinkedText from './LinkedText.jsx';
import VoteButtons from './VoteButtons.jsx';

// ONE card. Write it once, reuse it for every leak.
// onVoted is passed straight through to the buttons — the card itself
// doesn't care about votes, it just carries the message up to App.
function LeakCard({ leak, onVoted }) {
  return (
    <div className="leak">
      <div className="photo"></div>
      <div>
        <span className="category-tag">{leak.category.toUpperCase()}</span>
        <h3>{leak.headline}</h3>
        <p>
          <LinkedText text={shorten(leak.body)} linkText={leak.linkText} link={leak.link} />
        </p>
        <VoteButtons leak={leak} onVoted={onVoted} />
      </div>
    </div>
  );
}

// The whole list: one LeakCard per leak. If the list changes (like when
// a category tab is clicked), React redraws just the cards that changed.
export default function LeakList({ leaks, onVoted }) {
  return (
    <div className="leak-list">
      {leaks.map((leak) => (
        <LeakCard key={leak._id} leak={leak} onVoted={onVoted} />
      ))}
    </div>
  );
}
