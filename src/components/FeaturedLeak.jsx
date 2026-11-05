// FeaturedLeak.jsx — the big front-page story.
// It receives ONE leak as a prop and displays it. It never changes
// the data itself; it only shows what it's handed.
import { formatDate } from '../utils.js';
import LinkedText from './LinkedText.jsx';
import VoteButtons from './VoteButtons.jsx';

export default function FeaturedLeak({ leak, onVoted }) {
  // submittedBy is blank in your JSON, so fall back to a default.
  // "||" means: use the left side, unless it's empty, then use the right.
  const filer = leak.submittedBy || 'an anonymous tipster';

  return (
    <article className="featured">
      {/* JSX gotcha #3: curly braces { } mean "run JavaScript here". */}
      <p className="kicker">{leak.category.toUpperCase()} — EXCLUSIVE</p>
      <h2>{leak.headline}</h2>
      <p className="lede">
        <LinkedText text={leak.body} linkText={leak.linkText} link={leak.link} />
      </p>
      <p className="byline">
        Filed by {filer} on {formatDate(leak.createdAt)} — Corroborated by absolutely nobody
      </p>
      <VoteButtons leak={leak} onVoted={onVoted} />
    </article>
  );
}
