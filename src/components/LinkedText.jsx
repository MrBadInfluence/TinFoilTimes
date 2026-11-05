// LinkedText.jsx — shows a piece of text, turning one phrase into a link.
// JSON can only hold plain text, so a leak stores the words to link
// ("linkText") and where they go ("link") as separate fields. This
// component cuts the text around that phrase and puts an <a> in the gap.
export default function LinkedText({ text, linkText, link }) {
  // no link, or the phrase isn't in this text (e.g. cut off by shorten())
  if (!link || !linkText || !text.includes(linkText)) return text;

  const [before, ...after] = text.split(linkText);
  return (
    <>
      {before}
      <a href={link} target="_blank" rel="noopener noreferrer">{linkText}</a>
      {after.join(linkText)}
    </>
  );
}
