// Masthead.jsx — the big newspaper title. It never changes, so it
// needs no props and no state: it's the simplest kind of component.
//
// HTML -> JSX gotcha #1: HTML's class="..." becomes className="..."
// because "class" is already a reserved word in JavaScript.
export default function Masthead() {
  return (
    <header className="masthead">
      <div className="eyebrow-row">
        <span>VOL. XIII — NO. 47</span>
        <span>PRICE: YOUR SANITY</span>
        <span>WEATHER: SUSPICIOUSLY CLEAR SKIES</span>
      </div>
      <h1>TIN FOIL TIMES</h1>
      <p className="tagline">"All the news they don't want you to read"</p>
      <div className="rule-thick"></div>
      <div className="rule-thin"></div>
    </header>
  );
}
