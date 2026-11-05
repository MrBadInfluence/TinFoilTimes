// CategoryNav.jsx — the row of category tabs.
//
// It does NOT remember which tab is selected. App remembers that and
// tells us through props:
//   categories -> the list of tab names
//   active     -> which one is selected right now
//   onSelect   -> a function to call when a tab is clicked
// Why keep the memory in App? Because App also needs to know the
// answer (to filter the leaks). One owner of the data = no confusion.
export default function CategoryNav({ categories, active, onSelect }) {
  // A link normally jumps the browser to a new page. preventDefault()
  // says "stop, don't do that" so we stay on our single page.
  function pick(event, value) {
    event.preventDefault();
    onSelect(value);
  }

  return (
    <nav className="categories">
      <a href="#" className={active === 'all' ? 'active' : ''} onClick={(e) => pick(e, 'all')}>
        ALL
      </a>

      {/* .map() = "make one <a> for every item in the list".
          key = a unique label so React can tell the items apart
          when the list changes (JSX gotcha #2: lists always need it). */}
      {categories.map((category) => (
        <a
          key={category}
          href="#"
          className={active === category ? 'active' : ''}
          onClick={(e) => pick(e, category)}
        >
          {category.toUpperCase()}
        </a>
      ))}
    </nav>
  );
}
