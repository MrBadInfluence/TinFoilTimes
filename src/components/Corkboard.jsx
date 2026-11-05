// Corkboard.jsx — the "MOST REDACTED" pinboard in the sidebar.
// The notes are just a list, so we store them in an array and .map() them.
const NOTES = [
  { text: 'Bigfoot for City Council?!', handwritten: false },
  { text: 'connected somehow??', handwritten: true },
  { text: 'Moon = disco ball for aliens', handwritten: false },
  { text: 'it all makes sense now', handwritten: true },
];

export default function Corkboard() {
  return (
    <>
      <h4 className="sidebar-title">MOST REDACTED</h4>
      <div className="corkboard">
        <div className="red-string"></div>
        {NOTES.map((note) => (
          <div key={note.text} className={note.handwritten ? 'cork-note handwritten' : 'cork-note'}>
            {note.text}
          </div>
        ))}
      </div>
    </>
  );
}
